/*
 * 工具模块
 */
function getNow(){
	//获取当前毫秒数
	return new Date().getTime();
}
function getSafeMobile(mobile){
	mobile = mobile || '13702307103';
	return mobile.substr(0,3)+'******'+mobile.substr(9,2);
}
function getDay(n,start){
	//日期YYYY-MM-DD，n为相对于今天(或start：YYYY-MM-DD)的偏离天数，可以为负数，小数
	var first = start?new Date(start).getTime():new Date().getTime();
	if(n) return getTimeFormat(first+(n*86400000),'d');
	else return getTimeFormat(0,'d');
}
function getTimeFormat(time,mode){
	//统一为格式：YYYY-MM-DD hh-mm-ss.SSS，
	//@time : 时间戳毫秒数，
	//@mode : 'd' YYYY-MM-DD;'t'hh-mm-ss;'dt' YYYY-MM-DD hh-mm-ss;
	var dt = time?new Date(time):new Date();
	var YYYY = dt.getFullYear(),MM= dt.getMonth()+1,DD= dt.getDate(),hh= dt.getHours(),mm= dt.getMinutes(),ss= dt.getSeconds();
	if(mode === 'd'){
		MM = (MM>9?MM:('0'+MM));DD = (DD>9?DD:('0'+DD));
		return YYYY+'-'+MM+'-'+DD;
	}else if(mode === 't'){ 
		hh = (hh>9?hh:('0'+hh));mm = (mm>9?mm:('0'+mm));ss = (ss>9?ss:('0'+ss));
		return hh+':'+mm+':'+ss;
	}else if(mode === 'dt'){ 
		MM = (MM>9?MM:('0'+MM));DD = (DD>9?DD:('0'+DD));hh = (hh>9?hh:('0'+hh));mm = (mm>9?mm:('0'+mm));ss = (ss>9?ss:('0'+ss));
		return YYYY+'-'+MM+'-'+DD+' '+hh+':'+mm+':'+ss;
	}else{
		return ''; 
	}
}

//对象合并
function extend(src,dist,cover){
	src = src || {};
	if(dist){
		for(var key in dist){
			if(cover || !src[key]){
				src[key] = dist[key];
			}
		}
	}
	return src;
}

//获取客户端IP
function getClientIp(req) {
	if(req){
		if(req.headers && req.headers['x-forwarded-for']) return req.headers['x-forwarded-for'];
		if(req.connection && req.connection.remoteAddress) return req.connection.remoteAddress;
		if(req.socket && req.socket.remoteAddress) return req.socket.remoteAddress;
		if(req.connection && req.connection.socket && req.connection.socket.remoteAddress) return req.connection.socket.remoteAddress;
	}
//    return req.headers['x-forwarded-for'] ||
//    req.connection.remoteAddress ||
//    req.socket.remoteAddress ||
//    req.connection.socket.remoteAddress;
}

exports.getClientIp = getClientIp;
exports.getNow = getNow;
exports.getSafeMobile = getSafeMobile;
exports.getDay = getDay;
exports.getTimeFormat = getTimeFormat;
exports.extend = extend;