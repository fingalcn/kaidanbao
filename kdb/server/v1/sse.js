/**
 * sse 服务器推送
 */
var c;
var log = require('./log');
var u = require('./utils');
var timer = require('./timer');
var cache =require('./cache');
var sses={};//u-s-b:sse
var sses_ui={};//ui-1:{u-s-b:1}

function get_sses_ui(ui){
	return sses_ui['ui-'+ui];
}
//sse下线
function logout(sse,msg){
	if(sse) sse.end('data: {"type":"logout","value":"'+(msg||'会话超时，请重新登录！')+'"}\r\n\r\n');
}
//sse同步
function send(sse,value,type){
	if(sse) sse.write("data:"+JSON.stringify({type:type,value:value})+"\r\n\r\n");
}
//推送，广播
function broad(type,value,self,target){
	if(target){//点对点推送消息
		
	}else{//广播
		for(var key in (sses_ui['ui-'+self.split('-')[0]]||{})){
			if(key != self) send(sses[key],value,type);
		}
	}
}

//新增sse连接
function add(u_s_b,res){
	var usb = u_s_b.split('-');
	cache.day_cache('login-'+usb[0]+'-'+usb[1],u_s_b);
	
	logout(sses[u_s_b],'会话超时。请重新登录。');//先关闭旧连接（若存在）
	
	sses[u_s_b] = res;
	
	//上线广播
	broad('signin',u_s_b,u_s_b);
	
	if(!sses_ui['ui-'+usb[0]]) sses_ui['ui-'+usb[0]] = {};
	sses_ui['ui-'+usb[0]][u_s_b] = 1;
}

//关闭sse连接
function close(u_s_b,msg){
	var usb = u_s_b.split('-');
	logout(sses[u_s_b],msg);
	delete sses[u_s_b];
	if(sses_ui['ui-'+usb[0]]) delete sses_ui['ui-'+usb[0]][u_s_b];
	//下线广播
	broad('signout',u_s_b,u_s_b);
}

function init(){
	timer.set_task('sse.heartbeat',function(){
		for(var key in sses){
			sses[key].write(':p\r\n\r\n');//心跳报文
		}
	});
	timer.set_task('sse.reset_sses',function(count){
		if(count === 110){//凌晨3点清空所有sse
			for(var key in sses){
				close(key,'会话超时，请重新登录。');
			}
			sses_ui={};
		}
	});
}
exports.init  = init;
exports.add   = add;
exports.close = close;
exports.broad = broad;
exports.get_sses_ui = get_sses_ui;
