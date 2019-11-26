/**
 * http://usejsdoc.org/
 */
(function(k){
	k.plugin={
		_initedCache:{},
		_change:function(oldHashArr,newHashArr) {
			var oldname = oldHashArr[2];//释放旧页面
			if(k.plugin[oldname] && k.plugin[oldname].release)  k.plugin[oldname].release();
			
			var newname = newHashArr[2];
			if(k.plugin._initedCache[newname]){
				k.plugin._initedCache[newname] += 1;
				//重新加载新页面
				if(k.plugin[newname] && k.plugin[newname].reload)  k.plugin[newname].reload();
			}else{
				k.plugin._initedCache[newname]=1;
//				console.log(oldHashArr,newHashArr);
				//初始化新页面
				if(k.plugin[newname] && k.plugin[newname].init) k.plugin[newname].init();
			}
		}
	}
})(window.kaidanbao);
