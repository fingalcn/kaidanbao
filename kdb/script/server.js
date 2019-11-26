/**
 * 部署服务器
 */
var c,fs = require('fs');
function start(conf){
	if(c) return;
	c = conf;
	var api = require('../server/v'+c.V.server+'/api');
	api.init(c,function(ok){
		if(ok){
			//api初始化成功后启动http(s)服务器
//			var options = {
//					key: fs.readFileSync(__dirname+'/../safe/213722026130764.key'),//kaidanbao.cn
//					cert: fs.readFileSync(__dirname+'/../safe/213722026130764.pem')
					//已过期
//					key: fs.readFileSync(__dirname+'/../safe/213942826660764.key'),//kaidan.me
//					cert: fs.readFileSync(__dirname+'/../safe/213942826660764.pem')
//					key: fs.readFileSync(__dirname+'/../safe/214311158090764.key'),//kaidan.me
//					cert: fs.readFileSync(__dirname+'/../safe/214311158090764.pem')
//			};
//			if(c.http.ssl_port){
//				require('https').createServer(options, function(req,res){
//					if(api[req.method]) api[req.method](req,res);
//					else{ res.writeHead(404); res.end('Not Found !'); }
//				}).listen(c.http.ssl_port);
//			}
			if(c.http.port){
				require('http').createServer(function(req,res){

					if(api[req.method]) api[req.method](req,res);
					else{ res.writeHead(404); res.end('Not Found !'); }
//					if('jc.kaidan.me' == req.headers.host){
//						api['TEMP'](req,res);
//					}else{
//						res.writeHead(301,{'Location':'https://'+c.http.host});
//						res.end();
//					}
				}).listen(c.http.port);
			}
		}
	});
}
exports.start = start;
