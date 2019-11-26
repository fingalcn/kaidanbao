/**
 * Module dependencies.
 */

TopClient = require('./topClient').TopClient;
var client;
var c;
              
function sendNum(code,name,mobile,temp,comp){
	client.execute( 'alibaba.aliqin.fc.sms.num.send' , {
		'extend' : '' ,
		'sms_type' : 'normal' ,
		'sms_free_sign_name' : c.SMS.sms_free_sign_name ,
		'sms_param' : '{"code":"'+code+'","name":"'+name+'"}' ,
		'rec_num' : mobile, 
		'sms_template_code' : temp
	}, comp);
}

function init(config){
	if(c) return;
	c = config;
	if(!client){
		client = new TopClient({
			'appkey' : c.SMS.appkey ,'appsecret' : c.SMS.appsecret ,'REST_URL' : c.SMS.REST_URL
		});
	}
}

exports.init = init;
exports.sendNum = sendNum;