/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	var local = k.cache.local();
	var needlogincode;
	var loadSign=function(){
		if(document.getElementById('sign')) return;

		$('body').append(' \
			<div id="sign"> \
			<div class="sign-main"> \
				<div class="sign-logo-wrapper"> \
					<span class="icon-logo"><a href="/"> \
						<svg class="logo" version="1.1" viewBox="0 -70 1034 1034"><path d="M928 544c-28.428 0-53.958-12.366-71.536-32h-189.956l134.318 134.318c26.312-1.456 53.11 7.854 73.21 27.956 37.49 37.49 37.49 98.274 0 135.764s-98.274 37.49-135.766 0c-20.102-20.102-29.41-46.898-27.956-73.21l-134.314-134.318v189.954c19.634 17.578 32 43.108 32 71.536 0 53.020-42.98 96-96 96s-96-42.98-96-96c0-28.428 12.366-53.958 32-71.536v-189.954l-134.318 134.318c1.454 26.312-7.856 53.11-27.958 73.21-37.49 37.49-98.274 37.49-135.764 0-37.49-37.492-37.49-98.274 0-135.764 20.102-20.102 46.898-29.412 73.212-27.956l134.32-134.318h-189.956c-17.578 19.634-43.108 32-71.536 32-53.020 0-96-42.98-96-96s42.98-96 96-96c28.428 0 53.958 12.366 71.536 32h189.956l-134.318-134.318c-26.314 1.456-53.11-7.854-73.212-27.956-37.49-37.492-37.49-98.276 0-135.766 37.492-37.49 98.274-37.49 135.764 0 20.102 20.102 29.412 46.898 27.958 73.21l134.316 134.32v-189.956c-19.634-17.576-32-43.108-32-71.536 0-53.020 42.98-96 96-96s96 42.98 96 96c0 28.428-12.366 53.958-32 71.536v189.956l134.318-134.318c-1.456-26.312 7.854-53.11 27.956-73.21 37.492-37.49 98.276-37.49 135.766 0s37.49 98.274 0 135.766c-20.102 20.102-46.898 29.41-73.21 27.956l-134.32 134.316h189.956c17.576-19.634 43.108-32 71.536-32 53.020 0 96 42.98 96 96s-42.982 96-96.002 96z"></path></svg> \
					</a></span> \
				</div> \
				<div class="sign-title" style="margin-top:15px;">欢迎使用开单宝！</div> \
				<div class="sign-input-wrapper sign-input-loginname"> \
					<input type="text" class="loginname" spellcheck="false" placeholder="用户名" /> \
				</div> \
				<div class="sign-input-wrapper sign-input-password"> \
					<input type="password" class="password" spellcheck="false" placeholder="密码" /> \
				</div> \
				<div hidden class="sign-input-wrapper sign-input-inc"> \
					<input type="text" class="inc" maxlength="8" spellcheck="false" placeholder="公司简称" /> \
				</div> \
				<div hidden class="sign-input-wrapper sign-input-captcha"> \
					<input type="text" maxlength="4" class="captcha" placeholder="短信验证码" /><button class="captcha-button">发短信</button> \
				</div> \
				<div class="sign-button-wrapper sign-button-login"> \
					<button class="login">登录</button> \
				</div> \
				<div hidden class="sign-button-wrapper sign-button-register"> \
					<button class="register">注册</button> \
				</div> \
				<div hidden class="sign-button-wrapper sign-button-forget" > \
					<button class="forget">重置密码</button> \
				</div> \
				<div class="sign-a-wrapper"> \
					<div hidden class="login"><a href="#/sign/login">立即登陆</a></div> \
					<div class="register"><a href="#/sign/register">注册账号</a></div> \
					<div class="forget"><a href="#/sign/forget">忘记密码?</a></div> \
				</div> \
				<div hidden class="sign-tips">建议使用 <a href="http://r.kaidan.me/browser/Opera_43.exe">Opera（欧朋）浏览器</a></div> \
				<div hidden class="sign-tips">请安装 <a href="http://r.kaidan.me/clodop/CLodop_https_2.102.exe">打印控件</a>，并允许开机自动运行</div> \
				<div class="sign-tips"><a href="http://www.igo93.com/">开单宝将于2020年1月1日正式关闭，请迁移到其他服务</a></div> \
			</div> \
			<div hidden class="sign-loading"> \
				<p class="progress_msg">正在加载，请稍候...</p> \
			  	<progress value="0" max="100" ></progress> \
			</div> \
		</div>');
		var dv = u.get_device();
		if(dv.hw==='pc'){
			if(dv.bw!=='opera' && dv.bw!=='chrome'){
				$('#sign div.sign-tips').eq(0).removeAttr('hidden');
			}
			if(!dv.clodop){
				$('#sign div.sign-tips').eq(1).removeAttr('hidden');
			}
		}
		document.onkeydown=function(e){ 
			if(e.keyCode === 13 ){//Enter
				if(e.ctrlKey){//Ctrl + Enter 开单页面
					$('#layout div.'+k.frame.current_plugin+' button.submit').click();
				}else{//Enter 登录页面
					if(window.location.hash === '#/sign/login') $('#sign .sign-button-login button').click();
				}
			}
		}
		$('#sign button.captcha-button').click(function(){
			var loginname = $('#sign input.loginname').val().trim(),type;
			var sf = local['s'+loginname]||{},device=local['u'+sf.ui];
			if(!u.valid_loginname(loginname)) return;
			k.net.api('/sign/sendsms',{loginname : loginname,type:window.location.hash.split('/')[2],device:device},function(err,r){
				if(r){
					k.aspect.noty.message('已发短信至:'+r.obj.mobile);
					$('#sign button.captcha-button').html('已发送').attr('disabled','disabled').css('background-color','#555').css('cursor','default');
					$('#sign input.captcha').focus();
				}
			},true);
		});
	}
	p.forget={
		init:function(){
			loadSign();
			$('#sign button.forget').click(function(){
				var loginname = $('#sign input.loginname').val().trim();
				if(!u.valid_loginname(loginname)) return;
				var password = $('#sign input.password').val();
				if(!u.valid_password(password)) return;
				var pwd_local = k.safe.local_pwd(password);
				var captcha = $('#sign input.captcha').val();
				if(!u.valid_smscode(captcha)) return;
				k.net.api('/sign/forget',{loginname : loginname,password:k.safe.up_pwd(pwd_local,password),code:parseInt(captcha)},function(err,r){
					if(r){
						k.aspect.noty.message('密码修改成功，请登录');
						window.location.hash = '#/sign/login';
					}
				},true);
			});
		}
	}
	p.register={
		init:function(){
			loadSign();
			$('#sign input.loginname').val('');
			$('#sign .sign-button-register button').click(function(){
				var loginname = $('#sign input.loginname').val().trim();
				var password = $('#sign input.password').val();
				var inc    = $('#sign input.inc').val().trim();
				if(!u.valid_loginname(loginname)) return;
				if(!u.valid_password(password)) return;
				if(!u.valid_hanname(inc)) return;
				k.net.api('/sign/checkloginname',{loginname : loginname},function(err,r){
					if(err) {
						k.aspect.noty.message('网络异常！');
						return;
					}else if(r.obj && r.obj.used) {
						k.aspect.noty.message('用户名已被占用，请更换');
						return;
					}
					var pwd_local = k.safe.local_pwd(password);
					k.aspect.pay({url:'/sign/register',no_session:true,
						param:{loginname : loginname, password : k.safe.up_pwd(pwd_local,password), inc  : inc}
					},function(){
						k.aspect.noty.confirm_close();
						k.aspect.noty.message('注册成功！');
						window.location.hash = '#/sign/login';//直接登录
						$('#sign button.login').click();
					});
				},true);
			});
		}
	}
	p.login={
		init:function(){
			loadSign();
			if(local['c']) {
				$('#sign input.loginname').val(local['c']);
				$('#sign input.password').focus();
			}else{
				$('#sign input.loginname').focus();
			}
			$('#sign .sign-button-login button').click(function(){
				var loginname = $('#sign input.loginname').val();
				var password = $('#sign input.password').val();
				var code = $('#sign input.captcha').val();
				if(!u.valid_loginname(loginname)) return;
				if(!u.valid_password(password)) return;
				if(needlogincode){
					if(u.valid_smscode(code)) {
						code = parseInt(code);
					}else return;
				}else code=0;
				
				var local_staff = local['s'+loginname] || {};
				var local_device = local['u'+local_staff.ui] ||local['u'+local['def-ui']]|| u.get_device();
				var pwd_local = k.safe.local_pwd(password);
				k.aspect.noty.progress('登录中。。。');
				k.net.api('/sign/login',{
			loginname:loginname,password:k.safe.up_pwd(pwd_local,password),device:local_device,code:code
				},function(err,r){
					if(err){
						if(err.code){
							//能联网，登录失败
							k.aspect.noty.close_progress();
							k.aspect.noty.message('登录失败！');
						}else{
							//不能联网，离线检查
							if(local['s'+loginname]){
								if(k.safe.local_pwd(password) === local['s'+loginname].pwd){
									k.cache.sign.user_id  = local['s'+loginname].ui;
									k.cache.sign.staff_id = local['s'+loginname].si;
									k.cache.sign.box_id   = local_device.bi;
									k.aspect.noty.close_progress();
									$('#sign .sign-button-login button').remove();
									k.aspect.noty.confirm('<br /><h1>网络连接已断开</h1><br />您正在离线登录，请尽快联网，以保持数据同步！',function(){
										location.hash = '#/sign/loading';
										k.aspect.noty.confirm_close();
									},1);
								}else {
									k.aspect.noty.close_progress();
									k.aspect.noty.message('用户名或密码错误！');
								}
							}else{
								k.aspect.noty.close_progress();
								k.aspect.noty.message('请检查网络连接！');
							}
						}
					}else {
						if(r.obj.needcode){
							//需要发送验证码
							needlogincode = 1;
							$('#sign .sign-input-captcha').removeAttr('hidden');
							k.aspect.noty.close_progress();
							k.aspect.noty.message('本次登录需验证码！'+(r.msg || ''));
						}else{
							k.cache.sign.user_id  = r.obj.user._id;
							k.cache.sign.staff_id = r.obj.staff_id;
							k.cache.sign.box_id   = r.obj.device.bi;
							
							if(local_device.bi != r.obj.device.bi) {
								indexedDB.deleteDatabase(k.conf.db.name+k.cache.sign.user_id);//删除旧库
								k.cache.sign.need_create_db = true;
							}
							local['c'] = loginname;
							local['s'+loginname] = {pwd:pwd_local,ui:r.obj.user._id,si:r.obj.staff_id,ll:new Date().getTime()};
							local['u'+r.obj.user._id] = r.obj.device;
							local['def-ui'] = r.obj.user._id;//默认ui
							//localStorage
							k.cache.local(local);
							k.cache.sign.user = r.obj.user;
							k.cache.sign.staff = r.obj.user['staff'+r.obj.staff_id];
							
							k.cache.sign.online = r.obj.online||{};
							
							k.cache.sign.session  = {token: r.obj.token,ui:r.obj.user._id,si:r.obj.staff_id,bi:r.obj.device.bi,usb: r.obj.user._id+'-'+r.obj.staff_id+'-'+r.obj.device.bi};
							if(r.obj.due && r.obj.due < u.date.getTimeFormat(0,'d')){
								$('#sign .sign-button-login button').remove();
								//需要续费
								k.aspect.noty.close_progress();
								var si = r.obj.staff_id;
								var user = k.cache.sign.user,staff=user['staff'+si];
								var due = u.date.getDay(366,staff.due);
								var min = u.date.getDay(366);
								if(due < min) due = min;
								$.facebox(
										'<br /><div class="fb-input-wrapper"> \
										<label>用户名称：</label> \
										<input class="inc" disabled="disabled" value="'+staff.loginname +'" /></div> \
										<div class="fb-input-wrapper"> \
										<label>当前有效期至：</label> \
										<input class="inc" disabled="disabled" value="'+(staff.due)+'" /></div> \
										<div class="fb-input-wrapper"> \
										<label>续后有效期至：</label> \
										<input class="inc" disabled="disabled" value="'+due+'" /></div> \
										<div class="fb-input-wrapper"> \
										<label>&nbsp;</label> \
										<button class="pay">付款</button> \
										</div>');
								$('#facebox div.title').html('当前用户已过期，请续费后使用！');
								$('#facebox button.pay').click(function(){
									k.aspect.pay({url:'/manage/renewal',
										param:{loginname : staff.loginname}
									},function(r){
										k.aspect.noty.confirm_close();
										k.aspect.noty.message('续期成功！');
										staff.due = r.obj.due;
										$.facebox.close();
										location.hash = '#/sign/loading';
									});
								});
							}else location.hash = '#/sign/loading';
						}
					}
				},true);
			});
		}
	}
})(window.kaidanbao);