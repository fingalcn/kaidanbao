/**
 * 业务逻辑，主要接口
 */
var u=require('./utils');
var cache =require('./cache');
var safe =require('./safe');
var sse =require('./sse');
var timer =require('./timer');

var log = require('./log');
var c,adminDB,userDB;

//cdkey的期限值（首字母：天）
var cdkey_due_map={S:366,K:366,H:366};
//新增更新管理customer
function upset_customer(ur,comp,cdkey){
	var user = cache.per_cache('user-'+ur._id);
	if(user && user.customer_id){
		//更新
		var customer={_id:user.customer_id,tp:'f'};
		if(ur.inc) customer.name = (ur._id+'-'+ur.inc);
		if(ur.safe_mobile) customer.remark = ur.safe_mobile;
		if(ur.staff_len) customer.number = ur.staff_len;
		
		if(ur.customer_id) userDB.updOne(customer,comp);
		else comp(user.customer_id);
	}else{
		var clerk;
		if(cdkey){
			clerk = cache.per_cache('mclerk-'+cdkey.substr(1,2)) || {};
		}
		adminDB.findNextBox(function(uid){
			ur._id = uid;
			//新增
			userDB.addOne({tn:'customer', tp:'f', ui:c.manage.ui, si:1, ct:u.getNow(),
				address:ur.ip,number:(ur.staff_len||1),saler_id:clerk._id,
				name:(ur._id+'-'+(ur.inc || 'inc')),remark:ur.safe_mobile}
			,comp);
		},'user_id',ur._id);
	}
}
//新建管理销售单
function add_salebill(cdkey,type,customer_id,comp){
	var map={K:'',S:'-try',H:'-half'}
	var prodtype=type+map[cdkey[0]];
	var prod = cache.per_cache('mproduct-'+prodtype);
	var price = parseFloat(prod.price);
	var clerk = cache.per_cache('mclerk-'+cdkey.substr(1,2)) || {};
	var now = u.getNow();
	if(prod){
		userDB.addOne({
			tn : "salebill", tp : "d",ct : now, si : clerk.bind_si||1, ui : c.manage.ui,
			account_id:c.manage.aid,repository_id:c.manage.rid,order_id:clerk._id,
			saler_id:clerk._id,settlement : "q",customer_id : customer_id,
			amount : price, count : 1,detail : [[prod._id,cdkey,1,price,price,'',price*0.6]],
			number : "XS-"+(clerk.bind_si||1)+"-"+u.getTimeFormat(now,'dt').replace(/-/g,'').replace(/:/g,'').replace(/ /g,'-'),
		},comp);
	}
}
//新建用户clerk
function add_clerk(staff,comp,bc){
	if(bc){
		comp({_id:bc});
	}else{
		var clerk={ui:staff.ui, tp :"f",st:'f',tn:'clerk',ct : u.getNow(), si : staff.si,name:staff.nick||'职员'+staff+si,number:staff.si};
		userDB.addOne(clerk,function(id){
			if(id){
				clerk._id = id;
				comp(clerk);
			}else comp();
		});
	}
}
//-------------------------------------------------------------
function upset_user(user,comp,cdkey){
	var update = user._id;
	upset_customer(user,function(cid){
		user.customer_id = cid;
		if(update){//更新
			adminDB.updOne('user', user, function(id){
				if(id) {
					u.extend(cache.per_cache('user-'+id),user,true);
				}
				comp(id);
			});
		}else{//新增
			adminDB.addOne('user', user, function(id){
				if(id) {
					user._id = id;
					cache.per_cache('user-'+id,user);
				}
				comp(id);
			});
		}
	},cdkey);
}
function upset_staff(staff,comp){
	var oldstaff = cache.per_cache('staff-'+staff.loginname) || cache.per_cache('staff-'+staff._id) || {};
	var user = cache.per_cache('user-'+(oldstaff.ui || staff.ui));
	if(staff.cdkey){//续费
		staff.renewstory = oldstaff.renewstory || [];
		staff.due = u.getDay(cdkey_due_map[staff.cdkey[0]],oldstaff.due);
		var min = u.getDay(cdkey_due_map[staff.cdkey[0]]);
		if(staff.due < min) staff.due = min;
		staff.renewstory.push([u.getNow(),staff.due,staff.cdkey]);
	}
	if(oldstaff._id){//更新
		staff._id = oldstaff._id; 
		adminDB.updOne('staff', staff, function(id){
			if(id){
				if(staff.due) {//续费订单
					add_salebill(staff.cdkey,'renewal',user.customer_id,function(){});
				}
				if(staff.loginname) {
					cache.per_cache('staff-'+staff.loginname,oldstaff);
					cache.per_cache('staff-'+oldstaff.loginname,'');
					var upduser = {_id:oldstaff.ui};
					upduser['staff'+oldstaff.si] = staff.loginname;
					upset_user(upduser,function(){});
				}
				u.extend(oldstaff,staff,true);
			}
			comp(id);
		});
	}else{//新增
		adminDB.addOne('staff', staff, function(id){
			if(id){
				staff._id = id;
				cache.per_cache('staff-'+staff.loginname,staff);
				cache.per_cache('staff-'+staff._id,staff);
				
				//增加管理订单
				if(staff.si === 1){//注册
					add_salebill(staff.cdkey,'register',user.customer_id,function(){});
				}else{//新增用户
					add_salebill(staff.cdkey,'addstaff',user.customer_id,function(){});
					console.dir(staff);
					
					var upduser = {_id:staff.ui,staff_len:staff.si,customer_id:user.customer_id};
					upduser['staff'+staff.si] = staff.loginname;
					upset_user(upduser,function(){});
				}
			}
			comp(id);
		});
	}
}
function del_cdkey(ck){
	var cdkey = cache.per_cache('cdkey-'+ck);
	adminDB.updOne('cdkey', {_id:cdkey._id,st:'u'}, function(){});
	cache.per_cache('cdkey-'+ck,'');
}
//=============================================================
//登录记录
function loginHistroy(ur){
	if((cache.day_cache['date-day']&2) === (ur._id%2)){
		upset_customer({_id: ur._id,customer_id:ur.customer_id},function(){});//更新管理customer
	}
}
//清理过期的设备
function clear_device(user,staff,box_id){
	var bid,dv,change=false;//'bi'+box_id
	for(bid in staff.devices){ 
		dv = staff.devices[bid];
		dv.lm = dv.lm || 1488966117758;//2017-3-8
		if(dv.bi===box_id) {
			dv.lm = u.getNow();
			if(user.devices[bid]) {
				user.devices[bid].lm = dv.lm;
				user.devices[bid].mi = staff.si;
			}
		}
		console.log(dv.lm);
		if(u.getNow()-dv.lm > 16243200000){//超过188天的设备要删除
			delete staff.devices[bid];
			change = true;
		}
 	}
	if(change){
		upset_staff({_id:staff._id,devices:staff.devices},function(){});
		for(bid in user.devices){
			dv = user.devices[bid];
			dv.lm = dv.lm || 1488966117758;//2017-3-8
			if(dv.bi===box_id) dv.lm = u.getNow();
			if(u.getNow()-dv.lm > 16243200000){//超过188天的设备要删除
				delete user.devices[bid];
			}
	 	}
		upset_user({_id:user._id,devices:user.devices},function(){});
	}
}
//发送验证码（登录和找回密码，无需session）
function sendsms(req_json,comp){
	var p = req_json.p,dv=p.device||{};
	var staff = cache.per_cache('staff-'+p.loginname);
	if(p.type === 'login' || p.type === 'forget'){
		if(staff){
			var user = cache.per_cache('user-'+staff.ui);
			if(user && user.safe_mobile){
				safe.sendsms(p.loginname,p.type,function(msg){
					if(msg) comp(400,msg);
					else comp(200,'ok',{mobile:u.getSafeMobile(user.safe_mobile)});
				},null,dv.bi);
			}else comp(400,'用户未设置手机号码！');
		}else comp(400,'用户名不存在！');
	}else comp(400,'?');
}
//登陆
function login(req_json,comp){
	safe.login_check(req_json,function(errmsg,staff,token,device){
		if(errmsg){
			if(staff) comp(200,errmsg,{needcode:1});
			else comp(400,errmsg);
		}else{
			var ur = cache.per_cache('user-'+staff.ui),sf;
			
			if(device) {//新设备
				ur.devices = ur.devices || {};
				staff.devices = staff.devices || {};
				ur.devices['bi'+device.bi]=device;
				staff.devices['bi'+device.bi]=device;
				
				device.ip = req_json.s.ip;
				device.lm = u.getNow();
				device.mi = staff.si;
				
				upset_user({_id:ur._id,devices:ur.devices},function(){});
				upset_staff({_id:staff._id,devices:staff.devices},function(){});
			}else {
				device = req_json.p.device;
				
				device.lm = u.getNow();
				device.mi = staff.si;
			}
			
			clear_device(ur,staff,device.bi);
			
			var user={_id: ur._id, ct: ur.ct, inc: ur.inc,customer_id:ur.customer_id,devices:ur.devices,printlogo:ur.printlogo};
			if(ur.safe_mobile) user.safe_mobile = u.getSafeMobile(ur.safe_mobile);
			user.staff_len = (ur.staff_len || 1);
			for(var i=1;i<=user.staff_len;i++){
				sf = cache.per_cache('staff-'+ur['staff'+i]);
				user['staff'+i]={_id:sf._id,loginname : sf.loginname, si: i, nick: sf.nick,devices:sf.devices||{},
						bind_clerk:sf.bind_clerk,ct: sf.ct, st: sf.st, due: sf.due, role: sf.role};
			}
			//挤出其他相同登录者
			sse.close(cache.day_cache('login-'+user._id+'-'+staff.si),'nyzbcdl');
			comp(200,'ok',{due:staff.due, staff_id: staff.si, device: device ,token: token,user: user,online:sse.get_sses_ui(ur._id) });
			//记录、清理
			loginHistroy(ur);
		}
	});
}
//安全退出
function exit(req_json,comp){
	var p = req_json.p;
	if(p.safe){
		var ur = cache.per_cache('user-'+p.ui);
		ur.devices = ur.devices || {};
		delete ur.devices['bi'+p.bi];
		upset_user({_id:ur._id,devices:ur.devices},function(){});
	}
	comp(200,'ok');
}
//未登录续费
function xufei(){
	
}
//检查用户名是否已使用
function checkloginname(req_json,comp){
	var p = req_json.p;
	if(p.loginname){
		comp(200,'ok',{loginname:p.loginname,used:(cache.per_cache('staff-'+p.loginname)?1:0)});
	}else  comp(400,'?');
}
//注册
function register(req_json,comp){
	var p = req_json.p;
	if(p.cdkey){
		var cdkey = cache.per_cache('cdkey-'+p.cdkey);
		if(cdkey && cdkey.st !== 'u'){
			upset_user({ip:req_json.s.ip,staff_len:1,inc:p.inc,staff1:p.loginname},function(ui){
				if(ui){
					var staff = {ui:ui,si:1,nick:'总裁',loginname:p.loginname,login_pwd:safe.md5(p.password),cdkey:p.cdkey};
					add_clerk(staff,function(clerk){
						if(clerk){
							staff.bind_clerk=clerk._id;
							upset_staff(staff,function(sid){
								if(sid) {
									comp(200,'注册成功！');
									del_cdkey(p.cdkey);
								}else comp(500,'注册失败，请重试！');
							});
						}else comp(500,'注册失败，请重试！');
					});
				}else comp(500,'注册失败，请重试！');
			},p.cdkey);
		}else comp(400,'序列号有误，请检查！');
	}else comp(400,'?');
}
//重置密码
function forget(req_json,comp){
	var p = req_json.p;
	var staff = cache.per_cache('staff-'+p.loginname);
	if(staff){
		var user = cache.per_cache('user-'+staff.ui);
		if(user && user.safe_mobile){
			var msg1 = safe.code_check(p.loginname,'forget',p.code);
			if(msg1){
				comp(400,msg1);
			}else {
				upset_staff({_id:staff._id,login_pwd:safe.md5(p.password)},function(id){
					cache.day_cache('code-'+user.safe_mobile,0);
					if(id) comp(200,'ok');
					else comp(500,'操作失败！');
				});
			}
		}else comp(400,'用户未设置手机号码！');
	}else comp(400,'用户名不存在！');
}
//修改user
function upduser(req_json,comp){
	var p = req_json.p;
	if(p._id){
		var old_user = cache.per_cache('user-'+p._id);
		var user={_id:p._id,customer_id:old_user.customer_id};
		if(p.safe_mobile){
			//修改安全手机号
			if(p.code){//已发送短信
				var mssg = safe.code_check(p.loginname,'setmobile',p.code)
				if(mssg){
					comp(400,mssg);
					return;
				}
			}else{//未发送短信
				safe.sendsms(p.loginname,'setmobile',function(msg){
					if(msg){
						comp(400,msg);
					}else comp(200,'ok',{mobile:u.getSafeMobile(p.safe_mobile)});
				},p.safe_mobile);
				return;
			}
			user.safe_mobile = p.safe_mobile;
		}
		if(p.inc) user.inc = p.inc;
		if(p.devices) user.devices = p.devices;
		if(p.printlogo) user.printlogo = p.printlogo;
		upset_user(user,function(id){
			if(id) comp(200,'ok',{code:0});
			else comp(500,'操作失败！');
		});
	}
}
//修改staff
function updstaff(req_json,comp){
	var p = req_json.p;
	if(p._id){
		if(p.loginname && cache.per_cache('staff-'+p.loginname)){
			comp(400,'此账户名已被注册！');
		}else{
			var staff={_id:p._id};
			if(p.nick) staff.nick = p.nick;
			if(p.password) {
				var msg = safe.login_pwd_check({_id:p._id,password:p.old_pwd});
				if(msg) {
					comp(400,msg);
					return;
				}
				staff.login_pwd = safe.md5(p.password);
			}
			if(p.loginname) staff.loginname = p.loginname;
			if(p.bind_clerk) staff.bind_clerk = p.bind_clerk;
			if(p.devices) staff.devices = p.devices;
			if(p.role) staff.role = p.role;
			upset_staff(staff,function(id){
				if(id) comp(200,'ok');
				else comp(500,'操作失败！');
			});
		}
	}else comp(400,'?');
}
//续期staff
function renewal(req_json,comp){
	var cdkey = cache.per_cache('cdkey-'+req_json.p.cdkey);
	if(cdkey && cdkey.st !== 'u'){
		var staff = cache.per_cache('staff-'+req_json.p.loginname);
		if(staff){
			upset_staff({_id:staff._id,cdkey:req_json.p.cdkey},function(si){
				if(si) {
					comp(200,'ok',{due:staff.due});
					del_cdkey(req_json.p.cdkey);
				}else comp(500,'操作失败');
			});
		}else comp(400,'?');
	}else comp(400,'序列号不对，请检查');
}
//新增staff
function addstaff(req_json,comp){
	var p = req_json.p;
	var oldstaff = cache.per_cache('staff-'+p.loginname);
	if(oldstaff){
		comp('400','用户名重复');
		return;
	}
	var user = cache.per_cache('user-'+p.ui);
	var cdkey = cache.per_cache('cdkey-'+p.cdkey);
	if(user && cdkey && cdkey.st != 'u'){
		var staff = {ui:p.ui,si:user.staff_len+1,loginname:p.loginname,cdkey:p.cdkey,
				nick:p.nick,login_pwd:safe.md5(p.password),role:p.role};
		p.nick = p.nick || '职员'+staff.si;
		add_clerk(staff,function(clerk){
			if(clerk){
				staff.bind_clerk = clerk._id;
				upset_staff(staff,function(id){
					if(id){
						var sf = cache.per_cache('staff-'+id);
						var outstaff ={_id:sf._id,loginname : sf.loginname, si: sf.si, nick: sf.nick,
								bind_clerk:sf.bind_clerk,ct: sf.ct, st: sf.st, due: sf.due, role: sf.role};
						comp(200,'ok',{staff:outstaff,clerk:clerk});
						del_cdkey(p.cdkey);
					}else comp(500,'操作失败');
				});
			}else comp(500,'操作失败');
		},p.bind_clerk);
	}else comp(500,'操作失败');
}

//初始化
function init(config){
	if(c) return;
	c = config;
	userDB = require('./dao').user;
	adminDB = require('./dao').admin;
	setTimeout(function(){
//		users={},staffs={},cdkeys={},manages={product:{},clerk:{}};
		//初始化
		adminDB.find('cdkey',{},function(docs){
			if(docs){
				for(var i in docs){
					if(docs[i].st != 'u') cache.per_cache('cdkey-'+docs[i].k,docs[i]);
				}
			}
			log.info(docs,'cache.init-cdkey');
		});
		adminDB.find('user',{},function(docs){
//			log.info(docs,'cache.init-user');
			if(docs){
				for(var i in docs){
					cache.per_cache('user-'+docs[i]._id,docs[i]);
				}
			}
		});
		adminDB.find('staff',{},function(docs){
			if(docs){
				for(var i in docs){
					cache.per_cache('staff-'+docs[i].loginname,docs[i]);
					cache.per_cache('staff-'+docs[i]._id,docs[i]);
				}
			}
			log.info(docs,'cache.init-staff');
		});
		userDB.findManyWithinTimeFrame({ui:c.manage.ui,tp:'f'},function(docs){
			var val;
			for(var i in docs){
				val = docs[i];
				if(val.tn == 'product'){
					cache.per_cache('mproduct-'+val.number,val);
				}else if(val.tn == 'clerk'){
					cache.per_cache('mclerk-'+val.number,val);
				}
			}
//			log.info(docs,'cache.init-manage');
		});
	}, 5000);
}
exports.sendsms = sendsms;
exports.login = login;
exports.checkloginname = checkloginname;
exports.register = register;
exports.forget = forget;

exports.exit = exit;
exports.xufei = xufei;

exports.renewal = renewal;
exports.addstaff = addstaff;
exports.updstaff = updstaff;
exports.upduser = upduser;
exports.init = init;