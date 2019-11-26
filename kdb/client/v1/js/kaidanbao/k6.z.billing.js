/**
 * http://usejsdoc.org/
 */
(function(k){
	var u   = k.utils,asp = k.aspect,si;
	var bill_map={};
	/** 开单组件 */
	k.aspect.billing={
		init:function(){
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			si  = k.cache.sign.staff_id;
			$('#layout div.lay-main').append(' \
				<div hidden class="'+pn+'"> \
					<div class="bill-top"></div> \
					<table class="bill-table"></table> \
					<div class="bill-bottom"></div> \
          			<div class="bill-sub"></div> \
				</div>');
			asp.billing.bill_top();
			asp.billing.bill_table();
			asp.billing.bill_bottom();
			asp.billing.bill_sub();
			k.aspect.atcp.bind($(box+' input.clerk'),'clerk',{
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name).blur();
				},
			});
			$(box+' button.refresh').click();
		},
		bill_top:function(){//构建表单顶部
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn,html;
			if(pn==='salebilling'){
				html = '<div style="width:26%;">客户：<input class="customer" style="width:70%;" /></div> \
					<div style="width:23%;">销售员：<input class="clerk saler" /></div> \
					<div style="width:23%;">开单员：<input class="clerk order" /></div> \
					<div style="width:28%;">单号：<input class="number" readonly="readonly" style="width:75%;" /></div>';
			}else if(pn==='bringbilling'){
				html = '<div style="width:26%;">供应商：<input class="supplier" style="width:65%;" /></div> \
					<div style="width:23%;">采购员：<input class="clerk buyer" /></div> \
					<div style="width:23%;">开单员：<input class="clerk order" /></div> \
					<div style="width:28%;">单号：<input class="number" readonly="readonly" style="width:75%;" /></div>';
			}
			$(box+' .bill-top').html(html);
		},
		bill_table:function(){//构建表格
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn,html;
			html= '<tr> \
				<th style="width:3%;"><svg hidden version="1.1" viewBox="0 -70 1034 1034"><path d="M933.79 349.75c-53.726 93.054-21.416 212.304 72.152 266.488l-100.626 174.292c-28.75-16.854-62.176-26.518-97.846-26.518-107.536 0-194.708 87.746-194.708 195.99h-201.258c0.266-33.41-8.074-67.282-25.958-98.252-53.724-93.056-173.156-124.702-266.862-70.758l-100.624-174.292c28.97-16.472 54.050-40.588 71.886-71.478 53.638-92.908 21.512-211.92-71.708-266.224l100.626-174.292c28.65 16.696 61.916 26.254 97.4 26.254 107.196 0 194.144-87.192 194.7-194.958h201.254c-0.086 33.074 8.272 66.57 25.966 97.218 53.636 92.906 172.776 124.594 266.414 71.012l100.626 174.29c-28.78 16.466-53.692 40.498-71.434 71.228zM512 240.668c-114.508 0-207.336 92.824-207.336 207.334 0 114.508 92.826 207.334 207.336 207.334 114.508 0 207.332-92.826 207.332-207.334-0.002-114.51-92.824-207.334-207.332-207.334z"></path></svg></th> \
				<th class="mingchen" style="width:20%;">产品名称</th> \
				<th class="bianhao" style="width:9%;">编号</th> \
				<th style="width:8%;">规格</th> \
				<th style="width:6%;">单位</th> \
				<th style="width:9%;">数量</th> \
				<th style="width:9%;">单价 </th> \
				<th style="width:11%;">金额</th> \
				<th>备注</th></tr> \
				<tr><td class="num">1</td><td class="p_name"><input class="product"        data-index="0" /></td><td class="bianhao number"></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="0" class="count"></td><td data-index="0" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">2</td><td class="p_name"><input class="product" hidden data-index="1" /></td><td class="bianhao number"></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="1" class="count"></td><td data-index="1" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">3</td><td class="p_name"><input class="product" hidden data-index="2" /></td><td class="bianhao number"></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="2" class="count"></td><td data-index="2" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">4</td><td class="p_name"><input class="product" hidden data-index="3" /></td><td class="bianhao number"></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="3" class="count"></td><td data-index="3" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">5</td><td class="p_name"><input class="product" hidden data-index="4" /></td><td class="bianhao number"></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="4" class="count"></td><td data-index="4" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">6</td><td class="p_name"><input class="product" hidden data-index="5" /></td><td class="bianhao number"></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="5" class="count"></td><td data-index="5" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">7</td><td class="p_name"><input class="product" hidden data-index="6" /></td><td class="bianhao number"></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="6" class="count"></td><td data-index="6" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">8</td><td class="p_name"><input class="product" hidden data-index="7" /></td><td class="bianhao number"></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="7" class="count"></td><td data-index="7" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">9</td><td class="p_name"><input class="product" hidden data-index="8" /></td><td class="bianhao number"></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="8" class="count"></td><td data-index="8" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr class="foot"><td class="num"></td><td class="dx" colspan="4">合计：</td><td class="count-sum">0</td><td></td><td class="amount-sum">0.00</td><td></td></tr>';
			$(box+' .bill-table').html(html);
			
			$(box+' td').attr('spellcheck','false');
			$(box+' td.p_spec').attr('contenteditable','true');
			$(box+' td.number').attr('contenteditable','true');
			$(box+' td.p_unit').attr('contenteditable','true');
			$(box+' td.count').attr('contenteditable','true');
			$(box+' td.p_price').attr('contenteditable','true');
			$(box+' td.remark').attr('contenteditable','true');
			var amt_cal=function(index){
				var count = $(box+' td.count').eq(index).html();
				var price = $(box+' td.p_price').eq(index).html();
				if(u.is_float(count) && u.is_float(price) && $(box+' td.p_name input.product').eq(index).val()){
					count = parseFloat(count);
					price = parseFloat(price);
					$(box+' td.amount').eq(index).html((count*price).toFixed(2));
					$(box+' td.p_name input').eq(index+1).removeAttr('hidden');
				}else $(box+' td.amount').eq(index).html('');
				
				var t_count=0,t_amount=0,val;
				for(var i=0;i<9;i++){
					val = $(box+' td.amount').eq(i).html();
					if(val){
						t_amount += parseFloat(val);
						t_count  += parseFloat($(box+' td.count').eq(i).html());
					}
				}
				var tc = t_count.toFixed(3),
				ta = t_amount.toFixed(2);
				if(t_count == parseFloat(tc)) tc = t_count;
				$(box+" td.count-sum").html(tc);
				$(box+" td.amount-sum").html(ta);
				if($(box+' select.settlement').val()==='x') $(box+' input.payamount').val(ta);
				if(ta != 0) $(box+" td.dx").html('合计：'+u.DX(ta));
				else $(box+" td.dx").html('合计：');
			}
			$(box+' td.count,'+box+' td.p_price').keyup(function(e){
				amt_cal(parseInt($(this).attr('data-index')));
			});
			$(box+' td.count,'+box+' td.p_price').blur(function(e){
				amt_cal(parseInt($(this).attr('data-index')));
			});
			$(box+' td.count,'+box+' td.p_price').keypress(function(e){
				var index=parseInt($(this).attr('data-index'));
				if(e.keyCode === 13){
					if(index < 9) $(box+' td.p_name input').eq(index+1).focus();
					if(window.event) window.event.returnValue = false;
					else e.preventDefault();
				}
			});
			k.aspect.atcp.bind($(box+' td.p_name input.product'),'product',{
				width:'41.3%',
				onSelect:function(s){
					var index=parseInt($(this).attr('data-index'));
					var prod = k.cache.get(s.data.id);
					$(box+' td.p_name input').eq(index).val(prod.name).attr('data-id',s.data.id);
					$(box+' td.number').eq(index).html(prod.number).removeAttr('contenteditable');
					$(box+' td.p_unit').eq(index).html(prod.unit).removeAttr('contenteditable');
					$(box+' td.p_spec').eq(index).html( s.data.spec||prod.spec||'');
					if(s.data.price) $(box+' td.p_price').eq(index).html(s.data.price);
					else if(pn==='salebilling') $(box+' td.p_price').eq(index).html(prod.price||'');
					
					$(box+' td.count').eq(index).focus();
				},
				onSearchComplete:function(q,s){
					var index=parseInt($(this).attr('data-index'));
					var amt = $(box+' td.amount').eq(index).html();
					$(box+' td.p_name input').eq(index).removeAttr('data-id');
					$(box+' td.number').eq(index).html('').attr('contenteditable','true');
					$(box+' td.p_unit').eq(index).html('').attr('contenteditable','true');
					$(box+' td.p_spec').eq(index).html('');
					$(box+' td.p_price').eq(index).html('');
					$(box+' td.amount').eq(index).html('');
					
					if(!$(box+' td.p_name input').eq(index).val()){
						$(box+' td.count').eq(index).html('');
						$(box+' td.remark').eq(index).html('');
					}
					if(amt){ amt_cal(0); }
				},
			});
		},
		bill_bottom:function(){//构建表单底部
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			var html= ' \
				结算：<select class="settlement"><option value="q">签单对账</option><option value="x">现付全款</option></select> \
				本次付款：<input class="payamount" value="0.00" /> \
				账户：<select class="account"></select> \
				出纳员：<input class="clerk cashier" /> \
				仓库：<select class="repository"></select>';
			$(box+' .bill-bottom').html(html);
			$(box+' select.settlement').change(function(){
				if($(this).val()==='q') $(box+' input.payamount').val('0.00');
				else $(box+' input.payamount').val($(box+' td.amount-sum').html());
			});
			if(pn==='salebilling'){
				k.aspect.atcp.bind($(box+' input.customer'),'customer',{
					onSelect:function(s){
						$(this).val(k.cache.get(s.data.id).name);
						$(box+' input.customer').blur();
						$(box+' td.p_name input').eq(0).focus();
					},
				});
				$(box+' input.customer').blur(function(){
					k.aspect.atcp.product_auto(null,k.cache.name_cache['customer'][$(this).val().trim()]);
				});
			}else if(pn==='bringbilling'){
				k.aspect.atcp.bind($(box+' input.supplier'),'supplier',{
					onSelect:function(s){
						$(this).val(k.cache.get(s.data.id).name);
						$(box+' input.supplier').blur();
						$(box+' td.p_name input').eq(0).focus();
			        },
				});
				$(box+' input.supplier').blur(function(){
					k.aspect.atcp.product_auto(null,k.cache.name_cache['supplier'][$(this).val().trim()]);
				});
			}
		},
		bill_sub:function(){//构建表单按钮
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			var html= ' \
				<button class="submit">提交</button> \
				<button class="print-now">打印</button> \
				<button class="print-set">打印设置</button> \
				<button class="refresh">刷新</button>';
			$(box+' .bill-sub').html(html);
			$(box+' button.submit').click(function(){
				if(!asp.billing.check_bill()) return;
				asp.billing.create_bill(function(bill){
					if(!bill) return;
					$(box+' button.submit').attr('disabled','disabled');
					setTimeout(function(){//延迟提交，为了产品和客户优先提交
						k.dao.addOne(bill,function(err,val){
							if(val) {
								bill_map[k.frame.current_plugin] = bill;
								if(pn==='salebilling'){
									k.aspect.noty.message('新增销售单成功!');
								}
								if(pn==='bringbilling'){
									k.aspect.noty.message('新增采购单成功!');
								}
								$(box+' button.print-now').removeAttr('disabled').focus();
								k.aspect.bill_center.handle(bill,function(){});
							}else k.aspect.noty.message('新增订单失败!');
						});
					}, 200);
				});
			});
			$(box+' button.print-now').click(function(){
				asp.print.prepare(bill_map[k.frame.current_plugin]);
				asp.print.ad();
				asp.print.act();
				$(box+' button.print-now').attr('disabled','disabled');
				$(box+' button.refresh').focus();
			});
			$(box+' button.print-set').click(function(){
				if(!k.aspect.role_check('print-set')){
					k.aspect.noty.message(k.conf.kdb.role_err_msg);
					return ;
				}
				asp.print.prepare(null,'[test]');
				var setting,type,title,tips,notice,color;
				setting = k.cache.setup('setting');
				$.facebox($('#print').html());
				if(pn === 'salebilling'){
					type = 'salebill-print';
					$('#facebox div.title').html('销售单打印设置（点击文字即可修改，先保存，后测试）');
				}else if(pn === 'bringbilling'){
					type = 'bringbill-print';
					$('#facebox div.title').html('采购单打印设置（点击文字即可修改，先保存，后测试）');
				}
				$('#facebox div.footer').html('<select class="print-style" style="padding:7px;margin-right:5px;margin-top:5px;color:#078;font-weight:bold;"><option value="1">打印风格-1</option><option value="2">打印风格-2</option></select><button class="save">保存设置</button><button onclick="kaidanbao.aspect.print.facebox(1);">打印测试</button>');
				
				$('#facebox .print').css('width','200mm');
				$('#facebox .print td,#facebox .print th').css('height','6mm').css('background-color','#fff');
				$('#facebox .print .tit').attr('contenteditable','true');
				$('#facebox .print .tips').attr('contenteditable','true');
				$('#facebox .print .notice').attr('contenteditable','true');
				$('#facebox .print .color').attr('contenteditable','true');
				
				var up={_id:setting._id,tn:'setup',type:'setting'},change;
				up[type]=setting[type]||{};
				
				var ps = up[type].printStyle || '1';
				$('#facebox select.print-style').val(ps);
				
				$('#facebox select.print-style').click(function(){
					var ps = $('#facebox select.print-style').val();
					$('#facebox .style0').attr('hidden','hidden').removeClass('show');
					$('#facebox .style'+ps).removeAttr('hidden').addClass('show');
					
					k.aspect.print.change(ps,'#facebox',box);
				});
				$('#facebox button.save').click(function(){
					title = $('#facebox .print .tit.show').html();
					tips = $('#facebox .print .tips.show').html();
					notice = $('#facebox .print .notice').html();
					color = $('#facebox .print .color.show').html();
					ps = $('#facebox select.print-style').val();
					
					if(up[type].title !== title) {up[type].title = title;change=true;}
					if(up[type].tips !== tips) {up[type].tips = tips;change=true;}
					if(up[type].notice !== notice) {up[type].notice = notice;change=true;}
					if(up[type].color !== color) {up[type].color = color;change=true;}
					if(up[type].printStyle !== ps) {up[type].printStyle = ps;change=true;}
					
					if(change){
						k.dao.updOne(up,function(err,r){
							if(r){ k.aspect.noty.message('打印设置保存成功！'); }
						});
					}
					$.facebox.close();
				});
			});
			$(box+' button.refresh').click(function(){
				$(box+' input.customer').val('');
				$(box+' input.supplier').val('');
				bill_map[k.frame.current_plugin] = null;
				k.aspect.atcp.product_auto();
				asp.billing.clear_table();
				k.aspect.manage.selectAccountRefresh($(box+' select.account'));
				k.aspect.manage.selectRepositoryRefresh($(box+' select.repository'));
				$(box+' td.p_name input').eq(0).removeAttr('hidden');
				$(box+' input.payamount').val('0.00');
				var prefix_map={'salebilling':'XS-','bringbilling':'CG-'};
				$(box+' input.number').val(prefix_map[pn]+k.aspect.manage.get_number());
				$(box+' button.submit').removeAttr('disabled');
				$(box+' button.print-now').attr('disabled','disabled');
				$(box+' select.settlement').val('q');
				
				asp.billing.set_default();
				k.aspect.atcp.set_repository(k.cache.get(parseInt($(box+' select.repository').val()))['t'+k.cache.dates.mt[0]]);
				//以下设置开单样式
				var setting = k.cache.setup('setting'),ps;
				if(pn === 'salebilling'){
					if(setting['salebill-print']) ps = setting['salebill-print'].printStyle;
				}else if(pn === 'bringbilling'){
					if(setting['bringbill-print']) ps = setting['bringbill-print'].printStyle;
				}
				k.aspect.print.change(ps||1,null,box);
			});
			$(box+' select.repository').change(function(){
				k.aspect.atcp.set_repository(k.cache.get(parseInt($(this).val()))['t'+k.cache.dates.mt[0]]);
			});
		},
		check_bill:function(){
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			if(pn==='salebilling'){
				if(!$(box+' input.customer').val().trim()){
					k.aspect.noty.message('客户不能为空!');
					$(box+' input.customer').focus();
					return false;
				}
				if(!$(box+' input.saler').val().trim()){
					k.aspect.noty.message('销售员不能为空!');
					$(box+' input.saler').focus();
					return false;
				}
			}else if(pn==='bringbilling'){
				if(!$(box+' input.supplier').val().trim()){
					k.aspect.noty.message('供应商不能为空!');
					$(box+' input.supplier').focus();
					return false;
				}
				if(!$(box+' input.buyer').val().trim()){
					k.aspect.noty.message('采购员不能为空!');
					$(box+' input.buyer').focus();
					return false;
				}
			}
		    if(!u.is_float($(box+' input.payamount').val().trim())){
		    	k.aspect.noty.message('付款金额必须为数值!');
		    	$(box+' input.payamount').focus();
		    	return false;
		    }
		    if(parseFloat($(box+' input.payamount').val()) !=0 && !$(box+' input.cashier').val().trim()){
		    	k.aspect.noty.message('出纳员不能为空!');
		    	$(box+' input.cashier').focus();
		    	return false
		    }
		    for(var i=0;i<9;i++){
		    	if($(box+' td.p_name input').eq(i).val()){
		    		if(!$(box+' td.amount').eq(i).html()){
		    			k.aspect.noty.message('产品详情无效!');
		    			return false;
		    		}
		    	}else{
		    		if($(box+' td.amount').eq(i).html()){
		    			k.aspect.noty.message('产品详情无效!');
		    			return false;
		    		}else break;
		    	}
			}
			if(i == 0){
				k.aspect.noty.message('产品详情无效!');
				return false;
			}else return true;
		},
		create_bill:function(comp){//仅开单提交时使用
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			var bill={detail:[]},detail;
		    bill.number 	 = $(box+' input.number').val();
		    bill.count       = parseFloat($(box+' td.count-sum').html());
		    bill.amount      = parseFloat($(box+' td.amount-sum').html());
		    bill.settlement  = $(box+' select.settlement').val();
		    bill.repository_id  = parseInt($(box+' select.repository').val());
		    bill.profit = 0;
		    
		    var order   = $(box+' input.order').val().trim(),
		    	cashier = $(box+' input.cashier').val().trim(),
		        buyer,saler,customer,supplier;

//		    bill.order_id      = k.cache.name_cache.clerk[order];
		    bill.payamount     = parseFloat($(box+' input.payamount').val().trim());
		    if(bill.payamount != 0){
		    	bill.account_id  = parseInt($(box+' select.account').val());
		    }else delete bill.payamount;
		    if(pn==='salebilling'){
		    	bill.tn='salebill';
		    	customer = $(box+' input.customer').val().trim();
		    	saler = $(box+' input.saler').val().trim();
		    }else if(pn==='bringbilling'){
		    	bill.tn='bringbill';
		    	supplier = $(box+' input.supplier').val().trim();
		    	buyer = $(box+' input.buyer').val().trim();
		    }
		    var cache_name={};
		    if(order){
		    	if(!cache_name['clerk'+order]) {
		    		cache_name['clerk'+order] = k.cache.name_cache.clerk[order];
		    	}
		    	if(!cache_name['clerk'+order]) {
		    		if(!k.aspect.role_check('add-clerk')){
		    			k.aspect.noty.message('开单员无效：无权新增！')
		    			comp();
		    			return;
		    		}
		    		cache_name['clerk'+order] = k.dao.addOne({tn:'clerk',name:order,name_py:u.pinyin.getSZM(order)},function(err,r){k.aspect.manage.change_fixed_action(r);});
		    	}
		    	bill.order_id = cache_name['clerk'+order];
		    }
		    if(cashier){
		    	if(!cache_name['clerk'+cashier]) {
		    		cache_name['clerk'+cashier] = k.cache.name_cache.clerk[cashier];
		    	}
		    	if(!cache_name['clerk'+cashier]) {
		    		if(!k.aspect.role_check('add-clerk')){
		    			k.aspect.noty.message('出纳员无效：无权新增！')
		    			comp();
		    			return;
		    		}
		    		cache_name['clerk'+cashier] = k.dao.addOne({tn:'clerk',name:cashier,name_py:u.pinyin.getSZM(cashier)},function(err,r){k.aspect.manage.change_fixed_action(r);});
		    	}
		    	bill.cashier_id = cache_name['clerk'+cashier];
		    }
		    if(buyer) {
		    	if(!cache_name['clerk'+buyer]) {
		    		cache_name['clerk'+buyer] = k.cache.name_cache.clerk[buyer];
		    	}
		    	if(!cache_name['clerk'+buyer]) {
		    		if(!k.aspect.role_check('add-clerk')){
		    			k.aspect.noty.message('采购员无效：无权新增！')
		    			comp();
		    			return;
		    		}
		    		cache_name['clerk'+buyer] = k.dao.addOne({tn:'clerk',name:buyer,name_py:u.pinyin.getSZM(buyer)},function(err,r){k.aspect.manage.change_fixed_action(r);});
		    	}
		    	bill.buyer_id = cache_name['clerk'+buyer];
		    }
		    if(saler) {
		    	if(!cache_name['clerk'+saler]) {
		    		cache_name['clerk'+saler] = k.cache.name_cache.clerk[saler];
		    	}
		    	if(!cache_name['clerk'+saler]) {
		    		if(!k.aspect.role_check('add-clerk')){
		    			k.aspect.noty.message('销售员无效：无权新增！')
		    			comp();
		    			return;
		    		}
		    		cache_name['clerk'+saler] = k.dao.addOne({tn:'clerk',name:saler,name_py:u.pinyin.getSZM(saler)},function(err,r){k.aspect.manage.change_fixed_action(r);});
		    	}
		    	bill.saler_id = cache_name['clerk'+saler];
		    }
		    
		    if(customer) {
		    	if(!cache_name['customer'+customer]){
		    		cache_name['customer'+customer] = k.cache.name_cache.customer[customer];
		    	}
		    	if(cache_name['customer'+customer]){
		    		if(!k.aspect.role_check('findall-customer')&&(k.cache.get(cache_name['customer'+customer]).staff_clerk != k.cache.sign.staff.bind_clerk)){
		    			k.aspect.noty.message('客户名称已存在！')
		    			comp();
		    			return;
		    		}
		    		if(k.cache.get(cache_name['customer'+customer]).st==='d'){
		    			k.aspect.noty.message('此客户已删除！')
		    			comp();
		    			return;
		    		}
		    	}else{
		    		if(!k.aspect.role_check('add-customer')){
		    			k.aspect.noty.message('客户无效：无权新增！')
		    			comp();
		    			return;
		    		}
		    		cache_name['customer'+customer] = k.dao.addOne({tn:'customer',name:customer,name_py:u.pinyin.getSZM(customer),staff_clerk:k.cache.sign.staff.bind_clerk},function(err,r){k.aspect.manage.change_fixed_action(r);});
		    	}
		    	bill.customer_id = cache_name['customer'+customer];
		    }
		    if(supplier){
		    	if(!cache_name['supplier'+supplier]){
		    		cache_name['supplier'+supplier] = k.cache.name_cache.supplier[supplier];
		    	}
		    	if(cache_name['supplier'+supplier]){
		    		if(!k.aspect.role_check('findall-supplier')&&(k.cache.get(cache_name['supplier'+supplier]).staff_clerk != k.cache.sign.staff.bind_clerk)){
		    			k.aspect.noty.message('供应商名称已存在！')
		    			comp();
		    			return;
		    		}
		    		if(k.cache.get(cache_name['supplier'+supplier]).st==='d'){
		    			k.aspect.noty.message('此供应商已删除！')
		    			comp();
		    			return;
		    		}
		    	}else{
		    		if(!k.aspect.role_check('add-supplier')){
		    			k.aspect.noty.message('供应商无效：无权新增！')
		    			comp();
		    			return;
		    		}
		    		cache_name['supplier'+supplier] = k.dao.addOne({tn:'supplier',name:supplier,name_py:u.pinyin.getSZM(supplier),staff_clerk:k.cache.sign.staff.bind_clerk},function(err,r){k.aspect.manage.change_fixed_action(r);});
		    	}
		    	bill.supplier_id = cache_name['supplier'+supplier];
		    }
		    var pname,pid,repos = k.cache.get(bill.repository_id)['t'+k.cache.dates.mt[0]],price;
		    for(var i=0;i<9;i++){
		    	detail=[];pname = $(box+' td.p_name input').eq(i).val().trim();
		    	pid = parseInt($(box+' td.p_name input').eq(i).attr('data-id'));

		    	detail[4] = $(box+' td.amount').eq(i).html();
		    	if(detail[4] && pname){
		    		detail[1] = $(box+' td.p_spec').eq(i).html();
		    		detail[2] = parseFloat($(box+' td.count').eq(i).html());
		    		detail[3] = parseFloat($(box+' td.p_price').eq(i).html());
		    		detail[4] = parseFloat(detail[4]);
		    		detail[5] = $(box+' td.remark').eq(i).html();
		    		
		    		if(pn==='salebilling'){
		    			if(pid && repos[pid]  && repos[pid][0]) {
		    				detail[6] = detail[4]-(detail[2]*(repos[pid][1]/ repos[pid][0]));
		    			}else detail[6] = detail[4]*k.conf.kdb.default_profit_rate;
		    			bill.profit += detail[6];
		    		}
		    		
	    			if(pid){
		    			detail[0] = pid;
		    		}else{
		    			if(!k.aspect.role_check('add-product')){
		    				k.aspect.noty.message('产品名称无效：无权新增！')
		    				comp();
		    				return;
		    			}
		    			price = detail[3];
		    			if(pn === 'bringbilling') price = (detail[3]*(1+k.conf.kdb.default_profit_rate)).toFixed(3);
		    			detail[0] = k.dao.addOne({tn:'product',name:pname,number:$(box+' td.number').eq(i).html(),unit:$(box+' td.p_unit').eq(i).html(),spec : detail[1],price: price},function(err,r){k.aspect.manage.change_fixed_action(r);});
		    		}
		    		bill.detail.push(detail);
		    	}
		    }
		    comp(bill);
		},
		clear_table:function(){
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			$(box+' td.p_name input').val('').attr('hidden','hidden').removeAttr('data-id');
			$(box+' td.p_spec').html('');$(box+' td.remark').html('');
        	$(box+' td.count').html('');$(box+' td.p_price').html('');
        	$(box+' td.amount').html('');
        	$(box+' td.number').html('').attr('contenteditable','true');
        	$(box+' td.p_unit').html('').attr('contenteditable','true');

        	$(box+' td.dx').html('合计：');$(box+' td.count-sum').html('0');
        	$(box+' td.amount-sum').html('0.00');
        	
        	$(box+' td.p_name input').eq(0).removeAttr('hidden');
			$(box+' input.pay-remark').val('');
		},
		set_default:function(){
			var pn = k.frame.current_plugin,box = '#layout div.'+pn;
			var setting=k.cache.setup('setting'),def = setting[pn+'-'+si]||{};
	
			$(box+' input.buyer').val(k.cache.get(def.buyer_id||k.cache.sign.staff.bind_clerk).name);
			$(box+' input.saler').val(k.cache.get(def.saler_id||k.cache.sign.staff.bind_clerk).name);
			$(box+' input.cashier').val(k.cache.get(def.cashier_id||k.cache.sign.staff.bind_clerk).name);
			
			$(box+' input.order').val(k.cache.get(k.cache.sign.staff.bind_clerk).name);
			
			if(def.settlement) $(box+' select.settlement').val(def.settlement);
			if(def.account_id) $(box+' select.account').val(def.account_id);
			if(def.repository_id) $(box+' select.repository').val(def.repository_id);
			else if(setting.value&&setting.value.repository_id) $(box+' select.repository').val(setting.value.repository_id);
		},
	}
	var findallbill={};
	k.aspect.bill={
		del:function(id,tn){
			if(k.aspect.role_check('del-'+tn)){
				k.aspect.noty.confirm('<br /><h1>确定删除？</h1><br />(本操作不可恢复)',function(){
					k.dao.del(tn,id,function(err,r){
						k.aspect.noty.message('删除成功！');
						
						if(r) k.aspect.bill_center.handle(r,function(){});
						$.facebox.close();
						k.aspect.noty.confirm_close();
						$('#layout div.'+tn+' div.kc-manage-box button').click();
					});
				});
			}else{
				k.aspect.noty.message(k.conf.kdb.role_err_msg);
			}
		},
		view:function(id,tn){
			k.dao.get(tn,id,function(bill){
				if(!bill) return;
				k.aspect.print.prepare(bill);
				$.facebox($('#print').html());
				$('#facebox .print').css('width','200mm');
				$('#facebox .print td,#facebox .print th').css('height','6mm').css('background-color','#fff');
				
				$('#facebox div.title').html('原始订单');
				$('#facebox div.footer').html('<button onclick="kaidanbao.aspect.print.facebox();">打印</button><button class="del" style="color:#f08;">删除</button>');
				if(bill.st==='d'||bill.ct < k.cache.dates.mts[k.conf.kdb.ms-2]){//两个月前的订单无法删除
					$('#facebox button.del').remove();
				}else{
					$('#facebox button.del').click(function(){
						if(!k.aspect.role_check('del-'+tn)){
							k.aspect.noty.message(k.conf.kdb.role_err_msg);
							return;
						}
						k.aspect.noty.confirm('<br /><h1>确定删除？</h1><br />(本操作不可恢复)',function(){
							k.dao.del(tn,id,function(err,r){
								k.aspect.noty.message('删除成功！');
								
								if(r) k.aspect.bill_center.handle(r,function(){});
								$.facebox.close();
								k.aspect.noty.confirm_close();
								$('#layout div.'+tn+' div.kc-manage-box button').click();
							});
						});
					});
				}
			});
		},
		init:function(show){
			var pn = k.frame.current_plugin,box = '#layout div.'+pn;
			if(k.aspect.role_check('findall-'+pn)){
				findallbill[pn] = 1;
			}
			//根据字段，填充th
//			k.aspect.manage.th_fill($(box+' table.kc-manage-list th.remark'),pn);
			k.aspect.manage.init({search:function(c){
				if(pn==='salebill'){ $(box+' input').attr('placeholder','搜索单号、客户、销售员、产品');}
				else if(pn==='bringbill'){ $(box+' input').attr('placeholder','搜索单号、供应商、采购员、产品');}
				else if(pn==='checkbill'){ $(box+' input').attr('placeholder','搜索单号、盘点员、产品');}
				else if(pn==='allotbill'){ $(box+' input').attr('placeholder','搜索单号、调拨员、产品');}
				else if(pn==='productbill'){ $(box+' input').attr('placeholder','搜索单号、生产员、产品');}
				$(box+' table.kc-manage-list tr.list').remove();
				
				var fi=function(){
					var query = $(box+' input').val().trim();
					var s1 = $(box+' select.s1').val(),s2 = $(box+' select.s2').val();
					var amount=0,n=0,i=0,matchs=0,qs,qs_len;
					if(query) {qs=query.toLowerCase().split(' ');qs_len=qs.length;}
					//排序
					var v1=k.cache.dynamic[pn][s2],v,order_len = v1.length;
					var asc  = $(box +' th.sort.asc').attr('data-sort');
					var desc = $(box +' th.sort.desc').attr('data-sort');
					if(asc){
						v1.sort(function(a,b){
							if(a[asc] && b[asc]) return a[asc] < b[asc]?1:-1;
							else if(b[asc]) return 1;
							else return -1;
						});
					}else if(desc){
						v1.sort(function(a,b){
							if(a[desc] && b[desc]) return a[desc] > b[desc]?1:-1;
							else if(a[desc]) return 1;
							else return -1;
						});
					}
					var rowspan,j,len,nu,cs,er,prods,prod,is_match;
					for(var idx in v1){ 
						v = v1[idx];
						
						if((v.st!=='d' && s1==='del') || (v.st==='d' && s1!=='del')) continue;
						if(s1 ==='tt' && v.amount>0) continue;
						if(pn==='bringbill'&&!findallbill['bringbill']&&v.buyer_id!==k.cache.sign.staff.bind_clerk) continue;
						if(pn==='salebill'&&!findallbill['salebill']&&v.saler_id!==k.cache.sign.staff.bind_clerk) continue;
						
						len = v.detail.length;
						prods = [];
						for(j in v.detail){
							prod   = k.cache.get(v.detail[j][0]);
							if(prod) prods[j] = ((prod.number || '')+' '+prod.name);
							prod   = k.cache.get(v.detail[j][4]);//生产单查询用到
							if(prod) prods[20+parseInt(j)] = ((prod.number || '')+' '+prod.name);
						}
						cs = k.cache.get(v.supplier_id).name||k.cache.get(v.customer_id).name||k.cache.get(v.checker_id).name||k.cache.get(v.alloter_id).name||k.cache.get(v.worker_id).name;
						er = k.cache.get(v.saler_id).name||k.cache.get(v.buyer_id).name||'';
						nu = v.number;
						if(qs){
							matchs=0;
							for(var iq in qs){
								if(!qs[iq]) continue;
								if((nu+' '+cs+' '+er).toLowerCase().indexOf(qs[iq])>=0){
									nu = nu.replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
									cs = cs.replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
									er = er.replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
									matchs++;
								}else{
									is_match=false;
									for(j in prods){
										if(!prods[j]) continue;
										if(prods[j].toLowerCase().indexOf(qs[iq]) >= 0){
											is_match=true;
											prods[j] = prods[j].replace(new RegExp('('+u.escapeRegExChars(qs[iq])+')', 'gi'), '<b>$1<\/b>');
										}
									}
									if(is_match) matchs++;
								}
							}
							if(matchs < qs_len) continue;
						}
						n++;
						amount += v.amount;
						if(n < k.conf.kdb.max_show_lines) {
							if(show) show(v,n,len,nu,cs,prods);
							else{
								rowspan='<td class="num" rowspan="'+len+'">'+n+'</td><td rowspan="'+len+'"><span title="查看" onclick="kaidanbao.aspect.bill.view('+v._id+',\''+pn+'\')">'+nu+'</span></td><td style="text-align:left;white-space:normal;width:8%;" rowspan="'+len+'">'+cs+'</td><td style="text-align:left;" rowspan="'+len+'">'+er+'</td><td rowspan="'+len+'">'+v.amount+'</td><td rowspan="'+len+'">'+(v.payamount || 0);
								for(j in v.detail){
									$(box+' table.kc-manage-list').append(
											'<tr class="list '+(n%2===0?'opp':'')+'">'+rowspan
											+'</td><td style="text-align:left;">'+prods[j]
											+'</td><td>'+(v.detail[j][1] ||'')
											+'</td><td>'+(v.detail[j][2] ||'')
											+'</td><td>'+(v.detail[j][3])+'/'+(k.cache.get(v.detail[j][0]).unit ||'')
											+'</td><td class="remark">'+(v.detail[j][5]||'')
											+'</td></tr>');
									rowspan='';
								}
							}
						}
					}
					$(box+' section.summary-box').html('总计：'+n+' 单，'+amount.toFixed(2)+' 元');
				}
				var s2 = $(box+' select.s2').val();
				var mi = k.cache.dates.m_t_map[s2];
				if(mi>k.conf.kdb.ms && k.cache.sign.session && !k.cache.sys.down_dynamic_months[s2]){
					k.aspect.noty.progress();
					k.syn.down('d',k.cache.dates.mts[mi],k.cache.dates.mts[mi-1],function(err,obj){
						if(obj){
							k.cache.dynamic[pn] = {};
							k.cache.dynamic[pn][s2] = [];
							for(var ii in obj){
								if(obj[ii].tn===pn) k.cache.dynamic[pn][s2].push(obj[ii]);
							}
							fi();
							k.cache.sys.down_dynamic_months[s2] = 1;
							k.dao.put('sys',{id:'down_dynamic_months',value:k.cache.sys.down_dynamic_months});
							k.aspect.noty.close_progress();
						}
						if(err){
							k.aspect.noty.message('网络异常！');
							k.aspect.noty.close_progress();
						}
					});
				}else{
					k.dao.queryDynamicByMonth(pn,s2,function(finish){
						if(finish) {
							fi();
						}
					});
				}
			},select:function(){
				if(pn==='salebill'){
					$(box+' select.s1').append('<option value="dt"><销售单></option><option value="tt"><退货单></option><option value="del"><已删除></option>');
				}else if(pn==='bringbill'){
					$(box+' select.s1').append('<option value="dt"><采购单></option><option value="tt"><退货单></option><option value="del"><已删除></option>');
				}else if(pn==='checkbill'){
					$(box+' select.s1').append('<option value="dt"><盘点单></option><option value="del"><已删除></option>');
				}else if(pn==='allotbill'){
					$(box+' select.s1').append('<option value="dt"><调拨单></option><option value="del"><已删除></option>');
				}else if(pn==='productbill'){
					$(box+' select.s1').append('<option value="dt"><生产单></option><option value="del"><已删除></option>');
				}
				for(var i in k.cache.dates.m_t){
					if(i<=k.cache.sign.month_length && i<24) $(box+' select.s2').append('<option>'+k.cache.dates.m_t[i]+'</option>');
				}
			},create:'noop',classify:'noop'});
		},
	}
})(window.kaidanbao);
