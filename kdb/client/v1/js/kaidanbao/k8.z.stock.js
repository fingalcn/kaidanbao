/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	p.store={
		release:function(){ $('#layout div.store table.kc-manage-list tr.list').remove(); },
		reload:function(){  $('#layout div.store button.s-btn').click(); },
		init:function(){
			if(!k.aspect.role_check('find-store')){
				$('#layout div.lay-main').append('<div hidden class="store"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
				return;
			}
			var total=0,box = '#layout div.store';
			k.aspect.manage.init({search:function(c){
				$(box+' table.kc-manage-list tr.list').remove();
				var s1 = $(box+' select.s1').val();
				var rid = $(box+' select.s2').val(),repository=k.cache.get(rid);
				var sd0='t'+k.cache.dates.mt[0],store;
				var query = $(box+' input').val().trim(),qs,qs_len,matchs=0;
				if(query) {qs=query.toLowerCase().split(' ');qs_len=qs.length;}
				var amount=0,v,i,id,n=0,na,nu;
				
				//排序
				k.cache.fixed_page.product.sort(function(a,b,va,vb){
					va = k.cache.get(a);vb = k.cache.get(b);
					if(va.lm === vb.lm) va.lm += 1;
					return va.lm < vb.lm?1:-1;
				});
				for(i in k.cache.fixed_page['product']){
					id = k.cache.fixed_page['product'][i];
					store = repository[sd0][id];
					
					if(store && store[0]){
						v = k.cache.get(id);
						
						if(v.st === 'd') v.stock_remark='已删除';
						var clazz = k.cache.setup('classify').product||{};
						if(s1!=='all'){
							if(s1[0] === 'a'){
								if(s1[1] === 'n'){
									if(v.mold && clazz[v.mold] && clazz[v.mold].v) continue;
								}else{
									if(v.mold && clazz[v.mold] && clazz[v.mold].v) {
										if(v.mold !== s1) continue;
									}else continue;
								}
							}else if(s1[0] === 'b'){
								if(s1[1] === 'n'){
									if(v.classify && clazz[v.classify] && clazz[v.classify].v) continue;
								}else{
									if(v.classify && clazz[v.classify] && clazz[v.classify].v){
										if(v.classify !== s1) continue;
									}else continue;
								}
							}
						}
						nu = v.number || '';na = v.name   || '';names = nu+' '+na;
						if(qs){
							matchs=0;
							for(var iq in qs){
								if(names.toLowerCase().indexOf(qs[iq])>=0){
									na = na.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
									nu = nu.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
									matchs++;
								}
							}
							if(matchs < qs_len) continue;
						}
						if(n < k.conf.kdb.max_show_lines){//显示数量限制
							$(box+' table.kc-manage-list').append(
									'<tr class="list '+(++n%2===0?'opp':'')+'"><td>'+n
									+'</td><td>'+nu
									+'</td><td style="text-align:left;">'+na
//									+'</td><td>'+(v.spec || '')
									+'</td><td>'+(v.unit || '')
									+'</td><td class="cost">'+(store[1]/store[0]).toFixed(3)
									+'</td><td class="before_count">'+(parseInt(store[0])==store[0]?store[0]:store[0].toFixed(3))
									+'</td><td data-pid="'+v._id
									+'" class="check_count" contenteditable="true" style="background-color:#fff;text-align:left;color:#078;"></td><td class="remark">'+(v.stock_remark ||'')
									+'</td></tr>');
						}
						amount += store[1];
					}
				}
				$(box+' section.summary-box').html('价值：'+amount.toFixed(2)+' 元');
			},select:function(){
				$(box+' section.func-a').html('<span class="check" onclick="kaidanbao.plugin.store.check()">保存盘点</span>');
				$(box+' input').attr('placeholder','搜索商品名称');
				
				//已定义函数--start : k.aspect.manage.classic(target,table)
				$(box+' select.s1').append('<option value="all"><所有分类></option> \
						  <optgroup label="类型"> \
						    <option value="an"><无类型></option> \
						  </optgroup> \
						  <optgroup label="类别"> \
						    <option value="bn"><无类别></option> \
						  </optgroup>');
				var clazz = k.cache.setup('classify').product||{};
				for(var key in clazz){
					if(key[0]=='a' && clazz[key].v) $(box+' select.s1 optgroup').eq(0).append('<option value="'+key+'">'+clazz[key].v+'</option>');
					if(key[0]=='b' && clazz[key].v) $(box+' select.s1 optgroup').eq(1).append('<option value="'+key+'">'+clazz[key].v+'</option>');
				}
				//--end
				k.aspect.manage.selectRepositoryRefresh($(box+' select.s2'));
				var setting = k.cache.setup('setting'),def = setting['store-'+k.cache.sign.staff_id]||{};
				if(def.repository_id) $(box+' select.s2').val(def.repository_id);
				else if(setting.value&&setting.value.repository_id) $(box+' select.s2').val(setting.value.repository_id);
			},create:'noop',classify:'noop'});
		},
		check:function(){
			if(!k.aspect.role_check('add-checkbill')){
				return;
			}
			var box = '#layout div.store';
			var bill={detail:[],amount:0};
			var prod,pid,spec='',bc,ac,cp,cost,count,amount,tc=0;
//			[[product_id,spec,before_count,after_count,checkprice,count,amount,remark],...],
			var rid = $(box+' select.s2').val();
			var store = k.cache.get(rid)['t'+k.cache.dates.mt[0]]||{};
			var setting = k.cache.setup('setting'),def = setting['store-'+k.cache.sign.staff_id]||{};
			var html='单号：<input class="number" disabled="disabled" />，盘点员：<input class="clerk checker" /><br /><br /><table class="check"><tr><th>商品</th><th>单位</th><th>系统库存</th><th>盘点后库存</th><th>成本价</th><th>备注</th></tr>';
			$(box+' td.check_count').each(function(i){
				ac = parseFloat($(this).html().trim());
				if(ac||ac===0){
					tc ++;
					pid = $(this).attr('data-pid');
					prod = k.cache.get(pid);
					bc = parseFloat($(box+' td.before_count').eq(i).html());
					cp = parseFloat($(box+' td.cost').eq(i).html());
					
					html += ('<tr><td>'+(prod.number||'')+' '+(prod.name)
							+'</td><td>'+(prod.unit||'')
							+'</td><td class="bc">'+bc
							+'</td><td class="ac">'+ac
							+'</td><td data-pid="'+pid+'" class="check_price" contenteditable="true" style="background-color:#fff;text-align:left;color:#078;">'+cp
							+'</td><td class="check_remark" contenteditable="true" style="background-color:#fff;text-align:left;width:180px;"></td></tr>');
				}
			});
			if(tc > 0){
				$.facebox(html+'</table>');
				$('#facebox div.title').html('盘点单确认');
				$('#facebox div.footer').html('<button class="checkbill">确定</button>');
				$('#facebox input.number').val('PD-'+k.aspect.manage.get_number());
				$('#facebox input.checker').val(k.cache.get(def.checker_id||k.cache.sign.staff.bind_clerk).name);
				k.aspect.atcp.bind($('#facebox input.clerk'),'clerk',{
					onSelect:function(s){
						$(this).val(k.cache.get(s.data.id).name);
					},
				});
				$('#facebox button.checkbill').click(function(){
					var checker_id = k.cache.name_cache.clerk[$('#facebox input.checker').val().trim()];
					if(!checker_id) {
						k.aspect.noty.message('盘点员不对！');
						return ;
					}
					bill.amount=0;
					$('#facebox table.check td.check_price').each(function(i){
						cost = parseFloat($(this).html().trim());
						if(cost){
							pid = parseInt($(this).attr('data-pid'));
							bc = parseFloat($('#facebox td.bc').eq(i).html());
							ac = parseFloat($('#facebox td.ac').eq(i).html());
							amount = (ac*cost)-store[pid][1];
							
							bill.detail[i]=[pid,'',bc,ac,cost,ac-bc,amount,$('#facebox table.check td.check_remark').eq(i).html()];
							bill.amount += amount;
						}else {
							 k.aspect.noty.message('成本金额不对！');
							 $(this).focus();
							 tc = 0;
						}
					});
					if(tc > 0){
						bill.tn = 'checkbill';
						bill.repository_id = parseInt(rid);
						bill.order_id = k.cache.sign.staff.bind_clerk;
						bill.checker_id = checker_id;
						bill.number = $('#facebox input.number').val();
						k.aspect.noty.confirm('<br /><h1>确定盘点完成？</h1><br />(本次盘点：'+(bill.amount>0?('<b style="color:green">盈余'+bill.amount.toFixed(2)):('<b style="color:#f08">耗损'+(-bill.amount).toFixed(2)))+' 元</b>)',function(){
							k.dao.addOne(bill,function(){
								k.aspect.noty.message('操作成功！');
								
								k.aspect.bill_center.handle(bill,function(){});
								$.facebox.close();
								k.aspect.noty.confirm_close();
								$(box+' div.kc-manage-box button.s-btn').click();
							});
						});
					}
				});
			}else {
				$(box+' td.check_count').eq(0).focus();
				k.aspect.noty.message('未盘点任何商品！');
			}
			
		}
	}
	p.checkbill={
		release:function(){ $('#layout div.checkbill table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.checkbill button.s-btn').click(); },
		init:function(){
//			[[product_id,spec,before_count,after_count,checkprice,count,amount,remark],...],
			if(k.aspect.role_check('find-checkbill')){
				var box = '#layout div.checkbill',rowspan,j;
				k.aspect.bill.init(function(v,n,len,nu,cs,prods){
					rowspan='<td class="num" rowspan="'+len+'">'+n+'</td><td rowspan="'+len+'"><span title="删除" onclick="kaidanbao.aspect.bill.del('+v._id+',\'checkbill\')">'+nu+'</span></td><td rowspan="'+len+'">'+cs+'</td><td rowspan="'+len+'">'+(v.amount?v.amount.toFixed(2):'');
					for(j in v.detail){
						$(box+' table.kc-manage-list').append(
								'<tr class="list '+(n%2===0?'opp':'')+'">'+rowspan
								+'</td><td style="text-align:left;">'+prods[j]
								+'</td><td>'+(k.cache.get(v.detail[j][0]).unit ||'')
								+'</td><td>'+v.detail[j][2]
								+'</td><td>'+v.detail[j][3]
								+'</td><td>'+v.detail[j][4]
								+'</td><td class="remark">'+(v.detail[j][7]||'')
								+'</td></tr>');
						rowspan='';
					}
				});
			}else{
				$('#layout div.lay-main').append('<div hidden class="checkbill"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		}
	}
	p.allotbilling={
		reload:function(){k.aspect.atcp.set_repository(k.cache.get(parseInt($('#layout div.allotbilling select.repository').val()))['t'+k.cache.dates.mt[0]]);},
		init:function(){
			if(!k.aspect.role_check('add-allotbill')){
				$('#layout div.lay-main').append('<div hidden class="allotbilling"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
				return;
			}
			var box = '#layout div.allotbilling';
			$('#layout div.lay-main').append(' \
				<div hidden class="allotbilling"> \
					<div class="bill-top"> \
						<div style="width:21%;">调拨员：<input class="clerk alloter" /></div> \
						<div style="width:25%;">发货仓库：<select class="repository callout_id" /></div> \
						<div style="width:25%;">收货仓库：<select class="repository callin_id" /></div> \
						<div style="width:29%;">单号：<input class="number" readonly="readonly" style="width:75%;" /></div> \
					</div> \
					<table class="bill-table" style="height:80%;"><tr> \
						<th style="width:3%;"></th> \
						<th style="width:29%;">商品名称</th> \
						<th style="width:8%;">商品编号</th> \
						<th style="width:8%;">规格</th> \
						<th style="width:7%;">单位</th> \
						<th style="width:12%;">数量</th> \
						<th>备注</th></tr> \
					</table> \
          			<div class="bill-sub"> \
						<button class="submit">提交</button> \
						<button class="default-set">默认设置</button> \
						<button class="refresh">刷新</button> \
					</div> \
				</div>');
			$(box+' select.callout_id').change(function(){
				k.aspect.atcp.set_repository(k.cache.get(parseInt($(this).val()))['t'+k.cache.dates.mt[0]]);
			});
			k.aspect.atcp.bind($(box+' input.clerk'),'clerk',{
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name).blur();
				},
			});
			var tds='',setting = k.cache.setup('setting');
			for(var i=0;i<19;i++){
				tds += '<tr><td class="num">'+(i+1)+'</td><td class="p_name"><input class="product" hidden data-index="'+i+'" /></td><td class="number"></td><td class="p_spec"></td><td class="p_unit"></td><td class="count"></td><td class="remark"></td></tr>';
			}
			$(box+' table.bill-table').append(tds);
			$(box+' table.bill-table th').css('height','5%');
			$(box+' table.bill-table td').css('height','5%');
			k.aspect.atcp.bind($(box+' td.p_name input'),'product',{
				has_store_check:true,
				skip_fixed:true,
				width:'41.3%',
				onSelect:function(s){
					var index=parseInt($(this).attr('data-index'));
					var prod = k.cache.get(s.data.id);
					$(box+' td.p_name input').eq(index).val((prod.number?(prod.number+' '):'')+prod.name).attr('data-id',s.data.id);
					$(box+' td.p_name input').eq(index+1).removeAttr('hidden');
					$(box+' td.number').eq(index).html( prod.number||'');
					$(box+' td.p_spec').eq(index).html(prod.spec||'');
					$(box+' td.p_unit').eq(index).html(prod.unit||'');
					$(box+' td.count').eq(index).focus();
				},
				onSearchComplete:function(q,s){
					var index=parseInt($(this).attr('data-index'));
					$(box+' td.p_name input').eq(index).removeAttr('data-id');
					$(box+' td.number').eq(index).html('');
					$(box+' td.p_spec').eq(index).html('');
					$(box+' td.p_unit').eq(index).html('');
					$(box+' td.count').eq(index).html('');
				},
			});
			$(box+' table.bill-table td.p_spec').attr('contenteditable','true');
			$(box+' table.bill-table td.count').attr('contenteditable','true');
			$(box+' table.bill-table td.remark').attr('contenteditable','true');
			
			$(box+' button.submit').click(function(){
				var bill = {tn:'allotbill',detail:[],amount:0,number:$(box+' input.number').val()};
				bill.alloter_id = k.cache.name_cache.clerk[$(box+' input.alloter').val()];
				bill.order_id = k.cache.sign.staff.bind_clerk;
				bill.callout_id = parseInt($('#layout div.allotbilling select.callout_id').val());
				bill.callin_id  = parseInt($('#layout div.allotbilling select.callin_id').val());
				if(!bill.alloter_id){
					k.aspect.noty.message('调拨员不存在！');
					return ;
				}
				if(!bill.callout_id || !bill.callin_id || bill.callout_id===bill.callin_id){
					k.aspect.noty.message('收货仓库不能与发货仓库相同！');
					return ;
				}
				var detail,pid,count;
				var repos = k.cache.get(bill.callout_id)['t'+k.cache.dates.mt[0]];
//				[product_id,spec,count,cost,amount,remark]
				for(var i=0;i<19;i++){
					pid = parseInt($(box+' td.p_name input').eq(i).attr('data-id'));
					count = parseFloat($(box+' td.count').eq(i).html());
					if(count){
						if(pid){
							if(!repos[pid]||count > repos[pid][0]){
								$(box+' td.count').eq(i).focus();
								k.aspect.noty.message('第'+(i+1)+'条商品库存超限，当前库存：'+(repos[pid]?repos[pid][0]:0));
								return;
							}
							prod = k.cache.get(pid);
							detail=[];
							detail[0] = pid;
							detail[1] = $(box+' td.p_spec').eq(i).html();
							detail[2] = count;
							detail[3] = (repos[pid][1]/ repos[pid][0]);
							detail[4] = detail[2]*detail[3];
							detail[5] = $(box+' td.remark').eq(i).html();
							
							bill.amount += detail[4];
							bill.detail.push(detail);
						}else {
							k.aspect.noty.message('第'+(i+1)+'条商品名称不对！');
							return;
						}
					}else if(pid){
						k.aspect.noty.message('商品数量不对！');
						$(box+' td.count').eq(i).focus();
						return;
					}
				}
				if(bill.detail.length > 0){
					k.dao.addOne(bill,function(err,r){
						if(r){
							k.aspect.noty.message('新增调拨单成功！');
							$(box+' button.submit').attr('disabled','disabled');
							k.aspect.bill_center.handle(bill,function(){});
						}else k.aspect.noty.message('新增调拨单失败！');
					});
				}else{
					k.aspect.noty.message('商品详情不对！');
				}
			})
			$(box+' button.default-set').click(function(){
				k.plugin.usercenter.setting.modify('allotbilling');
			})
			$(box+' button.refresh').click(function(){
				k.aspect.manage.selectRepositoryRefresh($(box+' select.repository'));
				$(box+' input.number').val('DB-'+k.aspect.manage.get_number());
				$(box+' td.p_name input').val('').attr('hidden','hidden').removeAttr('data-id');
				$(box+' td.number').html(''); $(box+' td.p_spec').html('');
				$(box+' td.p_unit').html('');   $(box+' td.count').html('');
				
				$(box+' table.bill-table td.p_name input').eq(0).removeAttr('hidden');
				$(box+' button.submit').removeAttr('disabled');
				
				var def = setting['allotbilling-'+k.cache.sign.staff_id]||{};
				if(def.callout_id) $('#layout div.allotbilling select.callout_id').val(def.callout_id);
				if(def.callin_id) $('#layout div.allotbilling select.callin_id').val(def.callin_id);
				$('#layout div.allotbilling input.alloter').val(k.cache.get(def.alloter_id||k.cache.sign.staff.bind_clerk).name);
				
				k.aspect.atcp.set_repository(k.cache.get(parseInt($('#layout div.allotbilling select.callout_id').val()))['t'+k.cache.dates.mt[0]]);
			});
			$(box+' button.refresh').click();
		},
	}
	p.allotbill={
		release:function(){ $('#layout div.allotbill table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.allotbill button.s-btn').click(); },
		init:function(){
//			[product_id,spec,count,cost,amount,remark]
			if(k.aspect.role_check('find-allotbill')){
				var box = '#layout div.allotbill',rowspan,j;
				k.aspect.bill.init(function(v,n,len,nu,cs,prods){
					rowspan='<td class="num" rowspan="'+len+'">'+n+'</td><td rowspan="'+len+'"><span title="删除" onclick="kaidanbao.aspect.bill.del('+v._id+',\'allotbill\')">'+nu+'</span></td><td rowspan="'+len+'">'+cs+'</td><td rowspan="'+len+'">'+k.cache.get(v.callout_id).name+'</td><td rowspan="'+len+'">'+k.cache.get(v.callin_id).name+'</td><td rowspan="'+len+'">'+v.amount.toFixed(2);
					for(j in v.detail){
						$(box+' table.kc-manage-list').append(
								'<tr class="list '+(n%2===0?'opp':'')+'">'+rowspan
								+'</td><td style="text-align:left;">'+prods[j]
								+'</td><td>'+v.detail[j][1]
								+'</td><td>'+(v.detail[j][2]+' '+(k.cache.get(v.detail[j][0]).unit ||''))
								+'</td><td class="remark">'+(v.detail[j][5]||'')
								+'</td></tr>');
						rowspan='';
					}
				});
			}else{
				$('#layout div.lay-main').append('<div hidden class="allotbill"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		}
	}
	p.productbilling={
		reload:function(){k.aspect.atcp.set_repository(k.cache.get(parseInt($('#layout div.productbilling select.repository').val()))['t'+k.cache.dates.mt[0]]);},
		init:function(){
			if(!k.aspect.role_check('add-productbill')){
				$('#layout div.lay-main').append('<div hidden class="productbilling"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
				return;
			}
			var box = '#layout div.productbilling';
			$('#layout div.lay-main').append(' \
				<div hidden class="productbilling"> \
					<div class="bill-top"> \
						<div style="width:21%;">生产员：<input class="clerk worker" /></div> \
						<div style="width:25%;">开单员：<input class="clerk order" disabled="disabled" style="background-color:#fff;" /></div> \
						<div style="width:25%;">仓库：<select class="repository" /></div> \
						<div style="width:29%;">单号：<input class="number" readonly="readonly" style="width:75%;" /></div> \
					</div> \
					<table class="bill-table" style="height:80%"><tr> \
						<th style="width:3%;"></th> \
						<th style="width:27%;">原料商品</th> \
						<th style="width:8%;">单价</th> \
						<th style="width:8%;">数量</th> \
						<th style="width:3%;"></th> \
						<th style="width:27%;">产出商品</th> \
						<th style="width:7%;">单位</th> \
						<th style="width:7%;">出厂价</th> \
						<th style="width:10%;">出厂数量</th></tr> \
					</table> \
          			<div class="bill-sub"> \
						<button class="submit">提交</button> \
						<button class="default-set">默认设置</button> \
						<button class="refresh">刷新</button> \
					</div> \
				</div>');
			var repos;
			$(box+' select.repository').change(function(){
				repos = k.cache.get(parseInt($(box+' select.repository').val()))['t'+k.cache.dates.mt[0]];
				k.aspect.atcp.set_repository(repos);
			});
			k.aspect.atcp.bind($(box+' input.clerk'),'clerk',{
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
				},
			});
			var tds='',setting = k.cache.setup('setting');
			for(var i=0;i<19;i++){
				tds += '<tr><td class="num">'+(i+1)+'</td><td class="p_name"><input class="raw" hidden data-index="'+i+'" /></td><td class="cost"></td><td class="count1"></td> \
						<td class="num">'+(i+1)+'</td><td class="p_name"><input class="end" hidden data-index="'+i+'" /></td><td class="p_unit"></td><td class="price"></td><td class="count2"></td></tr>';
			}
			$(box+' table.bill-table').append(tds);
			$(box+' table.bill-table th').css('height','5%');
			$(box+' table.bill-table td').css('height','5%');
			k.aspect.atcp.bind($(box+' td.p_name input.raw'),'product',{
				has_store_check:true,
				skip_fixed:true,
				width:'37%',
				onSelect:function(s){
					var index=parseInt($(this).attr('data-index'));
					var prod = k.cache.get(s.data.id);
					$(box+' td.p_name input.raw').eq(index).val((prod.number?(prod.number+' '):'')+prod.name).attr('data-id',s.data.id);
					$(box+' td.p_name input.raw').eq(index+1).removeAttr('hidden');
					$(box+' td.cost').eq(index).html((repos[prod._id][1]/repos[prod._id][0]).toFixed(3)+' /'+(prod.unit||''));
					$(box+' td.count1').eq(index).focus();
				},
				onSearchComplete:function(q,s){
					var index=parseInt($(this).attr('data-index'));
					$(box+' td.p_name input.raw').eq(index).removeAttr('data-id');
					$(box+' td.cost').eq(index).html('');
					$(box+' td.count1').eq(index).html('');
				},
			});
			k.aspect.atcp.bind($(box+' td.p_name input.end'),'product',{
				skip_fixed:true,
				width:'37%',
				onSelect:function(s){
					var index=parseInt($(this).attr('data-index'));
					var prod = k.cache.get(s.data.id);
					$(box+' td.p_name input.end').eq(index).val((prod.number?(prod.number+' '):'')+prod.name).attr('data-id',s.data.id);
					$(box+' td.p_name input.end').eq(index+1).removeAttr('hidden');
					$(box+' td.p_unit').eq(index).html(prod.unit||'');
					$(box+' td.price').eq(index).focus();
				},
				onSearchComplete:function(q,s){
					var index=parseInt($(this).attr('data-index'));
					$(box+' td.p_name input.end').eq(index).removeAttr('data-id');
					$(box+' td.p_unit').eq(index).html('');
					$(box+' td.price').eq(index).html('');
					$(box+' td.count2').eq(index).html('');
				},
			});
			$(box+' table.bill-table td.count1').attr('contenteditable','true');
			$(box+' table.bill-table td.price').attr('contenteditable','true');
			$(box+' table.bill-table td.count2').attr('contenteditable','true');
//				
			$(box+' button.submit').click(function(){
				var bill = {tn:'productbill',detail:[],cost:0,amount:0,number:$(box+' input.number').val()};
				bill.worker_id = k.cache.name_cache.clerk[$(box+' input.worker').val()];
				bill.order_id = k.cache.sign.staff.bind_clerk;
				bill.repository_id = parseInt($(box+' select.repository').val());
				if(!bill.worker_id){
					k.aspect.noty.message('生产员不存在！');
					return ;
				}
				var detail,pid1,count1,pid2,price,count2,amount2;
				var repos = k.cache.get(bill.repository_id)['t'+k.cache.dates.mt[0]];//防止修改，不能删
				for(var i=0;i<19;i++){
					pid1 = parseInt($(box+' td.p_name input.raw').eq(i).attr('data-id'));
					pid2 = parseInt($(box+' td.p_name input.end').eq(i).attr('data-id'));
					price  = parseFloat($(box+' td.price').eq(i).html());
					count1 = parseFloat($(box+' td.count1').eq(i).html());
					count2 = parseFloat($(box+' td.count2').eq(i).html());
//					[[pid1,cost,count1,amount1,pid2,price,count2,amount2],...],
					detail = [];
					if(count1){
						if(pid1){
							if(!repos[pid1]||(count1 > repos[pid1][0])){
								$(box+' td.count1').eq(i).focus();
								k.aspect.noty.message('第'+(i+1)+'条原料库存超限，当前库存：'+(repos[pid1]?repos[pid1][0]:0));
								return;
							}
							detail[0] = pid1;
							detail[1] = repos[pid1][1] / repos[pid1][0];
							detail[2] = count1;
							detail[3] = detail[1] * detail[2];
							bill.cost += detail[3];
						}else{
							k.aspect.noty.message('第'+(i+1)+'条原料商品名称不对。');
							return ;
						}
					}else if(pid1){
						k.aspect.noty.message('原料商品数量不对。');
						$(box+' td.count1').eq(i).focus();
						return ;
					}
					if(count2){
						if(pid2){
							amount2 = count2 * price;
							if(amount2){
								detail[4] = pid2;
								detail[5] = price;
								detail[6] = count2;
								detail[7] = amount2;
								bill.amount += detail[7];
							}else{
								k.aspect.noty.message('出厂价不对。');
								$(box+' td.price').eq(i).focus();
								return ;
							}
						}else{
							k.aspect.noty.message('第'+(i+1)+'条成品商品名称不对。');
							return ;
						}
					}else if(pid2){
						k.aspect.noty.message('成品数量不对。');
						$(box+' td.count2').eq(i).focus();
						return ;
					}
					
					if(detail[0] || detail[4]){
						bill.detail.push(detail);
					}
				}
				if(bill.detail.length > 0){
					k.dao.addOne(bill,function(err,r){
						if(r){
							k.aspect.noty.message('新增生产单成功！');
							$(box+' button.submit').attr('disabled','disabled');
							k.aspect.bill_center.handle(bill,function(){});
						}else k.aspect.noty.message('新增生产单失败！');
					});
				}else{
					k.aspect.noty.message('商品详情不对！');
				}
			})
			$(box+' button.default-set').click(function(){
				k.plugin.usercenter.setting.modify('productbilling');
			})
			$(box+' button.refresh').click(function(){
				k.aspect.manage.selectRepositoryRefresh($(box+' select.repository'));
				$(box+' input.number').val('SC-'+k.aspect.manage.get_number());
				$(box+' td.p_name input').val('').attr('hidden','hidden').removeAttr('data-id');
				$(box+' td.cost').html(''); $(box+' td.count1').html('');
				$(box+' td.p_unit').html('');   $(box+' td.count2').html('');
				$(box+' td.price').html('');
				
				$(box+' table.bill-table td.p_name input.raw').eq(0).removeAttr('hidden');
				$(box+' table.bill-table td.p_name input.end').eq(0).removeAttr('hidden');
				$(box+' button.submit').removeAttr('disabled');
				
				var def = setting['productbilling-'+k.cache.sign.staff_id]||{};
				if(def.repository_id) $(box+' select.repository').val(def.repository_id);
				$(box+' input.worker').val(k.cache.get(def.worker_id||k.cache.sign.staff.bind_clerk).name);
				$(box+' input.order').val(k.cache.get(k.cache.sign.staff.bind_clerk).name);
				
				repos = k.cache.get(parseInt($(box+' select.repository').val()))['t'+k.cache.dates.mt[0]];
				k.aspect.atcp.set_repository(repos);
			});
			$(box+' button.refresh').click();
		},
	}
	p.productbill={
		release:function(){ $('#layout div.productbill table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.productbill button.s-btn').click(); },
		init:function(){
//			[[pid1,cost,count1,amount1,pid2,price,count2,amount2],...],
			if(k.aspect.role_check('find-productbill')){
				var box = '#layout div.productbill',rowspan,j;
				k.aspect.bill.init(function(v,n,len,nu,cs,prods){
					rowspan='<td class="num" rowspan="'+len+'">'+n+'</td><td rowspan="'+len+'"><span title="删除" onclick="kaidanbao.aspect.bill.del('+v._id+',\'productbill\')">'+nu+'</span></td><td rowspan="'+len+'">'+cs+'</td><td rowspan="'+len+'">'+k.cache.get(v.repository_id).name+'</td><td rowspan="'+len+'">'+v.cost.toFixed(2)+'</td><td rowspan="'+len+'">'+v.amount.toFixed(2);
					for(j in v.detail){
						j = parseInt(j);
						$(box+' table.kc-manage-list').append(
								'<tr class="list '+(n%2===0?'opp':'')+'">'+rowspan
								+'</td><td style="text-align:left;">'+(v.detail[j][0]?prods[j]:'')
								+'</td><td>'+(v.detail[j][0]?(v.detail[j][1].toFixed(3)+' /'+(k.cache.get(v.detail[j][0]).unit||'')):'')
								+'</td><td>'+(v.detail[j][0]?v.detail[j][2]:'')
								+'</td><td>'+(v.detail[j][4]?prods[20+j]:'')
								+'</td><td>'+(v.detail[j][4]?(v.detail[j][5]+' /'+(k.cache.get(v.detail[j][4]).unit||'')):'')
								+'</td><td>'+(v.detail[j][4]?v.detail[j][6]:'')
								+'</td><td class="remark"></td></tr>');
						rowspan='';
					}
				});
			}else{
				$('#layout div.lay-main').append('<div hidden class="productbill"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		}
	}
})(window.kaidanbao);
