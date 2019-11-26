/**
 * 页面框架
 */
(function(k){
	//文档加载结束，基于url HASH执行函数，保证最终HASH不低于二级
	var oldHash='#/sign/nothing',
		defaultHash = '#/sign/login',
		urlHashMap={'#/sign/login':1,'#/sign/register':1,'#/sign/forget':1,'#/sign/loading':1},
		secondHash={'#/sign':'login'};
	k.frame={
		current_plugin:'',	//当前页面
		init:function(){
			if(!document.getElementById('print')){
				$('body').append('<div id="print"><div class="print"></div></div>');
			}
//			if(!document.getElementById('export')){
//				$('body').append('<div id="export"></div><input type="file" id="importfile" hidden accept="application/vnd.ms-excel" onchange="kaidanbao.plugin.store.import_check(this.files[0])">');
//			}
			if(!document.getElementById('uploadprintlogo')){
				$('body').append('<div hidden id="uploadprintlogo"><input type="file" onchange="kaidanbao.aspect.print.upload_logo(this.files[0])"></div>');
			}
			if(!document.getElementById('layout')){
				$('body').append('<div hidden id="layout"><div class="lay-main"></div></div>');
			}
			$('#layout').append('<div class="lay-top"><ul></ul></div>');
			if($('#layout  div.lay-main').length===0){
				$('#layout').append('<div class="lay-main"></div>');
			}
			var json = k.conf.frame;
			//json['p'][m]['sol'][n]['plug'][l]
			var p=json['p'],sol,plug,i,j,m,en,cn;
			for(i=0;i<p.length;i++){
				if(p[i]['sol'].length === 0) continue;
				en=p[i]['en'];cn=p[i]['cn'];
				secondHash['#/'+en]=p[i]['sol'][0]['plug'][0]['en'];
				$('#layout').append('<div hidden class="lay-left '+en+'"></div>');
				$('#layout div.lay-top ul').append('<li class="'+en+'"><a href="#/'+en+'">'+cn+'</a></li>');
				sol = p[i]['sol'];
				for(j=0;j<sol.length;j++){
					$('#layout div.'+en).append('<h2>'+sol[j]['cn']+'</h2><ul class="'+sol[j]['en']+'"></ul>');
					plug=sol[j]['plug'];
					for(m=0;m<plug.length;m++){
						$('#layout div.'+en+' ul.'+sol[j]['en']).append(
							'<li class="'+plug[m]['en']+'"><a href="#/'+en+'/'+plug[m]['en']+'">'+plug[m]['cn']+'</a></li>');
						urlHashMap['#/'+en+'/'+plug[m]['en']]=1;
					}
				}
			}
			k.frame.hashchangeHandle();
		},
		hashchangeHandle : function(){
			var newHashArr,oldHashArr;
			var newHash = window.location.hash;
			
			if(oldHash===newHash) return;
			
			//只能通过'#/sign/login'进入'#/sign/loading'
			if(newHash==='#/sign/loading' && oldHash!=='#/sign/login'){
				location.href = './';
				return;
			}
			if(newHash){
				if(secondHash[newHash]){
					location.replace(newHash+'/'+secondHash[newHash])
					return;
				}
				if(urlHashMap[newHash]){
					newHashArr = newHash.split('/');
					oldHashArr = oldHash.split('/');
					secondHash['#/'+newHashArr[1]] = newHashArr[2];
					
					//sign只能通过'#/sign/loading'进入非sign
					if(newHashArr[1] !== 'sign' && oldHashArr[1]==='sign' && oldHashArr[2]!=='loading'){
						location.href = './';
						return;
					}
//					k.conf.sign.plug_name=newHashArr[2];
					k.frame.current_plugin=newHashArr[2];
					k.plugin._change(oldHashArr,newHashArr);
					k.frame._change(oldHashArr,newHashArr);
					
					oldHash = newHash;
				}else{
					location.href = './';
				}
			}else{
				location.replace(defaultHash)
			}
		},
		_change:function(oldHashArr,newHashArr) {
			if(newHashArr[1] === 'sign' && oldHashArr[1] === 'sign'){
				//TODO 样式测试用
//				$('#sign .sign-button-login button').click();
				if(newHashArr[2] === 'loading'){
					$('#sign .sign-main').attr('hidden','hidden');
					$('#sign .sign-loading').removeAttr('hidden');
				}else{
					$('#sign .sign-input-wrapper,#sign .sign-button-wrapper,#sign .sign-a-wrapper div').attr('hidden','hidden');
					$('#sign .sign-input-password,#sign .sign-input-loginname').removeAttr('hidden');
					$('#sign .sign-a-wrapper div').css('float','left');
					if(newHashArr[2] === 'login'){
						$('#sign .sign-button-login,#sign .sign-a-wrapper div.register,#sign .sign-a-wrapper div.forget').removeAttr('hidden');
						$('#sign .sign-a-wrapper div.forget').css('float','right');
					}else if(newHashArr[2] === 'register'){
						$('#sign .sign-input-inc,#sign .sign-button-register,#sign .sign-a-wrapper div.login,#sign .sign-a-wrapper div.forget').removeAttr('hidden');
						$('#sign .sign-a-wrapper div.forget').css('float','right');
					}else if(newHashArr[2] === 'forget'){
						$('#sign .sign-input-captcha,#sign .sign-button-forget,#sign .sign-a-wrapper div.login,#sign .sign-a-wrapper div.register').removeAttr('hidden');
						$('#sign .sign-a-wrapper div.register').css('float','right');
					}
				}
			}else{
				if(oldHashArr[1] === 'sign'){
					$('#sign').attr('hidden','hidden');
					$('#layout').removeAttr('hidden');
					$('#layout div.'+newHashArr[1]).removeAttr('hidden');
					$('#layout div.'+newHashArr[1]+' li.'+newHashArr[2]).addClass('selected');
					$('#layout div.lay-top li.'+newHashArr[1]).addClass('selected');
					$('#layout div.lay-main div.'+newHashArr[2]).removeAttr('hidden');
				}else{
					if(oldHashArr[1] === newHashArr[1]){
						$('#layout div.'+oldHashArr[1]+' li.'+oldHashArr[2]).removeClass('selected');
					}else{
						$('#layout div.'+oldHashArr[1]).attr('hidden','hidden');
						$('#layout div.'+newHashArr[1]).removeAttr('hidden');
						$('#layout div.lay-top li.'+oldHashArr[1]).removeClass('selected');
						$('#layout div.lay-top li.'+newHashArr[1]).addClass('selected');
					}
					$('#layout div.'+newHashArr[1]+' li.'+newHashArr[2]).addClass('selected');
					$('#layout div.lay-main div.'+oldHashArr[2]).attr('hidden','hidden');
					$('#layout div.lay-main div.'+newHashArr[2]).removeAttr('hidden');
				}
			}
		},	
	}
})(window.kaidanbao);