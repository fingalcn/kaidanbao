/**
 * TODO 静态资源服务器，开发测试使用 s3f2g5r6
 */

var _db_name_admin = 'kdb_master',
	_db_name_user_fixed = 'kdb_user_fixed';
	_db_name_user_dynamic = 'kdb_user_dynamic';
	_db_url = 'mongodb://localhost:27017/';	

var config={
	Mode:'develop',
	V:{server:1,client:1},
//	Log:{},
	Upload:{dir:__dirname+'/../res/kdb/upload/'},
	Log:{dir:__dirname+'/../../devlogs/',level:1},
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
		safe_mobile:13702307103,
	},
	manage:{//管理账号
		ui:4,
		rid:80001000004,//主仓库
		aid:80001000003,//现金
	},
	test:{//测试账号
		
	},
	train:{//培训账号
		
	},
	demo:{//演示账号
		
	},
	DB:{
		ADMIN:{
			NAME:_db_name_admin,
			URL:_db_url+_db_name_admin,
		},
		USER_FIXED:{
			NAME:_db_name_user_fixed,
			URL:_db_url+_db_name_user_fixed,
		},
		USER_DYNAMIC:{
			NAME:_db_name_user_dynamic,
			URL:_db_url+_db_name_user_dynamic,
		},
	},
	http:{
		host:'www.kaidan.me',ssl_port:443,port:80
	}
}

config.UrlMap = {
	'jc.kaidan.me/19.jpg'	 : [__dirname+'/../res/site/19.jpg','image/jepg'],
	'jc.kaidan.me/'	 : [__dirname+'/../res/site/jc.html','text/html'],
	'/'				 : [__dirname+'/../res/site/index.html','text/html'],
	'/p'			 : [__dirname+'/../client/v'+config.V.client+'/jump.html','text/html'],
	'/p/'			 : [__dirname+'/../client/v'+config.V.client+'/index_dev.html','text/html'],
	'/dev.appcache'  : [__dirname+'/../client/v'+config.V.client+'/offline/dev.appcache','text/cache-manifest'],
	'/style/kore.css': [__dirname+'/../client/v'+config.V.client+'/style/kore.css','text/css'],
	'/tools/facebox-1.3.css': [__dirname+'/../client/v'+config.V.client+'/tools/facebox-1.3.css','text/css'],
	'/tools/autocomplete-1.2.24.css': [__dirname+'/../client/v'+config.V.client+'/tools/autocomplete-1.2.24.css','text/css'],
	'/tools/datepicker-1.6.0.css': [__dirname+'/../client/v'+config.V.client+'/tools/datepicker-1.6.0.css','text/css'],
	'/core/k.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k.js','application/x-javascript'],
	'/core/k0.utils.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k0.utils.js','application/x-javascript'],
	'/core/k1.safe.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k1.safe.js','application/x-javascript'],
	'/core/k2.conf.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k2.conf.js','application/x-javascript'],
	'/core/k3.cache.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k3.cache.js','application/x-javascript'],
	'/core/k4.dao.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k4.dao.js','application/x-javascript'],
	'/core/k5.syn.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k5.syn.js','application/x-javascript'],
	'/core/k6.aspect.js' : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k6.aspect.js','application/x-javascript'],
	'/core/k7.frame.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k7.frame.js','application/x-javascript'],
	'/core/k8.plugin.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k8.plugin.js','application/x-javascript'],
	'/core/k9.net.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/fingal/k9.net.dev.js','application/x-javascript'],
	'/core/k2.z.kdbconf.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k2.z.kdbconf.js','application/x-javascript'],
	'/core/k6.z.atcp.js' : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k6.z.atcp.js','application/x-javascript'],
	'/core/k6.z.billing.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k6.z.billing.js','application/x-javascript'],
	'/core/k6.z.manage.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k6.z.manage.js','application/x-javascript'],
	'/core/k6.z.print.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k6.z.print.js','application/x-javascript'],
	'/core/k8.z.sign.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k8.z.sign.js','application/x-javascript'],
	'/core/k8.z.loading.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k8.z.loading.js','application/x-javascript'],
	'/core/k8.z.home.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k8.z.home.js','application/x-javascript'],
	'/core/k8.z.sale.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k8.z.sale.js','application/x-javascript'],
	'/core/k8.z.stock.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k8.z.stock.js','application/x-javascript'],
	'/core/k8.z.fi.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k8.z.fi.js','application/x-javascript'],
	'/core/k8.z.chart.js'	 : [__dirname+'/../client/v'+config.V.client+'/js/kaidanbao/k8.z.chart.js','application/x-javascript'],
	'/tools/jquery-3.1.1.js'	 : [__dirname+'/../client/v'+config.V.client+'/tools/jquery-3.1.1.min.js','application/x-javascript'],
	'/tools/facebox-1.3.js'	 : [__dirname+'/../client/v'+config.V.client+'/tools/facebox-1.3.js','application/x-javascript'],
	'/tools/autocomplete-1.2.24.js'	 : [__dirname+'/../client/v'+config.V.client+'/tools/autocomplete-1.2.24.js','application/x-javascript'],
	'/tools/autocomplete-1.3.js'	 : [__dirname+'/../client/v'+config.V.client+'/tools/autocomplete-1.3.js','application/x-javascript'],
	'/tools/echarts.min.js'	 : [__dirname+'/../client/v'+config.V.client+'/tools/echarts.min.js','application/x-javascript'],
	'/tools/wonderland.js'	 : [__dirname+'/../client/v'+config.V.client+'/tools/wonderland.js','application/x-javascript'],
	'/favicon.ico'	 : [__dirname+'/../client/v'+config.V.client+'/favicon.ico','image/x-icon'],
}

var os = require('os');
console.log('the endianness of this os is: ' + os.endianness());
console.log('the hostname of this os is: ' + os.hostname());
console.log('the type of this os is: ' + os.type());
console.log('the platform of this os is: ' + os.platform());
if(os.type() === 'Windows_NT' && os.platform() ==='win32'){
	require('./server').start(config);
}