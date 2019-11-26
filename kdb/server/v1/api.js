/** kaidanbao API server
 *  初始化入口，将所有模块初始化[init()]，其他模块引用不再执行init()
 */
var sms = require( './alidayu/sms' );
var cache =require('./cache');
var dao =require('./dao');
var file =require('./file');//no init
var log =require('./log');
var manage=require('./manage');
var safe=require('./safe');
var user=require('./user');
var u=require('./utils');//no init
var timer=require('./timer');
var sse=require('./sse');

var c,fs = require("fs");
//var fileCache={};//静态文件缓存

/**
 * API路径映射：m,接口处理方法。sc,会话检查。
 */
var apiMap = {
    "/sign/login":{m:manage.login},
    "/sign/sendsms":{m:manage.sendsms},
    "/sign/register":{m:manage.register},
    "/sign/checkloginname":{m:manage.checkloginname},
    "/sign/forget":{m:manage.forget},
    "/sign/xufei":{m:manage.xufei},
    
    "/manage/upduser":{m:manage.upduser,sc:1},
    "/manage/updstaff":{m:manage.updstaff,sc:1},
    "/manage/addstaff":{m:manage.addstaff,sc:1},
    "/manage/renewal":{m:manage.renewal,sc:1},
    "/manage/exit":{m:manage.exit,sc:1},
    
    "/user/addOne":{m:user.addOne,sc:1},
    "/user/updOne":{m:user.updOne,sc:1},
    "/user/upl":{m:user.upl,sc:1},
    "/user/down":{m:user.down,sc:1},
};

//初始化，先执行safe.init()，成功则启动http(s)
function init(config,comp){
	if(c) return;
	c = config;
	log.init(c);
	sms.init(c);
	cache.init(c);
	//安全检查
	safe.init(c,function(sf){
		if(sf){
			//下面初始化的顺序不能随便
			dao.init(c);
			manage.init(c);
			user.init(c);
			sse.init(c);
			timer.init(c);
//			timer.set_task('api.reset_file_cache',function(count){
//				if(count===20){//凌晨清空文件缓存
//					fileCache={};
//				}
//			});
			log.warn("重新启动成功！",'api.init');
			comp(true);
		}else {
			log.warn("重新启动失败！",'api.init');
			comp(false);
		}
	});
}

//临时方法
function TEMP(req, res){
	var ip = u.getClientIp(req);
	log.warn("URL : jc.kaidan.me"+req.url,'api.TEMP',ip);
	console.log(req.url);
	if(req.url=='/' || req.url=='/19.jpg') {
		fs.readFile(c.UrlMap['jc.kaidan.me'+req.url][0], function(err, data){
			res.writeHead(200, {"Content-Type": c.UrlMap['jc.kaidan.me'+req.url][1],
				'Cache-Control':'public,max-age='+(c.UrlMap['jc.kaidan.me'+req.url][2] || 0)});
			res.end(data);
		});
	}else{
		res.end();
	}
}



//静态资源读取[path,type]
function GET(req, res){
	var ip = u.getClientIp(req);
	log.info("URL : "+req.url,'api.GET',ip);
//	console.info("URL : "+req.url,'api.GET',ip);
	if(c.UrlMap[req.url]){
//		if(fileCache[req.url] && c.Log.dir){
//			res.writeHead(200, {"Content-Type": c.UrlMap[req.url][1],'Access-Control-Allow-Origin':'https://'+c.http.host,'Cache-Control':'public,max-age='+(c.UrlMap[req.url][2] || 0)});
//			res.end(fileCache[req.url]);
//		}else{
			fs.readFile(c.UrlMap[req.url][0], function(err, data){
				if(err){
					log.warn("File error: "+c.UrlMap[req.url][0],'api.GET',req);
					res.writeHead(404);
					res.end('Not file !');
				}else{
//					fileCache[req.url] = data;//无需缓存
					res.writeHead(200, {"Content-Type": c.UrlMap[req.url][1],
						'Access-Control-Allow-Origin':'https://'+c.http.host,
						'Cache-Control':'public,max-age='+(c.UrlMap[req.url][2] || 0)});
					res.end(data);
				}
			});
//		}
	}else{
		if(req.url.startsWith("/event/sse")){//服务器推送
			var query=req.url.split('?')[1];//?usb&token
			if(query) query = query.split('&');
			if(query[1]&&cache.day_cache('token-'+query[0])==query[1]){//检查session
				var u_s_b=query[0];//?ui-si-bi
				if(u_s_b && cache.day_cache('token-'+u_s_b)){//依赖session
					res.writeHead(200, {"Content-Type":"text/event-stream", 
						"Cache-Control":"no-cache", 
						"Connection":"keep-alive"});
					log.info(u_s_b+' - '+u.getTimeFormat(0,'dt'),'api.GET');
					res.write('data:{"type":"connected"}\r\n\r\n');
					sse.add(u_s_b,res);
					req.connection.on('end',function(){
						//客户端关闭连接
						log.info("client close sse : "+u_s_b,'api.GET');
						sse.close(u_s_b,'会话超时！请重新登录。');
					});
				}else{
					res.writeHead(404);
					res.end('Not Found !');	
				}
			}else{
				res.writeHead(404);
				res.end('Not Found !');	
			}
		}else if(req.url.startsWith("/res/")){//静态资源
			req.url.replace('..','aa');
			fs.readFile(__dirname+'/../../'+req.url.replace('..','x'), function(err, data){
				if(err){
					log.warn("File error: "+req.url,'api.GET',req);
					res.writeHead(404);
					res.end('Not file !');
				}else{
//					fileCache[req.url] = data;//无需缓存
					var cType = 'text/plain';
					if(req.url.endsWith('.html')){
						cType = 'text/html';
					}else if(req.url.endsWith('.css')){
						cType = 'text/css';
					}else if(req.url.endsWith('.js')){
						cType = 'application/x-javascript';
					}else if(req.url.endsWith('.png')){
						cType = 'image/x-png';
					}else if(req.url.endsWith('.jpg')){
						cType = 'image/jpeg';
					}else if(req.url.endsWith('.txt')){
						cType = 'text/plain';
					}
					res.writeHead(200, {"Content-Type": cType,
						'Access-Control-Allow-Origin':'https://'+c.http.host,
						'Cache-Control':'public,max-age=864000'});
					res.end(data);
				}
			});
		}else{
			log.warn("URL error: "+req.url,'api.GET',ip);
			res.writeHead(404);
			res.end('Not Found !');
		}
	}
}

function POST(req, res) {
	var urls = req.url.split('?');
	var api = apiMap[urls[0]];
	var ip = u.getClientIp(req);
	log.info("URL : "+req.url,'api.POST',ip);
	var postData = '';
	//文件上传
	if(urls[0].startsWith("/upload/")){
		var image;
		req.on('data',function(chunk){
			postData += chunk;
		});
		req.on('end',function(){
			var start = postData.indexOf(','),oldFileName;
			if(start >= 0){
				oldFileName = postData.substring(0,start);// /res/kdb/upload/...
				postData = postData.substr(start+1);//去掉前缀
			}
			fs.writeFile(c.Upload.dir+urls[0].replace('/upload/',''), Buffer.from(postData,'base64'), function(err){
				if(err){
					log.info('postData:create upload file error!',ip);
					res.writeHead(500);
    				res.end('{"code":500}');
				}else{
					if(oldFileName) fs.unlink(c.Upload.dir+oldFileName.replace('/res/kdb/upload/',''), function(err) {});
					log.info('postData:create upload file success!',ip);
					res.writeHead(200,{'Content-Type': 'application/json'});
	        		res.end('{"code":400}');
				}
			});
		});
	}else if(api){
		req.on('data',function(chunk){
			postData += chunk;
		});
		req.on('end',function(){
			log.info(postData,'api.POST',ip);
	        var reqJson = JSON.parse(postData);
	        if(reqJson && reqJson.s && reqJson.p){
	        	reqJson.s.ip = ip;
	        	if(!api.sc || safe.check_session(reqJson)){
	        		api.m(reqJson,function(code,msg,obj){
	        			if(code){
	        				res.writeHead(200,{'Content-Type': 'application/json'});
	        				res.end(JSON.stringify({code:code,msg:msg,obj:obj}));
	        			}else{
	        				log.warn("Inner error: "+req.url+","+postData,'api.POST',ip);
	        				res.writeHead(500);
	        				res.end('{"code":500}');
	        			}
	        		});
	        	}else{
	        		log.warn("Session error: "+req.url+","+postData,'api.POST',ip);
	        		res.writeHead(200,{'Content-Type': 'application/json'});
	        		res.end('{"code":400}');
	        	}
	        }else{
	        	log.warn("PostData error: "+req.url+","+postData,'api.POST',ip);
	        	res.writeHead(200,{'Content-Type': 'application/json'});
	        	res.end('{"code":400}');
	        }
		});
	}else{
		log.warn("URL error: "+req.url,'api.POST',ip);
		res.writeHead(404);
		res.end('Not Found !');
	}
}
exports.TEMP = TEMP;
exports.GET = GET;
exports.POST = POST;
exports.init = init;