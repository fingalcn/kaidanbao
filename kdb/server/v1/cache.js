/**
 * cache 缓存：1，dayCache每天凌晨3点清空。2，perCache服务器重启时清空
 * key命名规则，前缀-特征值
 * date-日期，【day,month】
 * loginpwderrtimes-登录密码错误次数，【{loginname}】
 * findboxidtimes-boxID新建次数，【{loginname}】
 * token-会话令牌，【{u-s-b}】
 * login-已登录用户，【{u-s}】
 * code-短信验证码，【{type+loginname}】
 * smserrtimes-短信验证错误次数，【{type+loginname}】
 * smssendtimes-短信发送次数，【{loginname}】
 * ------------------------------------------
 * staff-登录用户表，【{si}{loginname}】
 * user-公司表，【{ui}】
 * cdkey-序列号表，仅存可用值，【{key}】
 * mclerk-管理职员表，【{number}】
 * mproduct-管理商品表，【{number}】
 */
var c;
var log = require('./log');
var u = require('./utils');
var timer = require('./timer');
var fs = require('fs');

var dayCache={};//每天清空
var dayCacheChanged=true;
var perCache={};//永久缓存

//获取、设置、删除dayCache
function day_cache(key,value){
	if(key){
		if(value || value === 0){
			dayCacheChanged=true;
			dayCache[key] = value;
		}else {
			if(value === '') delete dayCache[key]
			else return dayCache[key] || '';
		}
	}else return dayCache || '';
}
//获取、设置、删除perCache
function per_cache(key,value){
	if(key){
		if(value || value === 0){
			perCache[key] = value;
		}else {
			if(value === '') delete perCache[key]
			else return perCache[key] || '';
		}
	}else return perCache || '';
}

function init(config){
	if(c) return;
	c = config;
	//读文件到day_cache
	fs.readFile((c.Log.dir || (__dirname+'/../../../'))+'daycache', 'utf8', function (err, data) {
		if(data){//
			dayCache = JSON.parse(data);
			dayCache['date-day'] = u.getDay();
			dayCache['date-month'] = u.getDay().substr(0,7);
		}
	});
	//重置临时缓存
	timer.set_task('cache.reset_day_cache',function(count){
		if(count === 110){//凌晨3点清空所有dayCache
			dayCache={};
			dayCache['date-day'] = u.getDay();
			dayCache['date-month'] = u.getDay().substr(0,7);
		}
	});
	timer.set_task('cache.day_cache_to_file',function(){//写文件
		if(dayCacheChanged) {
			dayCacheChanged = false;
			fs.writeFile((c.Log.dir || (__dirname+'/../../../'))+'daycache',JSON.stringify(dayCache) ,{encoding:'utf-8'},function(err){
				if(err) {
					log.warn(err,'cache.day_cache_to_file');
					dayCacheChanged = true;
				}
			});
		}
	});
}

exports.init = init;
exports.day_cache = day_cache;
exports.per_cache = per_cache;
