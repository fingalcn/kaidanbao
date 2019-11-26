/**
 * 启动服务器 s3f2g5r6
 */
var _db_name_admin = 'kdb_master',admin_max_pool =10,
	_db_name_user_fixed = 'kdb_user_fixed',fixed_max_pool =20,
	_db_name_user_dynamic = 'kdb_user_dynamic',dynamic_max_pool =50,
	_db_url = 'mongodb://dds-bp14b36ce45b7b142.mongodb.rds.aliyuncs.com:3717,dds-bp14b36ce45b7b141.mongodb.rds.aliyuncs.com:3717/',
	_db_replica_set = 'mgset-1851389';

var config={
	Mode:'product',
	V:{server:1,client:1,indexeddb_version:1},
	Upload:{dir:__dirname+'/../res/kdb/upload/'},
	Log:{dir:__dirname+'/../../applogs/',level:1},
	SMS:{
		appkey    : '23297110' ,
		appsecret : '93ae5d513213ff46e0026edfe4b93ac6',
		REST_URL  : 'http://gw.api.taobao.com/router/rest',
		sms_free_sign_name:'开单宝',
		temp_login     : 'SMS_43300141',
		temp_setmobile : 'SMS_37635125',
		temp_forget    : 'SMS_43130102',
		temp_notychangemobile:'SMS_37600041',
		temp_notyrestart   :'SMS_37715025',
		safe_mobile:13702307103
	},
	manage:{
		ui:4,
		rid:24000002,//主仓库
		aid:24000001,//现金
	},
	DB:{
		username:"root",
		password:"b5c79as1",
		ADMIN:{
			NAME:_db_name_admin,
			URL:_db_url+_db_name_admin+'?replicaSet='+_db_replica_set+'&maxPoolSize='+admin_max_pool,
		},
		USER_FIXED:{
			NAME:_db_name_user_fixed,
			URL:_db_url+_db_name_user_fixed+'?replicaSet='+_db_replica_set+'&maxPoolSize='+fixed_max_pool,
		},
		USER_DYNAMIC:{
			NAME:_db_name_user_dynamic,
			URL:_db_url+_db_name_user_dynamic+'?replicaSet='+_db_replica_set+'&maxPoolSize='+dynamic_max_pool,
		},
	},
	http:{
		host:'kaidanbao.cn',ssl_port:443,port:80
	}
}
config.UrlMap = {
	'jc.kaidan.me/19.jpg'	 : [__dirname+'/../res/site/19.jpg','image/jepg'],
	'jc.kaidan.me/'	 : [__dirname+'/../res/site/jc.html','text/html'],
	'/'				: [__dirname+'/../res/site/index.html','text/html',864000],
	'/p'			: [__dirname+'/../client/v'+config.V.client+'/jump.html','text/html',864000],
	'/p/'			: [__dirname+'/../client/v'+config.V.client+'/index.html','text/html'],
	'/k.appcache'   : [__dirname+'/../client/v'+config.V.client+'/offline/k.appcache','text/cache-manifest'],
	'/k.css'		: [__dirname+'/../client/v'+config.V.client+'/k.css','text/css'],
	'/k.js'			: [__dirname+'/../client/v'+config.V.client+'/k.js','application/x-javascript'],
	'/favicon.ico'	: [__dirname+'/../client/v'+config.V.client+'/favicon.ico','image/x-icon',864000],
}

require('./server').start(config);
