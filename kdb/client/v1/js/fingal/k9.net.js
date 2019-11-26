/**
 * http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var ajax = function(conf, comp) {
	    // 默认配置
		u.extend(conf, {
	        url :'/default/path',
	        method : 'POST',
	        timeout : 30000,
	    });
		$.ajax({ 
			url: conf.url+'?'+new Date().getTime(),
			type : conf.method,
			timeout:conf.timeout,
			data:conf.data||null,
			complete:function(xhr,ts){
				if (xhr.status === 200) {
	            	comp(null,JSON.parse(xhr.responseText));
	            } else {
	                comp(xhr);
	            }
			},
		});
	}
	k.net={
		api:function(api_path,param,comp,do_not_need_session){
			if(do_not_need_session || k.cache.sign.session){
				//防止变量被篡改，增强session安全性
				if(k.cache.sign.session) k.cache.sign.session.usb = k.cache.sign.user_id+'-'+k.cache.sign.staff_id+'-'+k.cache.sign.box_id;
				ajax({url:api_path,
					data:JSON.stringify({s:k.cache.sign.session || {},p:param})},function(err,r){
					if(err){
						comp(err);
					}else if(r.code === 200){
						comp(null,r);
					}else{
						comp(r);
						if(r.msg) k.aspect.noty.message(r.msg);
					}
				});
			}else comp({msg:'no session'});
		},
		ajax:ajax//用于文件上传
	}
})(window.kaidanbao);
