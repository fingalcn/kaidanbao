/**
 * http://usejsdoc.org/
 * 为了方便，快捷，仅能保证99.9%的一致性，如下情况可能导致不一致：
 * 1，离线使用后，未通过在线登陆上传数据
{"ln":"13702307103","dbv":20161022,"ll13702307103":1478176819793,"lp13702307103":"0b9033f6122972a588cd2b41e11dedce","ui13702307103":21,"si13702307103":1,"bi13702307103":103}
 */
(function(k){
	var u = k.utils;
	var sse;
	var upl = function(comp){
		var ups = [];
		k.dao.query_upddb(function(finish,v){
			if(finish){
				if(ups.length > 0){
					k.net.api('/user/upl',ups,function(err,r){
						if(err){
						}else{
							if(r.obj.all){
								k.dao.clearupddb();
							}else{
								for(var i in r.obj.ids){
									k.dao.delupddb(r.obj.ids[i]);
								}
							}
						}
						if(comp) comp(err,r);
					});
				}else if(comp) comp(true);
			}else{
				ups.push(v);
			}
		},1);
	}
	var down=function(type,left,right,comp){
		k.net.api('/user/down',{ui:k.cache.sign.user_id,tp:type,right:right,left:left},function(err,r){
			if(err){
				comp(err,null);
			}else{
				if(type==='f') {
					for(var i in r.obj){
						k.cache.put(r.obj[i]);
						k.dao.put(r.obj[i].tn,r.obj[i]);
					}
				}else{
					for(var j in r.obj){
						k.dao.put(r.obj[j].tn,r.obj[j]);
						if(!k.cache.sign.loaded) k.aspect.bill_center.handle(r.obj[j]);
					}
				}
				comp(null,r.obj);
			}
		});
	}
	k.syn={
		upl:upl,
		down:down,
		init:function(comp){
			if(k.cache.sign.need_create_db){
				/** 本次新建数据库 */
				if(k.cache.sign.user) k.dao.put('sys',{id:'user',value:k.cache.sign.user});
				if(k.cache.sign.box_id) k.dao.put('sys',{id:'box_id',value:k.cache.sign.box_id});
				if(k.cache.sign.index_id){
					k.dao.put('sys',{id:'index_id',value:k.cache.sign.index_id});
					k.cache.sys.index_id          = k.cache.sign.index_id;
				}else k.cache.sys.index_id        = 0;
				k.cache.sys.syn_fixed_last_time   = 0;
				k.cache.sys.syn_dynamic_last_time = 0;
				k.cache.sys.doSomethingMonthly    = {};
				k.cache.sys.down_dynamic_months   = {};
				
				var now = u.date.getNow();
				down('f',0,0,function(err,r){
					if(err){//下载失败f
					}else{
						k.cache.sys.syn_fixed_last_time = now;
						k.dao.put('sys',{id:'syn_fixed_last_time',value:now});
						now = u.date.getNow();
						//订单表首次下载4个月的记录进行统计
						down('d',k.cache.dates.mts[k.conf.kdb.ms],0,function(err1,r1){
							if(err1){//下载失败d
							}else{
								k.cache.sys.syn_dynamic_last_time = now;
								k.dao.put('sys',{id:'syn_dynamic_last_time',value:now});
								comp();
							}
						});
					}
				});
			}else{
				/** 再次登录 */
				k.dao.query_sys(function(err,r){
					if(r){
						k.cache.sys[r.id] = r.value;
					}else{
						if(k.cache.sign.user) k.dao.put('sys',{id:'user',value:k.cache.sign.user});
						else {
							k.cache.sign.user = k.cache.sys.user;
							k.cache.sign.staff = k.cache.sys.user['staff'+k.cache.sign.staff_id];
						}
						k.cache.sys.index_id              = k.cache.sys.index_id              || 0;
						k.cache.sys.syn_fixed_last_time   = k.cache.sys.syn_fixed_last_time   || 0;
						k.cache.sys.syn_dynamic_last_time = k.cache.sys.syn_dynamic_last_time || 0;
						k.cache.sys.doSomethingMonthly    = k.cache.sys.doSomethingMonthly    || {};
//						k.cache.sys.save_static_months    = {};
						k.cache.sys.down_dynamic_months   = k.cache.sys.down_dynamic_months   || {};
						if(k.cache.sys.box_id){
							if(k.cache.sys.box_id !== k.cache.sign.box_id){
								//localStorage被篡改，清除退出
								k.aspect.exit(true);
								window.location.href = './';
							}
						}else k.dao.put('sys',{id:'box_id',value:k.cache.sign.box_id});
						
						if(k.cache.sign.session){  //与服务器同步数据
							upl(function(){  //先上传，再下载
								var now = u.date.getNow();
								down('f',k.cache.sys.syn_fixed_last_time,0,function(err,r){
									if(err){//下载失败f
									}else{
										k.cache.sys.syn_fixed_last_time = now;
										k.dao.put('sys',{id:'syn_fixed_last_time',value:now});
									}
									now = u.date.getNow();
									down('d',k.cache.sys.syn_dynamic_last_time,0,function(err1,r1){
										if(err1){//下载失败d
										}else{
											k.cache.sys.syn_dynamic_last_time = now;
											k.dao.put('sys',{id:'syn_dynamic_last_time',value:now});
										}
										comp();
									});
								});
							});
						}else comp();
					}
				});
			}
		},
		sse:{
			init:function(){//server send event
				sse = new EventSource('/event/sse?'+k.cache.sign.session.usb+'&'+k.cache.sign.session.token);
				sse.onmessage = function(e){//{type:类型,value:值}
//					console.log('<li>'+ e.data +'</li> - '+u.date.getTimeFormat(0,'dt'));
					var msg=JSON.parse(e.data);
					if(msg.type==='logout'){
						//强制下线
						sse.close();
						if(msg.value === 'nyzbcdl'){
							k.aspect.noty.confirm('<br /><h1>下线通知</h1><br />您已经在别处登录。',function(){
								window.location.href = './';
							},true);
						}else{
							//sse异常不强制下线
//							k.aspect.noty.confirm('<br /><h1>下线通知</h1><br />'+msg.value,function(){
//								window.location.href = './';
//							},true);
						}
					}else if(msg.type==='addOne'){
						//添加一条记录
						if(msg.value.tp == 'f'){
							k.dao.addOne(msg.value,function(err,val){
								if(val) {
									k.aspect.manage.change_fixed_action(val);
								}
							},2);
						}else if(msg.value.tp == 'd'){
							k.dao.addOne(msg.value,function(err,val){
								if(val) {
									k.aspect.bill_center.handle(val,function(){});
									var box = '#layout div.'+k.frame.current_plugin;
									if(!$(box+' div.kc-manage-box input.s-input').val()) $(box+' div.kc-manage-box button.s-btn').click();
								}
							},2);
						}
					}else if(msg.type==='updOne'){
						//更新一条记录
						if(msg.value.tp == 'f'){
							k.dao.updOne(msg.value,function(err,val){
								if(val) k.aspect.manage.change_fixed_action(val);
							},2);
						}else if(msg.value.tp == 'd'){
							k.dao.updOne(msg.value,function(err,val){
								if(val) k.aspect.bill_center.handle(val,function(){});
								var box = '#layout div.'+k.frame.current_plugin;
								if(!$(box+' div.kc-manage-box input.s-input').val()) $(box+' div.kc-manage-box button.s-btn').click();
							},2);
						}
					}else if(msg.type==='print'){
						//远程打印
					}else if(msg.type==='signin'){
						//上线通知
						kaidanbao.plugin.usercenter.stafflist.signin(msg.value);
					}else if(msg.type==='signout'){
						//下线通知
						kaidanbao.plugin.usercenter.stafflist.signout(msg.value);
					}else{
						//其他
					}
				}
//				sse.onerror=function(){
//					console.log('sse err , close'+u.date.getTimeFormat(0,'dt'));
//					k.plugin.usercenter.stafflist.signout_all();
//					sse.close();
//				}
			},
			close:function(){
				if(sse) sse.close();
			}
		}
	}
})(window.kaidanbao);