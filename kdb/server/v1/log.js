/**
 * 日志，info仅用于开发，warn,error写入日主文件，
 * 格式：time [warn] [mod] ip : JSON.stringify(msg)
 */
var c; // config
var fs = require("fs");
var cache = require('./cache');
var u = require('./utils');

//写日志文件
function appendFile(text){
	fs.appendFile(c.Log.dir+cache.day_cache('date-month'),text,'utf8',function(err){});
}
//日志内容格式
function text(msg,mod,ip,level){
	return u.getTimeFormat(0,'dt')+' ['+level+'] ['+mod+'] '+(ip || 'local')+' : '+JSON.stringify(msg)+'\n';
}

//初始化
function init(config){
	if(c) return;
	c = config;
}
function info(msg,mod,ip){
	if(c.Log.dir){
//		if(msg) write_file(u.getTimeFormat()+' [error] '+msg+'\n');
//		if(obj) write_file(u.getTimeFormat()+' [error] '+JSON.stringify(obj)+'\n'); 
	}else {
		console.log('['+mod+'] ',msg); 
	}
}
//
function warn(msg,mod,ip){
	if(c.Log.dir){
		appendFile(text(msg,mod,ip,'warn')); 
	}else {
		console.log('['+mod+'] ',msg); 
	}
}
//error需要发短信报警（每天不超过10条）,暂不使用
function err(msg,mod,ip){
	if(c.Log.dir){
		appendFile(text(msg,mod,ip,'err ')); 
	}else {
		console.log(text(msg,mod,ip,'warn').replace('\n','')); 
		console.dir(mod);
	}
}

exports.info = info;
exports.warn = warn;
exports.err = err;
exports.init = init;
