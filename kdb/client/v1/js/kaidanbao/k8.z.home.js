/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	var code_sended;
	var _sid;//私有化sid,防止被篡改
	p.welcome={
		release:function(){ $('#home-chart1').remove();$('#home-chart2').remove(); },
		reload:function(){ 
			setTimeout(function(){
				p.welcome.load_chart();
			}, 200); 
		},
		load_chart:function(){
			$('#layout div.lay-main div.chart-box div.content').append('<div id="home-chart1"></div><div id="home-chart2"></div>');
			var width = $('#layout div.lay-main div.chart-box div.content').width();
			var height = $('#layout div.lay-main div.chart-box div.content').height();
			var fs = parseInt($('div').eq(0).css('font-size'));
			
			document.getElementById('home-chart1').style.width = (width+'px');
			document.getElementById('home-chart1').style.height = (height/2)+'px';
			
			document.getElementById('home-chart2').style.width = (width+'px');
			document.getElementById('home-chart2').style.height = (height/2)+'px';
			
			// 基于准备好的dom，初始化echarts实例
	        var myChart1 = echarts.init(document.getElementById('home-chart1'),'wonderland');
			var myChart2 = echarts.init(document.getElementById('home-chart2'),'wonderland');

			var prod={},v,pid,pd=[],pd_name=[],pd_data=[];
			var td0 = 't'+k.cache.dates.mt[0],t0;
			var td1 = 't'+k.cache.dates.mt[1],t1;
			var td2 = 't'+k.cache.dates.mt[2],t2;
			for(var name in k.cache.name_cache.customer){
				v = k.cache.get(k.cache.name_cache.customer[name]);
				t0 = v[td0];t1 = v[td1];t2 = v[td2];
				for(pid in t0){
					prod[pid] = prod[pid]||0;
					prod[pid] += t0[pid][0];
				}
				for(pid in t1){
					prod[pid] = prod[pid]||0;
					prod[pid] += t1[pid][0];
				}
				for(pid in t2){
					prod[pid] = prod[pid]||0;
					prod[pid] += t2[pid][0];
				}
			}
			var date,dc=[],dc_name=[],dc_data=[];
			for(pid in prod){
				pd.push([pid,prod[pid]]);
			}
			pd.sort(function(a,b){
				return a[1]<b[1]?1:-1;
			});
			for(var i=0;i<51;i++){
				date = u.date.getDay(-i);
				if(!k.cache.day_chart[date]){
					k.cache.day_chart[date] = 0;
				}else k.cache.day_chart[date] = parseInt(k.cache.day_chart[date]);
				if(!pd[i]) pd.push([0,0]);
			}
			for(var i in pd){
				if(i > 51) break;
				v = pd[i];
				pd_name.push(k.cache.get(v[0]).name||'[商品名称]');
				pd_data.push(parseInt(v[1]));
			}
			//日期统计
			for(date in k.cache.day_chart){
				dc.push([date,k.cache.day_chart[date]]);
			}
			dc.sort(function(a,b){
				return a[0] > b[0]?1:-1;
			});
			for(var i in dc){
				dc_name.push(dc[i][0]);
				dc_data.push(dc[i][1]);
			}
	        // 指定图表的配置项和数据
			var grid={ left:'6%', right:'5%', bottom:'13%', top:'18%' };
			var tooltip={ trigger: 'axis',axisPointer : {type : 'shadow'} };
			// 使用刚指定的配置项和数据显示图表。
	        myChart1.setOption({
	        	title: { text: '按天统计销售额',textStyle:{fontSize:fs+2}},grid:grid,tooltip:tooltip,
	        	xAxis: { data: dc_name },yAxis: {},
	        	series: [{name: '销售额',type: 'line',data: dc_data,
	                markLine : {data : [{type : 'average', name: '平均值'}]}
	            }]
	        });
	        myChart2.setOption({
	        	title: { text: '近期商品畅销榜',textStyle:{fontSize:fs+2}},grid:grid,tooltip:tooltip,
	        	xAxis: { data: pd_name },yAxis: {},
	        	series: [{name: '近三个月销售额',type: 'bar',data: pd_data }]
	        });
		},
		init:function(){
			var box = '#layout div.lay-main .welcome';
			$('#layout div.lay-main').append(' \
				<div hidden class="welcome"> \
					<div class="pan-box chart-box"> \
						<div class="title">欢迎使用开单宝！惜时光，演绎精彩生活。</div> \
						<div class="content"><div class="notice" hidden></div> \
						</div> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">登录信息</div> \
						<div class="content"> \
						</div> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">服务信息</div> \
						<div class="content"> \
						</div> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">全屏</div> \
						<svg class="full" version="1.1" viewBox="0 -70 1034 1034"><path d="M1024 960h-416l160-160-192-192 96-96 192 192 160-160zM1024-64v416l-160-160-192 192-96-96 192-192-160-160zM0-64h416l-160 160 192 192-96 96-192-192-160 160zM0 960v-416l160 160 192-192 96 96-192 192 160 160z"></path></svg> \
						<svg hidden class="small" version="1.1" viewBox="0 -70 1034 1034"><path d="M576 512h416l-160 160 192 192-96 96-192-192-160 160zM576 384v-416l160 160 192-192 96 96-192 192 160 160zM448 384.004h-416l160-160-192-192 96-96 192 192 160-160zM448 512v416l-160-160-192 192-96-96 192-192-160-160z"></path></svg> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">安全退出</div> \
						<svg class="exit" version="1.1" viewBox="0 -70 1034 1034"><path d="M640 813.412v-135.958c36.206-15.804 69.5-38.408 98.274-67.18 60.442-60.44 93.726-140.8 93.726-226.274s-33.286-165.834-93.726-226.274c-60.44-60.44-140.798-93.726-226.274-93.726s-165.834 33.286-226.274 93.726c-60.44 60.44-93.726 140.8-93.726 226.274s33.286 165.834 93.726 226.274c28.774 28.774 62.068 51.378 98.274 67.182v135.956c-185.048-55.080-320-226.472-320-429.412 0-247.424 200.578-448 448-448 247.424 0 448 200.576 448 448 0 202.94-134.95 374.332-320 429.412zM448 960h128v-512h-128z"></path></svg> \
					</div> \
					<div class="pan-box note-box"> \
						<div class="title">微信号</div> \
						<img src="/res/site/img/vx.jpg" title="公众号：kaidanme"> \
					</div> \
					<div hidden class="pan-box note-box"> \
						<div class="title">通知公告</div> \
					</div> \
				</div>');
			if(!_sid) _sid=k.cache.sign.staff_id;
			var local = k.cache.local();
			var device = local['u'+k.cache.sign.user_id];
			var staff = k.cache.sign.user['staff'+_sid];
			setTimeout(function(){
				p.welcome.load_chart();
			}, 200);
			
			$(box+' svg.full').click(function(){
				var docElm = document.documentElement;
			    if (docElm.requestFullscreen) { docElm.requestFullscreen();
			    }else if (docElm.mozRequestFullScreen) { docElm.mozRequestFullScreen();
			    }else if (docElm.webkitRequestFullScreen) { docElm.webkitRequestFullScreen();
			    }else if (elem.msRequestFullscreen) { elem.msRequestFullscreen(); }
				$(this).attr('hidden','hidden');
				$(box+' svg.small').removeAttr('hidden');
			});
			$(box+' svg.small').click(function(){
				if (document.exitFullscreen) { document.exitFullscreen();
			    }else if (document.mozCancelFullScreen) { document.mozCancelFullScreen();
			    }else if (document.webkitCancelFullScreen) { document.webkitCancelFullScreen();
			    }else if (document.msExitFullscreen) { document.msExitFullscreen(); }
				$(this).attr('hidden','hidden');
				$(box+' svg.full').removeAttr('hidden');
			});
			$(box+' svg.exit').click(function(){
				k.aspect.noty.confirm('<br /><h1>安全退出</h1><br /><input class="safe" style="width:23px;height:13px;" type="checkbox" checked="checked">此设备安全且常用',function(){
					if($('div.noty.confirm input.safe').prop('checked')){
						k.aspect.exit();
					}else k.aspect.exit(true);
					window.location.href = './';
				});
			});
			$(box+' .note-box:eq(0) .content').html('用户：'+local.c+'('+k.cache.get(staff.bind_clerk).name+')'+
					'</br>时间：'+u.date.getTimeFormat(local['s'+local.c].ll,'t')+
					'</br>设备：'+(device.remark||device.hw)+
					'</br>平台：'+device.bw+
					'</br>系统：'+device.os);
			$(box+' .note-box:eq(1) .content').html('软件：开单宝</br>邮箱：kaidanbao@126.com');
		},
	}
	p.usercenter={
		setting:{
			load:function(){
				var box = '#layout div.usercenter',html='';
				var setting = k.cache.setup('setting')||{},def;
				def = setting['salebilling-'+_sid]||{};
				html += ('<span onclick="kaidanbao.plugin.usercenter.setting.modify(\'salebilling\');">销售开单</span>：'+(def.settlement=='x'?'现付全款':'签单对账')+'，'+(k.cache.get(def.account_id).name||'现金')+'，'+(k.cache.get(def.repository_id).name||'主仓库')+' ...');
				def = setting['bringbilling-'+_sid]||{};
				html += ('<br /><span onclick="kaidanbao.plugin.usercenter.setting.modify(\'bringbilling\');">采购开单</span>：'+(def.settlement=='x'?'现付全款':'签单对账')+'，'+(k.cache.get(def.account_id).name||'现金')+'，'+(k.cache.get(def.repository_id).name||'主仓库')+' ...');
				$(box+' .setting-box .content').html(html);
				def = setting['store-'+_sid]||{};
				html += ('<br /><span onclick="kaidanbao.plugin.usercenter.setting.modify(\'store\');">库存盘点</span>：'+(k.cache.get(def.checker_id||k.cache.sign.user['staff'+_sid].bind_clerk).name)+'，'+(k.cache.get(def.repository_id).name||'主仓库')+' ...');
				$(box+' .setting-box .content').html(html);
				def = setting['allotbilling-'+_sid]||{};
				html += ('<br /><span onclick="kaidanbao.plugin.usercenter.setting.modify(\'allotbilling\');">库存调拨</span>：'+(k.cache.get(def.alloter_id||k.cache.sign.user['staff'+_sid].bind_clerk).name)+'，'+(k.cache.get(def.callout_id).name||'主仓库')+'，'+(k.cache.get(def.callin_id).name||'主仓库')+' ...');
				$(box+' .setting-box .content').html(html);
				def = setting['productbilling-'+_sid]||{};
				html += ('<br /><span onclick="kaidanbao.plugin.usercenter.setting.modify(\'productbilling\');">生产开单</span>：'+(k.cache.get(def.worker_id||k.cache.sign.user['staff'+_sid].bind_clerk).name)+'，'+(k.cache.get(def.repository_id).name||'主仓库')+' ...');
				$(box+' .setting-box .content').html(html);
			},
			modify:function(pn){
				var setting = k.cache.setup('setting');
				var def = setting[pn+'-'+_sid]||{};
				if(pn==='salebilling'){
					$.facebox(
							'<br /><div class="fb-input-wrapper"> \
							<label>结算方式：</label> \
							<select class="settlement"><option value="q">签单对账</option><option value="x">现付全款</option></select></div> \
							<div class="fb-input-wrapper"> \
							<label>收款账户：</label><select class="account"></select></div> \
							<div class="fb-input-wrapper"> \
							<label>仓库：</label><select class="repository"></select></div> \
							<div class="fb-input-wrapper"> \
							<label>销售员：</label><input class="clerk saler_id"></div> \
							<div class="fb-input-wrapper"> \
							<label>出纳员：</label><input class="clerk cashier_id" /></div> \
							<div class="fb-input-wrapper"> \
							<label>&nbsp;</label> \
							<button onclick="kaidanbao.plugin.usercenter.setting.update(\'salebilling\');">确定</button> \
					</div>');
					$('#facebox div.title').html('默认设置 > 销售开单');
					k.aspect.manage.selectAccountRefresh($('#facebox select.account'));
					k.aspect.manage.selectRepositoryRefresh($('#facebox select.repository'));
					if(def.settlement) $('#facebox select.settlement').val(def.settlement);
					if(def.account_id) $('#facebox select.account').val(def.account_id);
					if(def.repository_id) $('#facebox select.repository').val(def.repository_id);
					$('#facebox input.saler_id').val(k.cache.get(def.saler_id).name||k.cache.get(k.cache.sign.user['staff'+_sid].bind_clerk).name);
					$('#facebox input.cashier_id').val(k.cache.get(def.cashier_id).name||k.cache.get(k.cache.sign.user['staff'+_sid].bind_clerk).name);
				}else if(pn === 'bringbilling'){
					$.facebox(
							'<br /><div class="fb-input-wrapper"> \
							<label>结算方式：</label> \
							<select class="settlement"><option value="q">签单对账</option><option value="x">现付全款</option></select></div> \
							<div class="fb-input-wrapper"> \
							<label>付款账户：</label><select class="account"></select></div> \
							<div class="fb-input-wrapper"> \
							<label>仓库：</label><select class="repository"></select></div> \
							<div class="fb-input-wrapper"> \
							<label>采购员：</label><input class="clerk buyer_id"></div> \
							<div class="fb-input-wrapper"> \
							<label>出纳员：</label><input class="clerk cashier_id" /></div> \
							<div class="fb-input-wrapper"> \
							<label>&nbsp;</label> \
							<button onclick="kaidanbao.plugin.usercenter.setting.update(\'bringbilling\');">确定</button> \
					</div>');
					$('#facebox div.title').html('默认设置 > 采购开单');
					k.aspect.manage.selectAccountRefresh($('#facebox select.account'));
					k.aspect.manage.selectRepositoryRefresh($('#facebox select.repository'));
					if(def.settlement) $('#facebox select.settlement').val(def.settlement);
					if(def.account_id) $('#facebox select.account').val(def.account_id);
					if(def.repository_id) $('#facebox select.repository').val(def.repository_id);
					$('#facebox input.buyer_id').val(k.cache.get(def.buyer_id||k.cache.sign.user['staff'+_sid].bind_clerk).name);
					$('#facebox input.cashier_id').val(k.cache.get(def.cashier_id||k.cache.sign.user['staff'+_sid].bind_clerk).name);
				}else if(pn === 'store'){
					$.facebox(
							'<br /><div class="fb-input-wrapper"> \
							<label>仓库：</label><select class="repository"></select></div> \
							<div class="fb-input-wrapper"> \
							<label>盘点员：</label><input class="clerk checker_id"></div> \
							<div class="fb-input-wrapper"> \
							<label>&nbsp;</label> \
							<button onclick="kaidanbao.plugin.usercenter.setting.update(\'store\');">确定</button> \
					</div>');
					$('#facebox div.title').html('默认设置 > 库存盘点');
					k.aspect.manage.selectRepositoryRefresh($('#facebox select.repository'));
					if(def.repository_id) $('#facebox select.repository').val(def.repository_id);
					$('#facebox input.checker_id').val(k.cache.get(def.checker_id||k.cache.sign.user['staff'+_sid].bind_clerk).name);
				}else if(pn === 'allotbilling'){
					$.facebox(
							'<br /><div class="fb-input-wrapper"> \
							<label>发货仓库：</label><select class="repository callout_id"></select></div> \
							<div class="fb-input-wrapper"> \
							<label>收货仓库：</label><select class="repository callin_id"></select></div> \
							<div class="fb-input-wrapper"> \
							<label>调拨员：</label><input class="clerk alloter_id"></div> \
							<div class="fb-input-wrapper"> \
							<label>&nbsp;</label> \
							<button onclick="kaidanbao.plugin.usercenter.setting.update(\'allotbilling\');">确定</button> \
					</div>');
					$('#facebox div.title').html('默认设置 > 调拨开单');
					k.aspect.manage.selectRepositoryRefresh($('#facebox select.repository'));
					if(def.callout_id) $('#facebox select.callout_id').val(def.callout_id);
					if(def.callin_id) $('#facebox select.callin_id').val(def.callin_id);
					$('#facebox input.alloter_id').val(k.cache.get(def.alloter_id||k.cache.sign.user['staff'+_sid].bind_clerk).name);
				}else if(pn === 'productbilling'){
					$.facebox(
							'<br /><div class="fb-input-wrapper"> \
							<label>仓库：</label><select class="repository"></select></div> \
							<div class="fb-input-wrapper"> \
							<label>生产员：</label><input class="clerk worker_id"></div> \
							<div class="fb-input-wrapper"> \
							<label>&nbsp;</label> \
							<button onclick="kaidanbao.plugin.usercenter.setting.update(\'productbilling\');">确定</button> \
					</div>');
					$('#facebox div.title').html('默认设置 > 生产开单');
					k.aspect.manage.selectRepositoryRefresh($('#facebox select.repository'));
					if(def.repository_id) $('#facebox select.repository').val(def.repository_id);
					$('#facebox input.worker_id').val(k.cache.get(def.worker_id).name||k.cache.get(k.cache.sign.user['staff'+_sid].bind_clerk).name);
				}
				k.aspect.atcp.bind($('#facebox input.clerk'),'clerk',{
					onSelect:function(s){
						$(this).val(k.cache.get(s.data.id).name);
					},
				});
			},
			update:function(pn){
				var setting = k.cache.setup('setting'),
					def = setting[pn+'-'+_sid]||{},
					up={_id:setting._id,tn:'setup'};
				if(pn==='salebilling'){
					def.settlement    = $('#facebox select.settlement').val();
					def.account_id    = parseInt($('#facebox select.account').val());
					def.repository_id = parseInt($('#facebox select.repository').val());
					def.saler_id   = k.cache.name_cache.clerk[$('#facebox input.saler_id').val()];
					def.cashier_id = k.cache.name_cache.clerk[$('#facebox input.cashier_id').val()];
				}else if(pn === 'bringbilling'){
					def.settlement    = $('#facebox select.settlement').val();
					def.account_id    = parseInt($('#facebox select.account').val());
					def.repository_id = parseInt($('#facebox select.repository').val());
					def.buyer_id   = k.cache.name_cache.clerk[$('#facebox input.buyer_id').val()];
					def.cashier_id = k.cache.name_cache.clerk[$('#facebox input.cashier_id').val()];
				}else if(pn === 'store'){
					def.repository_id = parseInt($('#facebox select.repository').val());
					def.checker_id   = k.cache.name_cache.clerk[$('#facebox input.checker_id').val()];
				}else if(pn === 'allotbilling'){
					def.callout_id = parseInt($('#facebox select.callout_id').val());
					def.callin_id = parseInt($('#facebox select.callin_id').val());
					def.alloter_id   = k.cache.name_cache.clerk[$('#facebox input.alloter_id').val()];
				}else if(pn === 'productbilling'){
					def.repository_id = parseInt($('#facebox select.repository').val());
					def.worker_id   = k.cache.name_cache.clerk[$('#facebox input.worker_id').val()];
				}
				up[pn+'-'+_sid] = def;
				up.value = setting.value||{};
				if(!up.value.repository_id) up.value.repository_id = k.cache.name_cache.repository['主仓库'];
				if(!up.value.account_id) up.value.account_id = k.cache.name_cache.account['现金'];
				k.dao.updOne(up,function(){
					k.aspect.noty.message('操作成功！');
					$.facebox.close();
					kaidanbao.plugin.usercenter.setting.load();
				});
			}
		},
		log:{
			load:function(){
				var box = '#layout div.usercenter';
				$(box+' .log-box .content').html('<table><tr><th>操作</th><th>时间</th><th>备注</th></tr></table>');
				var count=0;
				k.dao.query_logs(function(err,r){
					if(r && count++ <100){
						$(box+' .log-box table').append('<tr><td>'+r.type+'</td><td>'+u.date.getTimeFormat(r.lm)+'</td><td></td></tr>');
					}
				});
			}
		},
		role:{
			upset:function(ri){
				var trs='',opp=0,n=0;
				var rs = k.conf.role_set,i,n=0;
				var f=function(ro){
					trs+='<td><input data-r="'+ro.en+'" type="checkbox" id="checkbox_b'+(++n)+'" class="chk_1" hidden /><label for="checkbox_b'+n+'"></label>'+ro.cn+'</td>';
				}
				trs+='<tr><td style="font-weight:bold;font-size:larger;color:#078;" rowspan="2">查看</td>';
				for(i in rs.find.basic){ f(rs.find.basic[i]); }
				trs+='</tr>';
				for(i in rs.find.bill){ f(rs.find.bill[i]); } 
				trs+='</tr><tr><td colspan="7"></td></tr>';
				
				trs+='<tr><td style="font-weight:bold;font-size:larger;color:green;" rowspan="2">新增</td>';
				for(i in rs.add.basic){ f(rs.add.basic[i]); }
				trs+='</tr>';
				for(i in rs.add.bill){ f(rs.add.bill[i]); } 
				trs+='</tr><tr><td colspan="7"></td></tr>';
				
				trs+='<tr><td style="font-weight:bold;font-size:larger;color:#f07800;">修改</td>';
				for(i in rs.upd.basic){ f(rs.upd.basic[i]); }
				trs+='</tr><tr><td colspan="7"></td></tr>';
				
				trs+='<tr><td style="font-weight:bold;font-size:larger;color:#f08;" rowspan="2">删除</td>';
				for(i in rs.del.basic){ f(rs.del.basic[i]); }
				trs+='</tr>';
				for(i in rs.del.bill){ f(rs.del.bill[i]); } 
				trs+='</tr>';
				
				trs+='</table><br /><table><tr><td style="font-weight:bold;font-size:larger;color:grey;" rowspan="3">其他</td>';
				for(i in rs.other.value){ f(rs.other.value[i]); }
				trs+='</tr>';
				for(i in rs.other.v1){ f(rs.other.v1[i]); } 
				trs+='</tr>';
				for(i in rs.other.v2){ f(rs.other.v2[i]); } 
				trs+='</tr>';
				
				$.facebox('名称：<input class="name" style="width:100px;" />，说明：<input class="remark" style="width:200px;" /><br /><br /><table>'+trs+'</table>');
				$('#facebox div.footer').html('<button class="ensure">确定</button>');
				var role = k.cache.setup('role'),len=role.value;
				if(ri){
					//修改
					$('#facebox div.title').html('修改角色-权限设置');
					var old_role = role['r'+ri].v||{};
					$('#facebox input.chk_1').each(function(i){
						if(old_role[$('#facebox input.chk_1').eq(i).attr('data-r')]) $('#facebox input.chk_1').eq(i).prop('checked','checked');
					});
					$('#facebox input.name').val(role['r'+ri].name);
					$('#facebox input.remark').val(role['r'+ri].remark);
				}else{
					//新增
					$('#facebox div.title').html('新增角色-权限设置');
					len += 1;ri = role.value;
				}
				if(_sid === 1){
					$('#facebox div.footer .ensure').click(function(){
						var v={};
						var name = $('#facebox input.name').val().trim();
						if(!name) {
							k.aspect.noty.message('角色名称不能为空');
							return;
						}
						$('#facebox input.chk_1').each(function(i){
							if($('#facebox input.chk_1').eq(i).prop('checked')) {
								v[$('#facebox input.chk_1').eq(i).attr('data-r')] = 1;
							}
						});
						var role_upd = {_id:role._id,value:len,tn:'setup',type:'role'};
						role_upd['r'+ri] = {
								name  : $('#facebox input.name').val(),
								remark: $('#facebox input.remark').val(),
								v: v
						};
						k.dao.updOne(role_upd,function(){
							$.facebox.close();
							window.kaidanbao.plugin.usercenter.role.load();
						});
					});
				}else{
					$('#facebox input').attr('disabled','disabled');
					$('#facebox div.footer .ensure').remove();
				}
			},load:function(){
				var box = '#layout div.usercenter';
				//角色
				var role=k.cache.setup('role');
				$(box+' .role-box .content').html('<table><tr><th>名称</th><th>说明</th></tr></table>');
				for(var n=0;n<role.value;n++){
					var name = role['r'+n].name;
					if(!role['r'+n].f){//可修改
						name = '<span onclick="kaidanbao.plugin.usercenter.role.upset('+n+');">'+name+'</span>';
					}
					$(box+' .role-box table').append('<tr><td>'+name+'</td><td>'+role['r'+n].remark+'</td></tr>');
				}
			}
		},
		inc:{
			load:function(){
				var user = k.cache.sign.user;
				var d_len=0;
				for(var key in user.devices){
					d_len ++;
				}
				if(_sid == 1){
					$('#layout div.usercenter .inc-info .content').html(
							'<span onclick="kaidanbao.plugin.usercenter.inc.change(\'inc\');">公司简称</span>：'+user.inc+'<br />'+
							'<span onclick="kaidanbao.plugin.usercenter.inc.change(\'mobile\');">安全电话</span>：'+(user.safe_mobile || '')+'<br />'+
							'<span onclick="kaidanbao.plugin.usercenter.inc.devices(\'user\');">安全设备</span>：'+d_len+'个<br />'+
							'注册日期：'+u.date.getTimeFormat(user.ct,'d')+'<br />'
					);
				}else{
					$('#layout div.usercenter .inc-info .content').html(
							'公司简称：'+user.inc+'<br />'+
							'安全电话：'+(user.safe_mobile || '')+'<br />'+
							'安全设备：'+d_len+'个<br />'+
							'注册日期：'+u.date.getTimeFormat(user.ct,'d')+'<br />'
					);
				}
			},
			devices:function(us,si){
				var devices,box_info,usd=k.cache.sign.user.devices,dv_oprate;
				si = si||_sid;
				var tds='<tr><th>编号</th><th>名称</th><th>IP地址</th><th>上次登录时间</th><th>用户</th><th>操作</th></tr>',dv;
				if(us == 'user'){
					box_info = 'inc';
					for(var key in usd){
						dv = usd[key];
						if(k.cache.sign.box_id===dv.bi) dv_oprate = '[本机设备]';
						else dv_oprate = '';
						tds+=('<tr class="'+key+'"><td>'+dv.bi%9999+'</td><td style="width:40%;"><input style="width:90%;" maxlength="8" class="device" data-key="'+key+'" value="'+(dv.remark||dv.hw)+'"></td><td>'+(dv.ip||'')+'</td><td>'+(dv.lm?u.date.getTimeFormat(dv.lm):'')+'</td><td>'+k.cache.get(k.cache.sign.user['staff'+(dv.mi||1)].bind_clerk).name+'</td><td>'+(dv_oprate||('<span onclick="$(\'#facebox tr.'+key+'\').remove();">删除</span>'))+'</td></tr>');
					}
				}else{
					box_info = 'staff';
					devices = k.cache.sign.user['staff'+si].devices;
					for(var key in devices){
						dv = devices[key];
						if(k.cache.sign.box_id===dv.bi){
							dv_oprate = '[本机设备]';
						}else if(k.cache.sign.online[k.cache.sign.user_id+'-'+si+'-'+dv.bi]){
							dv_oprate = '[登录设备]';
						}else dv_oprate = '';
						if(!usd[key]) continue;
						tds+=('<tr class="device '+key+'" data-key="'+key+'"><td>'+dv.bi%9999+'</td><td style="width:40%;">'+(usd[key].remark||usd[key].hw)+'</td><td>'+(dv.ip||'')+'</td><td>'+(dv.lm?u.date.getTimeFormat(dv.lm):'')+'</td><td>'+k.cache.get(k.cache.sign.user['staff'+si].bind_clerk).name+'</td><td>'+(dv_oprate||('<span onclick="$(\'#facebox tr.'+key+'\').remove();">删除</span>'))+'</td></tr>');
					}
				}
				$.facebox('<table style="width:580px;">'+tds+'</table>');
				$('#facebox div.title').html('登录设备管理');
				$('#facebox div.footer').html('<button onclick="kaidanbao.plugin.usercenter.'+box_info+'.update(\'device\','+si+');">确定</button>');
			},
			update:function(type){
				var user = k.cache.sign.user;
				var ur = {_id:user._id};
				var inc,mobile,devices;
				if(type == 'inc'){
					inc = $('#facebox input.inc').val().trim();
					if(!u.valid_hanname(inc)) return;
					ur.inc = inc;
				}else if(type=='mobile'){
					mobile = $('#facebox input.mobile').val().trim();
					var code = $('#facebox input.code').val().trim();
					var password = $('#facebox input.password').val();
					var pwd_local = k.safe.local_pwd(password);
					var loc = k.cache.local();
					if(!u.valid_mobile(mobile)) return;
					if(pwd_local != loc['s'+loc.c].pwd){
						k.aspect.noty.message('密码错误！');
						return;
					}
					if(code_sended && !u.valid_smscode(code)) return;
					ur.loginname = user.staff1.loginname;
					ur.safe_mobile = mobile;
					ur.code = parseInt(code);
				}else if(type=='device'){
					var old_dvs=k.cache.sign.user.devices;
					devices={};
					$('#facebox input.device').each(function(){
						var key = $(this).attr('data-key');
						if(old_dvs[key]) {
							devices[key] = old_dvs[key];
							devices[key]['remark'] = $(this).val();
						}
					});
					ur.devices=devices;
				}
				k.net.api('/manage/upduser',ur,function(err,r){
					if(r){
						if(r.obj.mobile){
							code_sended = true;
							k.aspect.noty.message('已发短信至:'+r.obj.mobile);
							$('#facebox button.send-msg').html('已发送').attr('disabled','disabled');
						}else{
							if(inc) window.kaidanbao.plugin.loading.change_inc(inc);
							if(mobile) user.safe_mobile = mobile;
							if(devices) user.devices = devices;
							
							window.kaidanbao.plugin.usercenter.inc.load();
							if(type=='device') window.kaidanbao.plugin.usercenter.staff.load();
							k.aspect.noty.message('操作成功！');
							$.facebox.close();
						}
					}
				});
			},
			change:function(type){
				code_sended = false;
				var user = k.cache.sign.user;
				$.facebox(
						'<br /><div class="fb-input-wrapper inc" hidden> \
						<label>公司简称：</label> \
						<input class="inc" maxlength="8" value="'+(user.inc || '')+'" /></div> \
						<div class="fb-input-wrapper mobile" hidden> \
						<label>旧手机号码：</label> \
						<input disabled="disabled" maxlength="11" value="'+(user.safe_mobile || '(无)')+'" /></div> \
						<div class="fb-input-wrapper mobile" hidden> \
						<label>新手机号码：</label> \
						<input class="mobile" maxlength="11" /></div> \
						<div class="fb-input-wrapper mobile" hidden> \
						<label>短信验证码：</label> \
						<input class="code" maxlength="4" style="width:120px;" /><button style="padding:5px;margin-left:2px;" onclick="kaidanbao.plugin.usercenter.inc.update(\''+type+'\');" class="send-msg">发短信</button></div> \
						<div class="fb-input-wrapper mobile" hidden> \
						<label>登录密码：</label> \
						<input class="password" type="password" /></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.inc.update(\''+type+'\');">提交</button> \
						</div>');
				$('#facebox div.'+type).removeAttr('hidden');
				if(type == 'inc'){
					$('#facebox div.title').html('修改公司名称');
				}else if(type=='mobile'){
					$('#facebox div.title').html('设置安全手机号码');
				}
			}
		},
		staff:{
			load:function(){
				var staff = k.cache.sign.user['staff'+_sid];
				var s_len=0;
				for(var key in staff.devices){
					if(k.cache.sign.user.devices[key]) s_len ++;
				}
				var role=k.cache.setup('role');
				$('#layout div.usercenter .staff-info .content').html(
						'<span onclick="kaidanbao.plugin.usercenter.staff.change(\'loginname\');">登录账号</span>：'+staff.loginname+'<br />'+
						'<span onclick="kaidanbao.plugin.usercenter.staff.change(\'login-pwd\');">登录密码</span>：******<br />'+
						'<span class="setnick" onclick="kaidanbao.plugin.usercenter.staff.change(\'nick\');">用户昵称</span>：'+(k.cache.get(staff.bind_clerk).name || '')+'<br />'+
						'<span onclick="kaidanbao.plugin.usercenter.inc.devices(\'staff\');">我的设备</span>：'+s_len+'个<br />'+
						'用户角色：'+role[staff.role || 'r0'].name+'<br />'+
						'到期日期：'+staff.due+'<br />'
				);
			},
			renewpay:function(si){
				si = si || _sid;
				var user = k.cache.sign.user,staff=user['staff'+si];
				k.aspect.pay({url:'/manage/renewal',
					param:{loginname : staff.loginname}
				},function(r){
					k.aspect.noty.confirm_close();
					k.aspect.noty.message('续期成功！');
					staff.due = r.obj.due;
					$.facebox.close();
					window.kaidanbao.plugin.usercenter.staff.load();
					window.kaidanbao.plugin.usercenter.stafflist.load();
				});
			},
			renewal:function(si){
				si = si || _sid;
				var user = k.cache.sign.user,staff=user['staff'+si];
				var due = u.date.getDay(366,staff.due);
				var min = u.date.getDay(366);
				if(due < min) due = min;
				$.facebox(
						'<br /><div class="fb-input-wrapper"> \
						<label>用户名称：</label> \
						<input class="inc" disabled="disabled" value="'+staff.loginname +'('+ (k.cache.get(staff.bind_clerk).name||'')+')" /></div> \
						<div class="fb-input-wrapper"> \
						<label>当前有效期至：</label> \
						<input class="inc" disabled="disabled" value="'+(staff.due)+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>续后有效期至：</label> \
						<input class="inc" disabled="disabled" value="'+due+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.staff.renewpay('+si+');">付款</button> \
						</div>');
				$('#facebox div.title').html('用户续费');
			},
			update:function(clazz,si){
				si = si || _sid;
				var oldstaff = k.cache.sign.user['staff'+si];
				var staff={_id:oldstaff._id},devices;
				if(clazz=='loginname'){
					staff.loginname=$('#facebox input.loginname').val().trim();
					if(!u.valid_loginname(staff.loginname)) return;
					if(staff.loginname == oldstaff.loginname) return;
				}else if(clazz=='login-pwd'){
					var oldpwd = $('#facebox input.oldpwd').val();
					var newpwd = $('#facebox input.newpwd').val();
					var newpwd1 = $('#facebox input.newpwd1').val();
					var old_pwd_local = k.safe.local_pwd(oldpwd);
					var new_pwd_local = k.safe.local_pwd(newpwd);
					var loc = k.cache.local();
					if(old_pwd_local != loc['s'+loc.c].pwd){
						k.aspect.noty.message('旧密码错误！');
						return ;
					}
					if(newpwd != newpwd1){
						k.aspect.noty.message('新密码不一致！');
						return ;
					}
					staff.password=k.safe.up_pwd(new_pwd_local,newpwd);
					staff.old_pwd=k.safe.up_pwd(old_pwd_local,oldpwd);
				}else if(clazz=='nick'){
					staff.nick=$('#facebox input.nick').val().trim();
					if(!u.valid_hanname(staff.nick)) return;
					if(k.cache.name_cache.clerk[staff.nick]){
						if(k.cache.name_cache.clerk[staff.nick] === oldstaff.bind_clerk) $.facebox.close();
						else k.aspect.noty.message('名字重复！');
						return;
					}
				}else if(clazz=='device'){
					var old_dvs= oldstaff.devices;
					devices={};
					$('#facebox tr.device').each(function(){
						var key = $(this).attr('data-key');
						if(old_dvs[key]) {
							devices[key] = old_dvs[key];
						}
					});
					staff.devices=devices;
				}else if(clazz=='role'){
					staff.role = $('#facebox select.role').val();
				}
				if(staff.nick){
					k.net.api('/manage/updstaff',staff,function(){
						k.dao.updOne({tn:'clerk',_id:oldstaff.bind_clerk,bind_si:_sid,name:staff.nick,name_py:u.pinyin.getSZM(staff.nick)},function(){
							k.aspect.atcp.auto(oldstaff.bind_clerk,'clerk');//更新职员atcp
							window.kaidanbao.plugin.usercenter.staff.load();
							window.kaidanbao.plugin.usercenter.stafflist.load();
							$.facebox.close();
								
						});
					});
				}else{
					k.net.api('/manage/updstaff',staff,function(err,r){
						if(r){
							u.extend(oldstaff,staff,true);
							var loc = k.cache.local();
							if(staff.loginname && staff.loginname != loc.c){
								loc['s'+staff.loginname] = loc['s'+loc.c];
								delete loc['s'+loc.c];
								loc.c = staff.loginname;
								k.cache.local(loc);
							}
							if(staff.password){
								if(loc['s'+loc.c]) loc['s'+loc.c]['pwd'] = new_pwd_local;
								k.cache.local(loc);
							}
							window.kaidanbao.plugin.usercenter.staff.load();
							window.kaidanbao.plugin.usercenter.stafflist.load();
							$.facebox.close();
						}
					});
				}
			},
			change:function(clazz){
				var oldstaff = k.cache.sign.user['staff'+_sid];
				$.facebox(
						'<br /><div hidden class="fb-input-wrapper loginname"> \
						<label>登录账号：</label> \
						<input class="loginname" value="'+oldstaff.loginname+'" /></div> \
						<div hidden class="fb-input-wrapper login-pwd"> \
						<label>旧密码：</label> \
						<input type="password" class="oldpwd" /></div> \
						<div hidden class="fb-input-wrapper login-pwd"> \
						<label>新密码：</label> \
						<input type="password" class="newpwd" /></div> \
						<div hidden class="fb-input-wrapper login-pwd"> \
						<label>确认密码：</label> \
						<input type="password" class="newpwd1" /></div> \
						<div hidden class="fb-input-wrapper nick"> \
						<label>用户昵称：</label> \
						<input class="nick" value="'+(k.cache.get(oldstaff.bind_clerk).name || '')+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.staff.update(\''+clazz+'\');">提交</button> \
						</div>');
				$('#facebox div.'+clazz).removeAttr('hidden');
				if(clazz=='loginname'){
					$('#facebox div.title').html('修改登录账号');
				}else if(clazz=='login-pwd'){
					$('#facebox div.title').html('修改登录密码');
				}else if(clazz=='nick'){
					$('#facebox div.title').html('修改用户昵称');
				}
			}
		},
		stafflist:{
			signout_all:function(){
				k.cache.sign.online={};
				$('#layout div.usercenter .staff-list table td.sf').css('font-weight','normal').css('color','#000').attr('title','离线');
			},
			signin:function(usb){
				var eq=parseInt(usb.split('-')[1]);
				k.cache.sign.online[usb]=1;
				$('#layout div.usercenter .staff-list table td.sf').eq(eq-1).css('font-weight','bold').css('color','green').attr('title','在线');
			},
			signout:function(usb){
				var eq=parseInt(usb.split('-')[1]);
				delete k.cache.sign.online[usb];
				$('#layout div.usercenter .staff-list table td.sf').eq(eq-1).css('font-weight','normal').css('color','#000').attr('title','离线');
			},
			updrole:function(si){
				var staff = k.cache.sign.user['staff'+si];
				$.facebox('<br /><div class="fb-input-wrapper"> \
						<label>用户名称：</label> \
						<input class="inc" disabled="disabled" value="'+staff.loginname +'('+ (k.cache.get(staff.bind_clerk).name||'')+')" /></div> \
						<div class="fb-input-wrapper"> \
						<label>用户角色：</label> \
						<select style="width:100px;" class="role" ></select></div><br /><br /><br />');
				$('#facebox div.title').html('修改用户角色');
				$('#facebox div.footer').html('<button onclick="kaidanbao.plugin.usercenter.staff.update(\'role\','+si+');">修改</button>');
				var role = k.cache.setup('role');
				for(var i=1;i<role.value;i++){
					$('#facebox select.role').append('<option value="r'+i+'">'+role['r'+i].name+'</option>');
				}
			},
			load:function(){
				var user = k.cache.sign.user,staff=user.staff1;
				$('#layout div.usercenter .staff-list .content').html(
						'<table><tr><th>昵称</th><th>账号</th><th>角色</th><th>到期</th></tr></table>'
				);
				var role = k.cache.setup('role');
				$('#layout div.usercenter .staff-list table').append('<tr><td class="sf">'+k.cache.get(staff.bind_clerk).name+'</td><td>'+staff.loginname+'</td><td>'+role['r0'].name+'</td><td><span onclick="kaidanbao.plugin.usercenter.staff.renewal(1);">'+staff.due+'</span></td></tr>');
				if(_sid===1){
					for(var si=2; si<=user.staff_len;si++){
						staff = user['staff'+si];
						$('#layout div.usercenter .staff-list table').append('<tr><td class="sf">'+k.cache.get(staff.bind_clerk).name
								+'</td><td><span onclick="kaidanbao.plugin.usercenter.inc.devices(\'staff\','+si+');">'+staff.loginname
								+'</span></td><td><span onclick="kaidanbao.plugin.usercenter.stafflist.updrole('+si+');">'+(role[(staff.role || 'r0')]).name
								+'</span></td><td><span onclick="kaidanbao.plugin.usercenter.staff.renewal('+si+');">'+staff.due+'</span></td></tr>');
					}
				}else{
					for(var si=2; si<=user.staff_len;si++){
						staff = user['staff'+si];
						$('#layout div.usercenter .staff-list table').append(
								'<tr><td class="sf">'+k.cache.get(staff.bind_clerk).name+'</td><td>'+staff.loginname
								+'</td><td>'+(role[(staff.role || 'r0')]).name
								+'</td><td><span onclick="kaidanbao.plugin.usercenter.staff.renewal('+si+');">'+staff.due+'</span></td></tr>');
					}
				}
				for(var key in k.cache.sign.online){
					$('#layout div.usercenter .staff-list table td.sf')
					.eq(parseInt(key.split('-')[1])-1)
					.css('font-weight','bold').css('color','green').attr('title','在线');
				}
				if(k.cache.sign.session){
					$('#layout div.usercenter .staff-list table td.sf').eq(_sid-1)
					.css('font-weight','bold').css('color','green').attr('title','在线');
				}
			},
			addpay:function(){
				var loginname = $('#facebox input.loginname').val().trim();
				var password = $('#facebox input.password').val().trim();
				var role = $('#facebox select.role').val();
				var nick = $('#facebox input.nick').val();
				if(!u.valid_loginname(loginname)) return;
				if(!u.valid_password(password)) return;
				if(!u.valid_hanname(nick)) return;
				var clerk_id=k.cache.name_cache.clerk[nick],clerk;
				if(clerk_id){
					clerk = k.cache.get(clerk_id);
					if(clerk.st==='f'){
						k.aspect.noty.message('昵称重复！');
						return;
					}
				}
				k.net.api('/sign/checkloginname',{loginname : loginname},function(err,r1){
					if(r1){
						if(r1 && r1.obj.used){
							k.aspect.noty.message('登录账号已被占用，请更改！');
							return;
						}
						var pwd_local = k.safe.local_pwd(password);
						var up = {ui:k.cache.sign.user._id,loginname:loginname,password:k.safe.up_pwd(pwd_local,password),role:role,nick:nick};
						if(clerk_id) up.bind_clerk = clerk_id;
						k.aspect.pay({url:'/manage/addstaff',param:up},function(r){
							k.aspect.noty.confirm_close();
							k.aspect.noty.message('新增成功！');
							var staff = r.obj.staff;
							k.cache.sign.user['staff'+staff.si] = staff;
							k.cache.sign.user.staff_len = staff.si;
							if(clerk_id) k.dao.updOne({_id:clerk_id,tn:'clerk',bind_si:staff.si,st:'f'});//更新clerk
							else k.dao.addOne(r.obj.clerk,null,2);//新增clerk
							window.kaidanbao.plugin.usercenter.stafflist.load();
							$.facebox.close();
							k.dao.put('sys',{id:'user',value:k.cache.sign.user});
						});
					}
				},true);
			},
			addstaff:function(){
				$.facebox(
						'<br /><div class="fb-input-wrapper"> \
						<label>登录账号：</label> \
						<input class="loginname" /></div> \
						<div class="fb-input-wrapper"> \
						<label>登录密码：</label> \
						<input class="password" type="password" /></div> \
						<div class="fb-input-wrapper"> \
						<label>用户角色：</label> \
						<select class="role" ></select></div> \
						<div class="fb-input-wrapper"> \
						<label>用户昵称：</label> \
						<input class="nick" /></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.stafflist.addpay();">确定</button> \
						</div>');
				$('#facebox div.title').html('新增用户');
				var role = k.cache.setup('role');
				for(var i=1;i<role.value;i++){
					$('#facebox select.role').append('<option value="r'+i+'">'+role['r'+i].name+'</option>');
				}
			},
		},
		init:function(){
			if(!_sid) _sid=k.cache.sign.staff_id;
			var box = '#layout div.usercenter';
			$('#layout div.lay-main').append(' \
					<div hidden class="usercenter"> \
					<div class="pan-box user-box inc-info"> \
						<div class="title">公司信息</div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box staff-info"> \
						<div class="title">当前用户 - <span onclick="kaidanbao.plugin.usercenter.staff.renewal();">续期</span></div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box staff-list"> \
						<div class="title">用户列表 - <span onclick="kaidanbao.plugin.usercenter.stafflist.addstaff();">新增</span></div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box role-box"> \
						<div class="title">角色列表 - <span onclick="kaidanbao.plugin.usercenter.role.upset();">新增</span></div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box setting-box"> \
						<div class="title">默认设置</div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box log-box"> \
						<div class="title">登录日志</div> \
						<div class="content"></div> \
					</div> \
			</div>');
			//公司
			p.usercenter.inc.load();
			//用户
			p.usercenter.staff.load();
			//用户列表
			p.usercenter.stafflist.load();
			//角色
			p.usercenter.role.load();
			//设置
			p.usercenter.setting.load();
			//日志
			p.usercenter.log.load();
			if(!k.cache.sign.user.safe_mobile && _sid===1){
				k.aspect.noty.confirm('<br /><h1>安全提醒</h1><br />为了您的账号安全，请绑定手机号码',function(){
					kaidanbao.plugin.usercenter.inc.change('mobile');
					k.aspect.noty.confirm_close();
				},true);
			}
		},
	}
	
})(window.kaidanbao);
