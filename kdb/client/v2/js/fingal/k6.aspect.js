/**
 * http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var timer,exited;
	var _sid,_ro;//私有化_sid,增强超级权限安全性
	var log_id=1;//日志id
	k.aspect={
		/** 组件提示，消息，弹框，进度
		 */
		noty:{
			message:function(msg){
				if(timer) clearTimeout(timer);
				$('.noty.message').remove();
				$('body').append('<div class="noty message">'+msg+'</div>');
				timer = setTimeout(function() {
					$('.noty.message').remove();
				}, 2500);
			},
			confirm:function(msg,comp,only_sure,timeout,width){//单位：秒
				$('div.noty.confirm button.cancel').click();
				$('body').append(' \
						<div id="confirm-mask"><progress style="width:100%;height:3%;"></progress></div> \
						<div class="noty confirm"> \
						  <div>'+(msg || '请确认！')+'<br /><br /> \
							  <button class="ensure">确定</button> \
							  <button class="cancel" style="color:#f08;margin-left:5px;">取消</button> \
						  </div> \
						</div>');
				$('div.noty.confirm>div').css('width',width || '450px');
				var inter;
				if(timeout){//超时关闭的进度条
					var val = timeout * 25;
					$('#confirm-mask progress').attr('max',val).attr('value',val);
					inter = setInterval(function(){
						$('#confirm-mask progress').attr('value',--val);
						if(val < 1) {
							clearInterval(inter);
							$('div.noty.confirm button.cancel').click();
						}
					},40);
				}else $('#confirm-mask progress').remove();
				$('div.noty.confirm button.ensure').click(comp);
				$('div.noty.confirm button.cancel').click(function(){
					if(inter) clearInterval(inter);
					$('div.noty.confirm').remove();
					$('#confirm-mask').remove();
				});
				if(only_sure){
					$('div.noty.confirm button.cancel').attr('hidden','hidden');
				}
			},
			confirm_close:function(){
				$('div.noty.confirm button.cancel').click();
			},
			progress:function(msg){
				$('body').append('<div class="noty progress">'+(msg || '正在处理，请稍候...')+'<br /><br /><progress></progress></div>');
			},
			close_progress:function(){
				$('div.noty.progress').remove();
			}
		},
		role_check:function(type){
			if(!_sid) _sid=k.cache.sign.staff_id;
			var staff = k.cache.sign.user['staff'+_sid];
			if(!_ro) _ro = k.cache.setup('role')[staff.role];
			if(staff.si === 1 || (_ro && _ro.v && _ro.v[type])) return true;
		},
		pay:function(conf,comp){
			var h1=(conf.title || '微信扫码付款')+' - ￥'+(conf.price || 288);
			k.aspect.noty.confirm('<h1>'+h1+'</h1><br /> \
					<img src="/res/site/img/vx.jpg" style="width:301px;"><br /> \
					<input placeholder="序列号 XXXX-XXXX-XXXX" spellcheck="false" class="cdkey" style="width:320px;" />',
			function(){
				var cdkey = $('div.noty.confirm input.cdkey').val().trim();
				if(conf.url!=='/sign/register'&&cdkey[0]==='S') {
					k.aspect.noty.message('此序列号仅用于注册！');
					return;
				}
				if(!/^[A-Z]{4}-[A-Z]{4}-[A-Z]{4}$/.test(cdkey)){
					k.aspect.noty.message('序列号不对，请检查！');
					return;
				}
				conf.param.cdkey=cdkey;
				k.aspect.noty.progress('操作中。。。');
				k.net.api(conf.url,conf.param,function(err,r){
					k.aspect.noty.close_progress();
					if(err) k.aspect.noty.message('操作失败！');
					else comp(r);
				},conf.no_session);
			},false,300);
		},
		log:function(type,msg){
			//type:登录，退出
			k.dao.addLog({type:type,remark:msg});
//			console.dir(msg)
		},
		exit:function(need_clear){
			if(exited) return;
			else exited = true;
			if(need_clear){//为安全：删除本地数据，服务器删除本设备
				indexedDB.deleteDatabase(k.conf.db.name+k.cache.sign.user_id);//删除本地库
				k.cache.local('');
				k.net.api('/manage/exit',{safe:(need_clear?1:0),ui:k.cache.sign.user_id,si:k.cache.sign.staff_id,bi:k.cache.sign.box_id},function(){});
			}
		}
	}
})(window.kaidanbao);
