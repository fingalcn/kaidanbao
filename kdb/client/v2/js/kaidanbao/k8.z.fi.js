/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	p.statement={
		view_bill:function(tn,id){
			k.dao.get(tn||'salebill',id,function(bill){
				if(!bill) return;
				k.aspect.print.prepare(bill);
				k.aspect.noty.confirm($('#print').html(),function(){
					k.aspect.noty.confirm_close();
				},true,0,'770px');
			});
		},
		view:function(id){
			var customer=k.cache.get(id);//也可以是supplier
			var n=0,total=0,bill,sd,sds=[];
			var count,amount,month='all',add_month;
			var table = '<tr><th class="chk" title="全选"><input type="checkbox" id="checkbox_a" hidden class="chk_1 first" /><label for="checkbox_a"></label></th><th>订单号</th><th>总额</th><th>已付</th><th>状态</th></tr>';
			for(var j=0;j<24;j++){
				sd = 's'+k.cache.dates.mt[j];
				add_month=false;
				if(customer[sd] && customer[sd]!=='x' && (month==='all' || month===sd)){
					for(var bid in customer[sd]){
						bill = customer[sd][bid];
						if(bill!=='x' && bill[3]!=='d'){
							add_month = true;
							table += ('<tr class="all '+
									sd+'"><td class="chk"><input data-month="'+
									sd+'" data-bid="'+bid+'" type="checkbox" id="checkbox_a'+
									(++n)+'" hidden class="chk_1 list" /><label for="checkbox_a'+
									n+'"></label></td><td><span onclick="kaidanbao.plugin.statement.view_bill(null,'+
									bid+')">'+bill[0]+'</span></td><td>'+
									bill[1]+'</td><td>'+(bill[2]||0)+'</td><td>未结清</td></tr>');
							total +=bill[1];
							if(bill[2]) total -= bill[2];
						}
					}
					if(add_month) sds.push(sd);
				}
			}
			$.facebox('<table class="list">'+
					table+'</table><table class="fix"><tr><td>客户：</td><td style="width:100px;">'+
					customer.name+'</td><td>月份：</td><td><select class="month"><option value="all">所有月份</option></select></td><td>出纳：</td><td>'+
					k.cache.get(k.cache.sign.user['staff'+k.cache.sign.staff_id].bind_clerk).name+'</td></tr> \
					<tr><td>选择：</td><td class="count">0 / '+
					n+'</td><td>金额：</td><td><input class="amount" placeholder="'+
					total.toFixed(2)+'" /></td><td>账户：</td><td><select class="account"></select></td></tr><table>');
			
			$('#facebox div.title').html('对账单详情（追加订金时请仅选择一个订单，勿多选）');
			k.aspect.manage.selectAccountRefresh($('#facebox select.account'));
			for(var i in sds){
				$('#facebox select.month').append('<option value="'+sds[i]+'">'+('20'+sds[i][1]+sds[i][2]+'-'+sds[i][3]+sds[i][4])+'</option>');
			}
			$('#facebox input.first').change(function(){
				var checked = $('#facebox input.first').prop('checked');
				if(checked) {
					count = n;
					$('#facebox input.first').next().css('background-color','#e7eff5');
//					$('#facebox input.amount').val(total.toFixed(2));
				}else{
					count = 0;
					$('#facebox input.first').next().css('background-color','#fff');
//					$('#facebox input.amount').val('');
				}
				$('#facebox td.count').html(count+' / '+n);
				$('#facebox input.list').prop('checked',checked);
				$('#facebox input.amount').attr('placeholder',total.toFixed(2));
			});
			$('#facebox input.list').change(function(){
				count=0;amount=0;
				$('#facebox table.list tr.'+month+' input.list').each(function(i){
					if($(this).prop('checked')) {
						count++;
						var am = $('#facebox table.list tr.'+month+':eq('+i+') td:eq(2)').html();
						var pm = $('#facebox table.list tr.'+month+':eq('+i+') td:eq(3)').html();
						amount +=(parseFloat(am)-parseFloat(pm));
					}
				});
				if(count ==n){
					$('#facebox input.first').prop('checked',true);
					$('#facebox input.first').next().css('background-color','#e7eff5');
				}else{
					$('#facebox input.first').next().css('background-color','#fff');
					if(count == 0) $('#facebox input.first').prop('checked',false);
					else $('#facebox input.first').prop('checked',true);
				}
				$('#facebox td.count').html(count+' / '+n);
//				$('#facebox input.amount').val(amount?amount.toFixed(2):'');
				$('#facebox input.amount').attr('placeholder',amount?amount.toFixed(2):total.toFixed(2));
			});
			$('#facebox select.month').change(function(){
				count=0;amount=0;n=0,total=0;
				month = $('#facebox select.month').val();
				$('#facebox table.list tr.all').attr('hidden','hidden');
				$('#facebox table.list tr.'+month).removeAttr('hidden');
				
				$('#facebox table.list tr.'+month+' input.list').each(function(i){
					n++;
					var am = $('#facebox table.list tr.'+month+':eq('+i+') td:eq(2)').html();
					var pm = $('#facebox table.list tr.'+month+':eq('+i+') td:eq(3)').html();
					total +=(parseFloat(am)-parseFloat(pm));
				});
				
				$('#facebox input.first').prop('checked',false).next().css('background-color','#fff');
				$('#facebox td.count').html('0 / '+n);
				$('#facebox input.list').prop('checked',false);
				$('#facebox input.amount').val('');
				$('#facebox input.amount').attr('placeholder',total.toFixed(2));
			});
			$('#facebox div.footer').html('<button class="ensure">确认'+(customer.tn==='customer'?'收':'付')+'款</button>');
			$('#facebox div.footer .ensure').click(function(){
				if(!k.aspect.role_check('add-moneyflow')){
					k.aspect.noty.message('您没有操作权限（需要新增资金流水）！');
					return;
				}
				var payamount=$('#facebox input.amount').val().trim();
				if(!u.is_float(payamount)){
					k.aspect.noty.message('金额格式错误！');
					return;
				}
				payamount = parseFloat(payamount);
				if(count==0){
					k.aspect.noty.message('未选择任何订单！');
					return;
				}
				//先遍历已选择的订单
				var bill_ids={},month_ids=[];
				$('#facebox tr.'+month+' input.list').each(function(i){
					if($(this).prop('checked')) {
						if(!bill_ids[$(this).attr('data-month')]){
							bill_ids[$(this).attr('data-month')] = [];
						} 
						bill_ids[$(this).attr('data-month')].push(parseInt($(this).attr('data-bid')));
					}
				});
				var moneyflow={tn:'moneyflow',number:'CN-'+k.aspect.manage.get_number(),
						account_id:parseInt($('#facebox select.account').val()),
						cashier_id:k.cache.sign.user['staff'+k.cache.sign.staff_id].bind_clerk,
						amount:payamount};
				if(customer.tn === 'supplier'){
					moneyflow.type='b0';
				}else if(customer.tn === 'customer'){
					moneyflow.type='a0';
				}
				moneyflow[customer.tn+'_id'] = customer._id;
				moneyflow.bill_ids=[];
				for(var sd in bill_ids){
					bill_ids[sd].unshift(sd);
					moneyflow.bill_ids.push(bill_ids[sd]);
				}
				k.aspect.noty.confirm('<br /><h1>确定'+(customer.tn==='customer'?'收':'付')+'款？</h1><br />（'+customer.name+'：'+payamount+'元，账户：'+k.cache.get(moneyflow.account_id).name+'）',function(){
					k.dao.addOne(moneyflow,function(err,r){
						if(r){
							k.aspect.noty.message('操作成功！');
							k.aspect.noty.confirm_close();
							$.facebox.close();
							k.aspect.bill_center.handle(moneyflow,function(){});
							$('#layout div.statement div.kc-manage-box button').click();
						}
					});
				});
			});
		},
		release:function(){ $('#layout div.statement table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.statement button.s-btn').click(); },
		init:function(){
			if(!k.aspect.role_check('find-statement')){
				$('#layout div.lay-main').append('<div hidden class="statement"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
				return;
			}
			var total=0,box = '#layout div.statement';
			k.aspect.manage.init({create:'noop',classify:'noop',
				search:function(){
					$(box+' table.kc-manage-list tr.list').remove();
					var statments=[],stat,s1 = $(box+' select.s1').val(),na;
					$(box+' table.kc-manage-list th').eq(1).html(s1.replace('supplier','供应商').replace('customer','客户'));
					var sd,cs,add_month,d;
					var query = $(box+' .kc-manage-box input').val().trim();
					for(var j in k.cache.fixed_page[s1]){
						cs   = k.cache.get(k.cache.fixed_page[s1][j]);
						if(query && cs.name !== query) continue;//搜索
						stat = {months:0,customer_id:cs._id,count:0,amount:0,lm:cs.lm,detail:[]};
						for(var i=0;i<24;i++){
							sd='s'+k.cache.dates.mt[i];
							add_month=false;
							if(!cs[sd] || cs[sd]==='x') continue;
							d = {month:sd,count:0,amount:0,payamount:0};
							for(var bid in cs[sd]){
								if(cs[sd][bid]!=='x'&&cs[sd][bid][0]&&cs[sd][bid][3]!=='d'){
									add_month = true;
									stat.count  += 1;
									stat.amount += (cs[sd][bid][1]-cs[sd][bid][2]);
									
									d.count     += 1;
									d.amount    += cs[sd][bid][1];
									d.payamount += cs[sd][bid][2];
								}
							}
							if(add_month) {
								stat.months += 1;
								stat.detail.push(d);
							}else if(i > k.conf.kdb.ms&&u.doSomethingMonthly('clear_statement',true)){
								cs[sd]='';
								k.dao.save(cs._id,[sd]);
							}
						}
						if(stat.months>0) statments.push(stat);
					}
					//排序
					var asc  = $(box +' th.sort.asc').attr('data-sort');
					var desc = $(box +' th.sort.desc').attr('data-sort');
					if(asc){
						statments.sort(function(a,b){
							return a[asc] < b[asc]?1:-1;
						});
					}else if(desc){
						statments.sort(function(a,b){
							return a[desc] > b[desc]?1:-1;
						});
					}
					var count=0,amount=0,rowspan,v;
					var iq,qs,na,matchs;
					for(var i in statments){
						v    = statments[i];
						na = k.cache.get(v.customer_id).name;
						if(query) na = na.replace(new RegExp('('+query+')', 'gi'), '<b>$1<\/b>');
						count  += v.count;
						amount += v.amount;
						if(i < k.conf.kdb.max_show_lines){//显示数量限制
							rowspan='<tr class="list '+(i%2===0?'':'opp')+'"><td rowspan="'+v.months+'">'+(parseInt(i)+1)+'</td><td rowspan="'+v.months+'"><span title="查看" onclick="kaidanbao.plugin.statement.view('+v.customer_id+')">'+na+'</span></td><td rowspan="'+v.months+'">'+v.count+'</td><td rowspan="'+v.months+'">'+v.amount.toFixed(2)+'</td><td rowspan="'+v.months+'">'+u.date.getTimeFormat(v.lm,'d')+'</td>';
							for(var j in v.detail){
								d = v.detail[j];
								$(box+' table.kc-manage-list').append(rowspan
										+'<td>20'+d.month[1]+d.month[2]+'-'+d.month[3]+d.month[4]
								+'</td><td>'+d.count
								+'</td><td>'+d.amount.toFixed(2)
								+'</td><td>'+d.payamount.toFixed(2)
								+'</td><td class="remark"></td></tr>');
								rowspan='<tr class="list '+(i%2===0?'':'opp')+'">';
							}
						}
					}
					$(box+' section.summary-box').html('总计：'+count+' 单，'+amount.toFixed(2)+' 元');
				},select:function(){
					$(box+' select.s1').append('<option value="customer">客户对账</option><option value="supplier">供应商对账</option>');
					$(box+' select.s2').append('<option>所有月份</option>');
					$(box+' input').attr('placeholder','搜索');
				}
			});
		}
	}
	p.moneyflow={
		insert:function(){
			var type       = $('#facebox select.type').val(),
			    account_id = parseInt($('#facebox select.account').val()),
			    amount     = parseFloat($('#facebox input.amount').val()),
			    customer_id= k.cache.name_cache.customer[$('#facebox input.customer').val().trim()],
			    supplier_id= k.cache.name_cache.supplier[$('#facebox input.supplier').val().trim()],
			    cashier_id = k.cache.name_cache.clerk[$('#facebox input.cashier').val().trim()],
			    order_id   = k.cache.sign.staff.bind_clerk;
			    remark=$('#facebox textarea.remark').val(),
			    mf={tn:'moneyflow',number:$('#facebox input.number').val(),amount:amount,
			    	type:type,account_id:account_id,cashier_id:cashier_id,order_id:order_id};
			if(remark) mf.remark=remark;
			if(!amount) { k.aspect.noty.message('金额不对！'); return ; }
			if(!cashier_id) { k.aspect.noty.message('出纳员不对，请新增！'); return ; }
			if(type&&type[0] === 'a'){
				mf.customer_id = customer_id;
				if(!customer_id) { k.aspect.noty.message('客户不对，请新增！'); return ; }
			}else if(type&&type[0] === 'b'){
				mf.supplier_id = supplier_id;
				if(!supplier_id) { k.aspect.noty.message('供应商不对，请新增！'); return ; }
			}else{
				k.aspect.noty.message('类型不存在，请增加分类！');
				return ;
			}
			k.dao.addOne(mf,function(){
				$.facebox.close();
				k.aspect.bill_center.handle(mf);
				$('#layout div.moneyflow div.kc-manage-box button').click();
			});
		},
		create:function(){
			if(!k.aspect.role_check('add-moneyflow')){
				return;
			}
			$.facebox(' \
				<div class="fb-input-wrapper"> \
				<label>流水号：</label><input disabled="disabled" class="number" /></div> \
				<div class="fb-input-wrapper"> \
				<label>类型：</label><select class="type"></select>，账户：<select class="account"></select></div> \
				<div class="fb-input-wrapper"> \
				<label>金额：</label><input class="amount" /></div> \
				<div class="fb-input-wrapper hide customer"> \
				<label>客户：</label><input class="customer" /></div> \
				<div class="fb-input-wrapper supplier" hidden> \
				<label>供应商：</label><input class="supplier" /></div> \
				<div class="fb-input-wrapper"> \
				<label>出纳员：</label><input class="cashier" /></div> \
				<div class="fb-input-wrapper"> \
				<label>摘要：</label><textarea class="remark" maxlength="200"></textarea></div> \
				<div class="fb-input-wrapper"> \
				<label>&nbsp;</label> \
				<button onclick="kaidanbao.plugin.moneyflow.insert()">提交</button> \
			</div>');
			$('#facebox div.title').html('出纳流水 > 新增');
			$('#facebox input.number').val('CN-'+k.aspect.manage.get_number());
			var type,i,account;
			k.aspect.manage.selectClassifyRefresh($('#facebox select.type'),'moneyflow','n');
			k.aspect.manage.selectAccountRefresh($('#facebox select.account'));
			var type=$('#facebox select.type').val();
			$('#facebox select.type').change(function(e){
				type = $(this).val();
				if(type&&type[0] === 'a'){
					$('#facebox div.customer').removeAttr('hidden');
					$('#facebox div.supplier').attr('hidden','hidden');
				}else if(type&&type[0] === 'b'){
					$('#facebox div.supplier').removeAttr('hidden');
					$('#facebox div.customer').attr('hidden','hidden');
				}else{
					$('#facebox div.customer').attr('hidden','hidden');
					$('#facebox div.supplier').attr('hidden','hidden');
				}
			});
			$('#facebox select.type').change();
			$('#facebox input.cashier').val(k.cache.get(k.cache.sign.staff.bind_clerk).name);
			k.aspect.atcp.bind($('#facebox input.cashier'),'clerk',{
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
				},
			});
			k.aspect.atcp.bind($('#facebox  input.customer'),'customer',{
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
				},
			});
			k.aspect.atcp.bind($('#facebox  input.supplier'),'supplier',{
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
				},
			});
		},
		release:function(){ $('#layout div.moneyflow table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.moneyflow button.s-btn').click(); },
		init:function(){
			if(!k.aspect.role_check('find-moneyflow')){
				$('#layout div.lay-main').append('<div hidden class="moneyflow"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
				return;
			}
			var total=0,box = '#layout div.moneyflow';
			k.aspect.manage.init({create:kaidanbao.plugin.moneyflow.create
				,search:function(){ total=0;
					$(box+' table.kc-manage-list tr.list').remove();
					$(box+' table.kc-manage-list th.remark').html('摘要');
					$(box+' input').attr('placeholder','搜索流水号、客户或供应商、账户、出纳员');
					
					var fi=function(){
						var query = $(box+' input').val().trim();
						var s1 = $(box+' select.s1').val(),s2 = $(box+' select.s2').val();
						var amount=0,i=0,matchs=0,qs,qs_len;
						var clazz=k.cache.setup('classify').moneyflow||{};
						
						if(query) {qs=query.toLowerCase().split(' ');qs_len=qs.length;}
						
						var v1=k.cache.dynamic['moneyflow'][s2],v;
						var rowspan,nu,cs,er,ac;
						for(var idx in v1){ 
							v = v1[idx];
							
							if(v.st === 'd') continue;
							if(s1 !=='a' && v.type !== s1) continue;
							
							cs = k.cache.get(v.supplier_id||v.customer_id).name||'';
							er = k.cache.get(v.cashier_id).name || '';
							ac = k.cache.get(v.account_id).name || '';
							nu = v.number;
							if(qs){
								matchs=0;
								for(var iq in qs){
									if(!qs[iq]) continue;
									if((nu+' '+cs+' '+er+' '+ac).toLowerCase().indexOf(qs[iq])>=0){
										nu = nu.replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
										cs = cs.replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
										er = er.replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
										ac = ac.replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
										matchs++;
									}
								}
								if(matchs < qs_len) continue;
							}
							amount += v.amount;
							if(i < k.conf.kdb.max_show_lines) {
								$(box+' table.kc-manage-list').append(
										'<tr class="list '+(++i%2===0?'opp':'')+'"><td>'+i
										+'</td><td>'+nu
										+'</td><td>'+cs
										+'</td><td>'+ac
										+'</td><td>'+er
										+'</td><td>'+v.amount
										+'</td><td>'+(clazz[v.type]?clazz[v.type].v:'')
										+'</td><td class="remark">'+(v.remark || '')
										+'</td></tr>');
							}
						}
						$(box+' section.summary-box').html('总 '+i+' 条，'+amount.toFixed(2)+' 元');
					}
					
					var s1=$(box+' select.s1').val(),i=0,amount=0;
					var s2=$(box+' select.s2').val();
					
					k.dao.queryDynamicByMonth('moneyflow',s2,function(finish){
						if(finish) {
							fi();
						}
					});
				},select:function(){
					k.aspect.manage.selectClassifyRefresh($(box+' select.s1'),'moneyflow','a');
					for(var i in k.cache.dates.m_t){
						if(i<=k.cache.sign.month_length && i<24) $(box+' select.s2').append('<option>'+k.cache.dates.m_t[i]+'</option>');
					}
				}
			});
		},
	}
})(window.kaidanbao);
