/**
 * http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var change_fixed_action=function(val){
		if(val.tn === 'setup'){
			if(val.type=='classify'){
				for(var key in val){
					if(k.conf.table[key]){
						if(key==='moneyflow'){
							k.aspect.manage.selectClassifyRefresh($('div.lay-main>div.moneyflow select.s1'),'moneyflow','a');
						}else{
							k.aspect.manage.selectClassifyRefresh($('div.lay-main>div.'+key+' select.s1'),key,'aan');
							k.aspect.manage.selectClassifyRefresh($('div.lay-main>div.'+key+' select.s2'),key,'ban');
						}
					}
				}
			}
		}else if(val.tn === 'product') k.aspect.atcp.product_auto(val._id);
		else if(val.tn === 'repository') k.aspect.manage.selectRepositoryRefresh($('#layout div.store select.s2'));
		else k.aspect.atcp.auto(val._id,val.tn);
		var box = '#layout div.'+k.frame.current_plugin;
		if(!$(box+' div.kc-manage-box input.s-input').val()) $(box+' div.kc-manage-box button.s-btn').click();
	}
	/** 客户表增删改查组件 */
	k.aspect.manage={
		change_fixed_action:change_fixed_action,
		classic:function(target,table){
			target.append('<option value="all"><所有分类></option> \
					  <optgroup label="类型"> \
					    <option value="an"><无类型></option> \
					  </optgroup> \
					  <optgroup label="类别"> \
					    <option value="bn"><无类别></option> \
					  </optgroup>');
			var clazz = k.cache.setup('classify')[table]||{};
			for(var key in clazz){
				if(key[0]=='a' && clazz[key].v) target.find('optgroup').eq(0).append('<option value="'+key+'">'+clazz[key].v+'</option>');
				if(key[0]=='b' && clazz[key].v) target.find('optgroup').eq(1).append('<option value="'+key+'">'+clazz[key].v+'</option>');
			}
		},
		sort:function(that,tn){
			if($(that).hasClass('asc')){
				$(that).removeClass('asc');
				$(that).addClass('desc');
			}else{
				$(that).parent().children('.sort').removeClass('asc').removeClass('desc');
				$(that).addClass('asc');
			}
			$('div.'+tn+' .kc-manage-box button.s-btn').click();
		},
		th_fill:function(target,tn){
			var sort_value;
			for(var col in k.conf.table[tn]['cols']){
				if(k.conf.table[tn]['sort'] && k.conf.table[tn]['sort'][col]){
					sort_value = k.conf.table[tn]['sort'][col];
					target.before('<th data-sort="'+col+'" onclick="kaidanbao.aspect.manage.sort(this,\''
							+tn+'\')" class="norm sort '+(sort_value||'')+'">'+k.conf.table[tn]['cols'][col]+'</th>');
				}else{
					target.before('<th class="norm">'+k.conf.table[tn]['cols'][col]+'</th>');
				}
			}
		},
		search_enter:function(e){
			if(e.keyCode == "13" || !$(e.target).val()) {//keyCode=13是回车键
	            $(e.target.nextSibling.nextSibling.nextSibling).click();
	        }
		},
		get_number:function(){
			return k.cache.sign.staff_id+'-'+u.date.getTimeFormat(0,'dt').replace(/-/g,'').replace(/:/g,'').replace(/ /g,'-');
		},
		selectAccountRefresh:function(target,mod){
			if(target.length == 0) return;
			target.html('');
			var vid;
			if(mod==='a'){ target.append('<option value="a"><所有账户></option>'); }
			for(var name in k.cache.name_cache['account']){
				vid = k.cache.name_cache['account'][name];
				if(k.cache.get(vid).st !== 'd') target.append('<option value="'+vid+'">'+name+'</option>');
			}
		},
		selectRepositoryRefresh:function(target){
			if(target.length == 0) return;
			target.html('');
			var vid;
			for(var name in k.cache.name_cache['repository']){
				vid = k.cache.name_cache['repository'][name];
				if(k.cache.get(vid).st !== 'd') target.append('<option value="'+vid+'">'+name+'</option>');
			}
		},
		selectClassifyRefresh:function(target,tn,mod){
			if(target.length == 0) return;
			target.html('');
			var clazz = k.cache.setup('classify')[tn]||{},map={a:'类型',b:'类别'};
			if(tn==='moneyflow'){
				map={a:'收入',b:'支出'};
				if(mod==='a') target.append('<option value="a"><所有分类></option>');
				target.append('<optgroup label="收入"></optgroup><optgroup label="支出"></optgroup>');
				for(var key in clazz){
					if(mod!=='n'||(key!=='a0'&&key!=='b0')){
						if(key[0]=='a' && clazz[key].v) target.find('optgroup').eq(0).append('<option value="'+key+'">'+clazz[key].v+'</option>');
						if(key[0]=='b' && clazz[key].v) target.find('optgroup').eq(1).append('<option value="'+key+'">'+clazz[key].v+'</option>');
					}
				}
			}else{
				if(mod[1]==='a') target.append('<option value="a"><所有'+map[mod[0]]+'></option>');
				if(mod[2]==='n') target.append('<option value="n"><无'+map[mod[0]]+'></option>');
				for(var key in clazz){
					if(key[0]==mod[0] && clazz[key].v) target.append('<option value="'+key+'">'+clazz[key].v+'</option>');
				}
			}
		},
		search:function(c){
			var query = $(c.box+' .kc-manage-box input').val().trim(),qs,qs_len,matchs=0;
			if(query) {qs=query.toLowerCase().split(' ');qs_len=qs.length;}
			var s1 = $(c.box+' .kc-manage-box select.s1').val(),i=1,clazz;
			var s2 = $(c.box+' .kc-manage-box select.s2').val();
			$(c.box+' table.kc-manage-list tr.list').remove();
			
			var v1=k.cache.fixed_page[c.table],v;
			k.cache.fixed_page[c.table+'_len'] = v1.length;
			var asc  = $(c.box +' th.sort.asc').attr('data-sort');
			var desc = $(c.box +' th.sort.desc').attr('data-sort');
			if(asc){
				v1.sort(function(a,b,va,vb){
					va = k.cache.get(a)[asc];vb=k.cache.get(b)[asc];
					if(va && vb) return va < vb?1:-1;
					else if(vb) return 1;
					else return -1;
				});
			}else if(desc){
				v1.sort(function(a,b,va,vb){
					va = k.cache.get(a)[desc];vb=k.cache.get(b)[desc];
					if(va && vb) return va > vb?1:-1;
					else if(va) return 1;
					else return -1;
				});
			}
			var classify=k.cache.setup('classify')[c.table] || {},names,na,nu;
			for(var j in v1){ 
				v = k.cache.get(v1[j]);
				if(v.st === 'd'){k.cache.fixed_page[c.table+'_len']-=1;continue;}  //已删除的记录不再显示
				v.staff_clerk = v.staff_clerk||k.cache.sign.user['staff'+v.si].bind_clerk;
				if(c.table === 'customer'||c.table === 'supplier'){
					if(!k.aspect.role_check('findall-'+c.table)&&(v.staff_clerk != k.cache.sign.staff.bind_clerk)){
						continue ;
					}
				}
				if(i > k.conf.kdb.max_show_lines*2) break;
				if(s1!=='a'){
					if(s1==='n'){
						if(v.mold && classify[v.mold] && classify[v.mold].v) continue;
					}else{
						if(v.mold && classify[v.mold] && classify[v.mold].v){
							if(v.mold !== s1) continue;
						}else continue;
					}
				}
				if(s2!=='a'){
					if(s2==='n'){
						if(v.classify && classify[v.classify] && classify[v.classify].v) continue;
					}else{
						if(v.classify && classify[v.classify] && classify[v.classify].v){
							if(v.classify !== s2) continue;
						}else continue;
					}
				}
				nu = v.number || '';
				na = v.name   || '';
				names = nu+' '+na;
				if(qs){
					matchs=0;
					for(var iq in qs){
						if(!qs[iq]) continue;
						if(names.toLowerCase().indexOf(qs[iq])>=0){
							nu = nu.replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
							na = na.replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
							matchs++;
						}
					}
					if(matchs < qs_len) continue;
				}
				
				var tds  = '';
				for(var col in k.conf.table[c.table]['cols']){
					if(col === 'name') tds += ('<td style="text-align:left;"><span title="查看" onclick="kaidanbao.aspect.manage.modify('+v._id+')">'+na+'</span></td>');
					else if(col === 'number') tds += ('<td>'+nu+'</td>');
					else if(col === 'mold') tds += ('<td>'+((v.mold && classify[v.mold] && classify[v.mold].v)?classify[v.mold].v:'<无类型>')+'</td>');
					else if(col === 'classify') tds += ('<td>'+((v.classify && classify[v.classify] && classify[v.classify].v)?classify[v.classify].v:'<无类别>')+'</td>');
					else if(col === 'ct') tds += ('<td>'+u.date.getTimeFormat(v.ct,'d')+'</td>');
					else if(col === 'lm') tds += ('<td>'+u.date.getTimeFormat(v.lm,'d')+'</td>');
					else if(col === 'staff_clerk') tds += ('<td>'+k.cache.get(v.staff_clerk).name+'</td>');
					else tds += ('<td>'+(v[col] ||'')+'</td>');
				}
				$(c.box+' table.kc-manage-list').append('<tr class="list '+(i%2===0?'opp':'')+'"><td class="num">'+(i++)+'</td>'+tds+'<td class="remark">'+
						(v.remark ||'')+'</td></tr>');
			}
			if(c.notice) c.notice();
		},
		insert:function(table){
			if(!k.aspect.role_check('add-'+table)){
				k.aspect.noty.message(k.conf.kdb.role_err_msg);
				return;
			}
			var value={tn:table,staff_clerk:k.cache.sign.staff.bind_clerk},key,val;
			for(key in k.conf.table[table]['cols']){
				if(k.conf.table[table]['cols'][key]) {
					if(key == 'classify' || key === 'mold'){
						val = $('#facebox select.'+key).val();
						if(val !== 'n') value[key] = val;
					}else if(key!='ct' && key!='lm' && key!=='staff_clerk'){
						val = $('#facebox input.'+key).val().trim();
						if(val) value[key] = val;
					}
				} 
			}
			if(value['name']){
				if(k.cache.name_cache[table][value['name']]){
					k.aspect.noty.message(k.conf.table[table]['cn']+'名称已存在!');
					return;
				}
			}else{
				k.aspect.noty.message(k.conf.table[table]['cn']+'名称不能为空!');
				return;
			}
			if(k.conf.table[table].py) value['name_py']=$('#facebox input.pinyin').val().trim();
			var remark = $('#facebox textarea.remark').val();
			if(remark) value['remark'] = remark;
			k.dao.addOne(value,function(err,val){
				if(err){}
				else{
					$.facebox.close();
					k.aspect.noty.message(k.conf.table[table]['cn']+'信息新增成功!');
					change_fixed_action(val);
				}
			});
		},
		modify:function(id){
			var pn = k.frame.current_plugin,key;
			if(!k.aspect.role_check('upd-'+pn)){
				k.aspect.noty.message(k.conf.kdb.role_err_msg);
				return;
			}
			var box = '#layout div.'+pn,value=k.cache.get(id);
			var html='',key,name;
			for(key in k.conf.table[pn]['cols']){
				if(name = k.conf.table[pn]['cols'][key]) {
					if(key==='mold' || key==='classify' || key==='ct' || key==='lm') continue;
					if(k.conf.table[pn].py && key=='name'){//拼音
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
						<input style="width:150px;" class="name" value="'+value.name+'" /><input value="'+(value.name_py || '')+'" class="pinyin" style="width:85px;margin-left:3px;" placeholder="简拼" /></div>';
					}else if(key === 'staff_clerk'){
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
							<select class="'+key+'"></select></div>';
					}else{
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
						<input class="'+key+'" value="'+(value[key] ||'')+'" /></div>';
					}
				} 
			}
			$.facebox(html+' \
					<div class="fb-input-wrapper"> \
					<label>分类：</label><select style="width:152px;" class="mold"></select><select style="width:152px;margin-left:3px;" class="classify"></select></div> \
					<div class="fb-input-wrapper"> \
					<label>备注：</label> \
					<textarea class="remark" maxlength="200">'+(value.remark ||'')+'</textarea></div> \
					<div class="fb-input-wrapper"> \
					<label>&nbsp;</label> \
					<button onclick="kaidanbao.aspect.manage.update('+value._id+')">修改</button><button class="delet" style="margin-left:3px;color:#f08;" onclick="kaidanbao.aspect.manage.del('+value._id+',\''+value.name+'\')">删除</button> \
			</div>');
			value.staff_clerk = value.staff_clerk||k.cache.sign.user['staff'+value.si].bind_clerk;
			for(var i=1;i<=k.cache.sign.user.staff_len;i++){
				$('#facebox select.staff_clerk').append('<option value="'+k.cache.sign.user['staff'+i].bind_clerk+'">'+k.cache.get(k.cache.sign.user['staff'+i].bind_clerk).name+'</option>');
			}
			$('#facebox select.staff_clerk').val(value.staff_clerk);
			if(k.cache.sign.staff_id !== 1) $('#facebox select.staff_clerk').attr('disabled','disabled');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.mold'),pn,'a0n');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.classify'),pn,'b0n');
			var classify=k.cache.setup('classify')[pn] || {};
			if(value.mold && classify[value.mold] && classify[value.mold].v) $('#facebox select.mold').val(value.mold);
			else $('#facebox select.mold').val('n');
			if(value.classify && classify[value.classify] && classify[value.classify].v) $('#facebox select.classify').val(value.classify);
			else $('#facebox select.classify').val('n');
			if(value.st === 'f') $('#facebox button.delet').remove();//固定数据不可删除
			$('#facebox div.title').html(k.conf.table[pn]['cn']+'信息 > 修改');
			if(k.conf.table[pn].py){
				$('#facebox input.name').change(function(){
					$('#facebox input.pinyin').val(u.pinyin.getSZM($(this).val()));
				});
			}
		},
		del:function(id,name){
			var table = k.frame.current_plugin;
			if(!k.aspect.role_check('del-'+table)){
				k.aspect.noty.message(k.conf.kdb.role_err_msg);
				return;
			}
			k.aspect.noty.confirm('<h1 style="color:#078;">删除警告</h1><br />本操作不可恢复，请谨慎删除！',function(){
				k.dao.del(table,id,function(err,val){
					if(err){}
					else {
						$.facebox.close();
						k.aspect.noty.confirm_close();
						k.aspect.noty.message(k.conf.table[table]['cn']+'信息删除成功!');
						change_fixed_action(val);
					}
				},name+'(删)');
			});
		},
		update:function(id){
			var table=k.frame.current_plugin,val;
			if(!k.aspect.role_check('upd-'+table)){
				k.aspect.noty.message(k.conf.kdb.role_err_msg);
				return;
			}
			var old=k.cache.get(id);
			var value={_id:id,tn:table},key,old_name=old.name;
			for(key in k.conf.table[table]['cols']){
				if(k.conf.table[table]['cols'][key]) {
					if(key == 'mold' || key == 'classify' || key == 'staff_clerk'){
						val = $('#facebox select.'+key).val();
						if(val === 'n'){
							if(old[key]) value[key] = '';
						}else{
							if(val != old[key]) value[key] = val;
						}
					}else if(key!='ct' && key!='lm'){
						val = $('#facebox input.'+key).val().trim();
						if(old[key]){
							if(old[key] !== val) value[key] = val;
						}else if(val) value[key] = val;
					}
				} 
			}
			if(value.staff_clerk) value.staff_clerk=parseInt(value.staff_clerk);
			if(value['name']){
				if(k.cache.name_cache[table][value['name']] && k.cache.name_cache[table][value['name']] !== id){
					k.aspect.noty.message(k.conf.table[table]['cn']+'名称已存在!');
					return;
				}
			}else if(value['name']===''){
				k.aspect.noty.message(k.conf.table[table]['cn']+'名称不能为空!');
				return;
			}
			if(k.conf.table[table].py) value['name_py']=$('#facebox input.pinyin').val().trim();
			var remark = $('#facebox textarea.remark').val();
			if(old['remark']){
				if(old['remark'] !== remark) value['remark'] = remark;
			}else if(remark) value['remark'] = remark;
			k.dao.updOne(value,function(err,val){
				if(err){}
				else {
					$.facebox.close();
					k.aspect.noty.message(k.conf.table[table]['cn']+'信息修改成功!');
					if(value['name']) k.cache.name_cache[table][old_name] = 0;
					change_fixed_action(val);
				}
			});
		},
		create:function(table){
			if(!k.aspect.role_check('add-'+table)){
				k.aspect.noty.message(k.conf.kdb.role_err_msg);
				return;
			}
			var html='',key,name;
			for(key in k.conf.table[table]['cols']){
				if(name = k.conf.table[table]['cols'][key]) {
					if(key==='mold' || key==='classify' || key==='ct' || key==='lm') continue;
					if(k.conf.table[table].py && key=='name'){//拼音
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
						<input style="width:150px;" class="name" /><input class="pinyin" style="width:85px;margin-left:3px;" placeholder="简拼" /></div>';
					}else if(key !== 'staff_clerk'){
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
							<input class="'+key+'" /></div>';
					}
				}
			}
			$.facebox(html+' \
					<div class="fb-input-wrapper"> \
					<label>分类：</label><select style="width:154px;" class="mold"></select><select style="width:154px;margin-left:3px;" class="classify"></select></div> \
					<div class="fb-input-wrapper"> \
					<label>备注：</label> \
					<textarea class="remark" maxlength="200"></textarea></div> \
					<div class="fb-input-wrapper"> \
					<label>&nbsp;</label> \
					<button onclick="kaidanbao.aspect.manage.insert(\''+table+'\')">提交</button> \
			</div>');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.mold'),table,'a0n');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.classify'),table,'b0n');
			$('#facebox div.title').html(k.conf.table[table]['cn']+'信息 > 新增');
			if(k.conf.table[table].py){
				$('#facebox input.name').change(function(){
					$('#facebox input.pinyin').val(u.pinyin.getSZM($(this).val()));
				});
			}
		},
		init:function(conf){
			//初始内容
			var pn = k.frame.current_plugin,key;
			var box = '#layout div.'+pn;
			$('#layout div.lay-main').append(' \
				<div hidden class="'+pn+'"> \
		          <div class="kc-manage-box"> \
					<input class="s-input" onkeyup="kaidanbao.aspect.manage.search_enter(event);" /><select class="s1"></select><select class="s2"></select><button class="s-btn">搜索</button> \
					<div><section class="func-a"> \
						<span class="create">新增</span> \
						<span class="classify">分类</span> \
				</section><section class="summary-box"></section></div> \
				  </div> \
				  <table class="kc-manage-list"> \
				     <tr><th title="下载表格" class="num"><svg class="down" version="1.1" viewBox="0 -70 1034 1034"><path d="M512 384l256 256h-192v256h-128v-256h-192zM744.726 488.728l-71.74-71.742 260.080-96.986-421.066-157.018-421.066 157.018 260.080 96.986-71.742 71.742-279.272-104.728v-256l512-192 512 192v256z"></path></svg></th> \
				         <th class="remark">备注</th></tr> \
				  </table><br /> \
				</div>');
			//extra
			if(conf.extra) conf.extra();
			//1，确定表名，字段
			if(!conf.table) conf.table=pn;
			//根据字段，填充th
			k.aspect.manage.th_fill($(box+' table.kc-manage-list th.remark'),conf.table);
			//选择框
			if(conf.select){
				conf.select();
			}else{
				k.aspect.manage.selectClassifyRefresh($(box+' select.s1'),conf.table,'aan');
				k.aspect.manage.selectClassifyRefresh($(box+' select.s2'),conf.table,'ban');
			}
			//新增按钮
			if(conf.create === 'noop'){
				$(box+' div.kc-manage-box section.func-a span.create').remove();
			}else{
				if(conf.create){
					$(box+' div.kc-manage-box section.func-a span.create').click(conf.create);
				}else{
					$(box+' div.kc-manage-box section.func-a span.create').click(function(){
						kaidanbao.aspect.manage.create(conf.table);
					});
				}
			}
			//classify管理
			if(conf.classify === 'noop'){
				$(box+' div.kc-manage-box section.func-a span.classify').remove();
			}else{
				if(conf.classify){
					conf.classify();
				}else{
					$(box+' div.kc-manage-box section.func-a span.classify').click(function(){
						if(!k.aspect.role_check('upd-'+conf.table)){
							k.aspect.noty.message(k.conf.kdb.role_err_msg);
							return;
						}
						var key,clazzs=k.cache.setup('classify'),clazz = clazzs[conf.table]||{};
						$.facebox('<div class="classify"> \
							<fieldset> \
				              <legend>'+(pn==='moneyflow'?'收入</legend><input disabled="disabled" />':'类型</legend><input />')+' \
							  <input /><input /><input /> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							</fieldset> \
							<fieldset style="margin-left:10px;"> \
				              <legend>'+(pn==='moneyflow'?'支出</legend><input disabled="disabled" />':'类别</legend><input />')+'</legend> \
							  <input /><input /><input /> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							</fieldset></div>');
						$('#facebox div.title').html(k.conf.table[conf.table]['cn']+'分类管理');
						$('#facebox div.footer').html('<button class="ensure">保存分类</button>');
						var fset={'a':0,'b':1,'c':2};
						for(key in clazz){
							if(fset[key[0]]<2) $('#facebox div.classify fieldset:eq('+fset[key[0]]+') input').eq(key.substring(1)).val(clazz[key].v).attr('placeholder',clazz[key].old||'');
						}
						$('#facebox div.footer .ensure').click(function(){
							var c1 = $('#facebox div.classify fieldset:eq(0) input');
							var c2 = $('#facebox div.classify fieldset:eq(1) input');
							var v1,v2;
							for(var i =0;i<12;i++){
								v1 = c1.eq(i).val().trim();
								v2 = c2.eq(i).val().trim();
								if(!clazz['a'+i]) clazz['a'+i]={};
								clazz['a'+i].v=v1;
								if(v1) clazz['a'+i].old=v1;
								
								if(!clazz['b'+i]) clazz['b'+i]={};
								clazz['b'+i].v=v2;
								if(v2) clazz['b'+i].old=v2;
							}
							var upd_clazz = {tn:'setup',type:'classify',_id:clazzs._id};
							upd_clazz[conf.table] = clazz;
							k.dao.updOne(upd_clazz,function(err,r){
								if(err) return;
								$.facebox.close();
								$('#layout div.'+conf.table+' div.kc-manage-box button').click();
								if(pn==='moneyflow'){
									k.aspect.manage.selectClassifyRefresh($(box+' select.s1'),'moneyflow','a');
								}else{
									k.aspect.manage.selectClassifyRefresh($(box+' select.s1'),conf.table,'aan');
									k.aspect.manage.selectClassifyRefresh($(box+' select.s2'),conf.table,'ban');
								}
							});
						});
					});
				}
			}
			var s_btn   = $(box+' div.kc-manage-box button.s-btn');
			var s1      = $(box+' div.kc-manage-box select.s1');
			var s2      = $(box+' div.kc-manage-box select.s2');
			var s_input = $(box+' .kc-manage-box input.s-input');
			//搜索
			$(box+' div.kc-manage-box button.s-btn').click(function(e){
				if(conf.search){
					conf.search();
				}else{
					k.aspect.manage.search({
		box:box,table:conf.table,notice:conf.notice,modify_name:conf.modify_name
					});
				}
			});
			s1.change(function(e){
				s_btn.click();
			});
			s2.change(function(e){
				s_btn.click();
			});
			s_btn.click();
			$(box+' svg.down').click(function(){
				if(k.aspect.role_check('down-table')){
					u.file.tableToExcel('<table>'+$(box+' table.kc-manage-list').html()+'</table>',
							$('div.lay-left:not([hidden]) li.selected a').html()+'-'+$(box+' div.kc-manage-box select.s1 option:selected').html().replace('&lt;','[').replace('&gt;',']')+'-'+$(box+' div.kc-manage-box select.s2 option:selected').html().replace('&lt;','[').replace('&gt;',']')+(s_input.val()?('-'+s_input.val()):''));
				}else{
					k.aspect.noty.message(k.conf.kdb.role_err_msg);
				}
			});
		},
	}
})(window.kaidanbao);
