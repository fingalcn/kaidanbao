/**
 * 所有客户端js写在这一个文件中，保证核心过程和工具不依赖第三方库
 * 文件加载顺序：
 * 页面跳转依赖url hash
 */
;(function(a,b){
	//文档顺序加载，定义参数
	a.kaidanbao = {};
	window.addEventListener('DOMContentLoaded', function(){
		//require(k.utils)
		b(a.kaidanbao);
		//标签可见性切换
//		document.addEventListener('visibilitychange', function(){
//			console.log(document['visibilityState']);//visible or hidden
//		});
		//屏幕旋转监听
//		window.addEventListener('orientationchange', function(){
//			console.log(document.body.clientWidth);
//			console.log(document.body.clientHeight);
//		});
    });
	//捕获全局错误
//	window.onerror=function(msg,url,l){
//		console.log("Error: " + msg);
//		console.log("URL: " + url);
//		console.log("Line: " + l);
//	}
})(window,function(k){
	//删除提示语句
	$("#load-msg").remove();
	//加载样式
	$('body').css('background-image','url(/res/kdb/img/bg'+(new Date().getMonth())+'.jpg)');
	k.frame.init();
	window.addEventListener('hashchange',k.frame.hashchangeHandle);
	//有更新，准备下载
//	window.applicationCache.ondownloading = function(){
//		//仅当用户登录过开单宝才提示更新
//		if(window.localStorage['k']) k.aspect.noty.progress('更新中。。。');
//	}
	//首次缓存成功
//	window.applicationCache.oncached = function(){
//		if(window.localStorage['k']) window.location.href = './';
//	}
	//再次缓存更新成功
//	window.applicationCache.onupdateready = function(){
//		if(window.localStorage['k']) window.location.href = './';
//	}
	//存储事件，同一浏览器只能登录一个开单宝账号
	window.addEventListener('storage',function(event){
		var loc = JSON.parse(event.newValue)||{};
		var staff = loc['s'+loc.c]||{};
		if(k.cache.sign.loaded && staff.ui == k.cache.sign.user_id ) {//已登录触发事件
			window.location.href = '/';
		}
	});
	//退出
	window.onbeforeunload = function(e){
		//注意：直接关闭浏览器时不会执行次函数
		if(k.cache.sign.loaded) k.aspect.log('退出');
    }
});