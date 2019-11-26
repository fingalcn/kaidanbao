/**
 * safe 安全
 */
var crypto = require('crypto');
var log =require('./log');
var cache =require('./cache');
var timer =require('./timer');
var u =require('./utils');
var fs = require('fs'),c;
var sms = require( './alidayu/sms' );

function md5(str){
	return crypto.createHash('md5').update(str).digest('hex');
}
function check_session(req_json){
	if(cache.day_cache('token-'+req_json.s.ui+'-'+req_json.s.si+'-'+req_json.s.bi)===req_json.s.token
			 && req_json.s.token) return true;
}
/**
 * 验证短信码
 */
function code_check(loginname,type,code){
	var limit = cache.day_cache('smserrtimes-'+type+loginname) || 0;
	if(limit <= 3){
		if(code && cache.day_cache('code-'+type+loginname) == code){
			cache.day_cache('code-'+type+loginname,'');
			return;
		}else{
			cache.day_cache('smserrtimes-'+type+loginname,limit+1);
			return '验证码错误！';
		}
	}else return '请重新获取验证码！';
}
function login_pwd_check(p){
	var staff = cache.per_cache('staff-'+(p._id || p.loginname));
	var pwd_err_times = cache.day_cache('loginpwderrtimes-'+staff.loginname) || 0;
	if(pwd_err_times >= 8){
		if(pwd_err_times == 8){
			cache.day_cache('loginpwderrtimes-'+staff.loginname,9);
			timer.set_later('safe.clear_loginpwderrtimes-'+staff.loginname,function(name,cac){
				cac.day_cache('loginpwderrtimes-'+name.split('-')[1],0);
			},18);
		}
		return '密码错误太多，请半小时后再试！';
	}else{
		if(p.password && (staff.login_pwd === md5(p.password))){
			return;
		}else{
			cache.day_cache('loginpwderrtimes-'+staff.loginname,pwd_err_times+1);
			return '用户名或密码错误！';
		}
	}
}
function login_check(req_json,comp){
	var p=req_json.p;
	if(p.loginname){
		var pwd_err_times = cache.day_cache('loginpwderrtimes-'+p.loginname) || 0;
		var box_times = cache.day_cache('findboxidtimes-'+p.loginname) || 0;
		var staff = cache.per_cache('staff-'+p.loginname);
		var user = cache.per_cache('user-'+staff.ui);
		var d_user = user.devices || {};
		var d_staff = staff.devices || {};
		var checked_code=false;
		
		//密码输错多次需要发送短信
		var pwd_err_msg,code_err_msg;
//		if(pwd_err_times >= 5 && pwd_err_times < 8 && user.safe_mobile){
//			if(d_user['bi'+p.device.bi] && d_staff['bi'+p.device.bi]){
//				if(p.code){
//					code_err_msg = code_check(p.loginname,'login',p.code);
//					if(code_err_msg) {
//						comp(code_err_msg);
//						return;
//					}else {
//						checked_code = true;
//						cache.day_cache('loginpwderrtimes-'+staff.loginname,1);
//					}
//				}else{
//					comp('密码错误过多！',1);
//					return;
//				}
//			}else {
//				comp('密码错误太多，请明天重试');
//				return;
//			}
//		}
		pwd_err_msg = login_pwd_check(p);
		if(pwd_err_msg){
			comp(pwd_err_msg);
			log.warn('密码错误：'+p.loginname,'safe.login_check',req_json.s.ip);
		}else if(box_times >= 5){
			comp('您操作过于频繁，请半小时后再试');
			if(box_times == 5){
				cache.day_cache('findboxidtimes-'+p.loginname,6);
				timer.set_later('safe.clear_findboxidtimes-'+p.loginname,function(name,cac){
					cac.day_cache('findboxidtimes-'+name.split('-')[1],0);
				},18);
			}
			log.warn('新增box_id超限：'+p.loginname,'safe.login_check',req_json.s.ip);
		}else{
			var token = Math.random()*100000*Math.random()*100000;
			//检查设备安全
			if(d_user['bi'+p.device.bi] && d_staff['bi'+p.device.bi]){//安全常用设备
				cache.day_cache('token-'+staff.ui+'-'+staff.si+'-'+p.device.bi,token);
				comp(null,staff,token);
			}else{
				if(p.code){
					if(!checked_code){
						code_err_msg = code_check(p.loginname,'login',p.code);
						if(code_err_msg){
							comp(code_err_msg);
							return;
						}
					}
				}else if(user.safe_mobile){
//					comp('设备更新！',1);
//					return;
				}
				
				if(d_user['bi'+p.device.bi]){
					cache.day_cache('token-'+staff.ui+'-'+staff.si+'-'+p.device.bi,token);
					comp(null,staff,token,d_user['bi'+p.device.bi]);
				}else {
					cache.day_cache('findboxidtimes-'+p.loginname,box_times+1);
					require('./dao').admin.findNextBox(function(box_id){
						if(box_id){
							p.device.bi = box_id;
							cache.day_cache('token-'+staff.ui+'-'+staff.si+'-'+box_id,token);
							comp(null,staff,token,p.device);
						}else {
							log.warn('获取box_id失败','safe.login_check-get_box_id',req_json.s.ip);
							comp('登录失败！');
						}
					});
				}
			}
		}
	}else{
		log.warn('用户名为空','safe.login_check',req_json.s.ip);
		comp('?');
	}
}
/** 发送短信验证码，修改登录密码需要安全手机号，修改安全手机号需要登录密码
 * 1，设置安全手机号
 * 2，重置密码
 * 3，登录
 * @type - login,forget,setmobile,notychangemobile
 */
function sendsms(loginname,type,comp,mobile,box_id){
	var limit = cache.day_cache('smssendtimes-'+loginname) || 0;
	if(limit < 5){
		var staff = cache.per_cache('staff-'+loginname);
		var user  = cache.per_cache('user-'+staff.ui);
		if(user.safe_mobile || mobile){
			if(type === 'forget'){//找回密码时，不常用设备每天最多1条短信
				var d_user = user.devices || {};
				var d_staff = staff.devices || {};
				if(limit >= 1){
					if(!d_user['bi'+box_id] || !d_staff['bi'+box_id]){
						comp('今天发送短信过多，请明天重试！');
						return;
					} 
				} 
			}
			cache.day_cache('smssendtimes-'+loginname,limit+1);
			var code = new Date().getTime() % 8988 +1000;
			sms.sendNum(code,loginname,mobile||user.safe_mobile,c.SMS['temp_'+type],function(error, response){
				if(response && response.result && response.result.success){//成功
					cache.day_cache('smserrtimes-'+type+loginname,0);
					cache.day_cache('code-'+type+loginname,code);
					//十分钟有效
					timer.set_later('safe.clear_code-'+type+loginname,function(name,cac){
						cac.day_cache('code-'+name.split('-')[1],'');
					},6);
					comp();
				}else comp('短信发送失败，请刷新重试！');
			});
		}else comp('无法发送手机短信！');
	}else comp('今天发送太多，请明天重试！');
}
function init(config,comp){
	if(c) {comp();return;}
	c = config;
	if(c.Mode != 'develop'){
		var restart_map,now = u.getTimeFormat(0,'dt').split(' '),file=c.Log.dir+'restart';
		fs.readFile(file, 'utf8', function (err, data) {
			log.warn('restart:'+data,'safe.init');
			if(err) log.warn(err,'safe.init-readFile');
			if(data) restart_map = JSON.parse(data);
			else restart_map={};
			if(!restart_map[now[0]]) restart_map[now[0]]=[];
			if(restart_map[now[0]].length < 10) {
				restart_map[now[0]].push(now[1]);
				comp(true);
				sms.init(c);
				sms.sendNum(null,c.Mode+'-'+restart_map[now[0]].length,c.SMS.safe_mobile,c.SMS.temp_notyrestart,function(err) {
					if(err) log.warn(err,'safe.init-sms');
				});
			}else {
				comp(false);
			}
			fs.writeFile(file,JSON.stringify(restart_map) ,{encoding:'utf-8'},function(err,r){
				if(err) log.warn(err,'safe.init-writeFile');
			});
		});
	}else comp(true);
}

exports.init = init;
exports.md5 = md5;
exports.check_session = check_session;
exports.sendsms = sendsms;

exports.login_check = login_check;
exports.code_check = code_check;
exports.login_pwd_check = login_pwd_check;
