/** http://usejsdoc.org/
 */
(function(k){
	k.conf.db={
		name:'kdb',
	}
	//数据库表定义 setup monthly customer product supplier clerk account repository
	k.conf.table={
		setup:{ _tp : 'f', cn : '设置',cols : {type:'',value:'',}},//默认设置，分类，枚举
		
		product:{ _tp : 'f', cn : '产品',nav:'sale',cols : {number: '编号',name: '名称',spec: '规格',unit: '单位',price: '售价',mold: '类型',classify: '类别',ct:'新建日期',lm:'更新日期'},sort:{'spec':' ','price':' ','number':' ','name':' ','ct':' ','lm':'asc'}},
		customer:{ _tp : 'f',py:true, cn : '客户',nav:'sale',cols : {number: '编号',name:'名称',address:'地址',mold: '类型',classify:'类别',ct:'新建日期',lm:'更新日期'},sort:{'number':' ','ct':' ','lm':'asc'}},
		supplier:{ _tp : 'f',py:true, cn : '供应商',nav:'sale',cols : {number: '编号',name:'名称',address:'地址',mold: '类型',classify:'类别',ct:'新建日期',lm:'更新日期'},sort:{'number':' ','ct':' ','lm':'asc'}},
		clerk:{ _tp : 'f',py:true, cn : '职员',nav:'sale',cols : {number: '工号',name: '姓名',tel: '电话',mold: '类型',classify:'类别',ct:'新建日期',lm:'更新日期'},sort:{'number':' ','ct':' ','lm':'asc'}},
		account:{ _tp : 'f', cn : '账户',nav:'fi',cols : {number: '编号',name: '名称',mold: '类型',classify: '类别',ct:'新建日期',lm:'更新日期'},sort:{'ct':' ','lm':'asc'}},
//		repository:{ _tp : 'f', cn : '仓库',nav:'stock',cols : {number: '编号',name: '名称',mold: '类型',classify: '类别',ct:'新建日期',lm:'更新日期'},sort:{'ct':' ','lm':'asc'}},
		
		salebill:{ _tp : 'd', cn : '销售单',nav:'sale',cols : {ct:'单号',customer_id: '客户',saler_id: '销售员',amount: '金额',payamount:'定金',product:'商品',p_spec:'规格',count:'数量',price:'单价'},sort:{'customer_id':' ','saler_id':' ','amount':' ','payamount':' ','ct':'asc'}},
		bringbill:{ _tp : 'd', cn : '采购单',nav:'sale',cols : {ct:'单号',supplier_id: '供应商',buyer_id: '采购员',amount: '金额',payamount:'首付',product:'商品',p_spec:'规格',count:'数量',price:'单价'},sort:{'supplier_id':' ','buyer_id':' ','amount':' ','payamount':' ','ct':'asc'}},
		allotbill:{ _tp : 'd', cn : '调拨单',nav:'stock',cols : {number:'单号',alloter_id: '调拨员',callout:'调出仓库',callin:'调入仓库',}},
		pplanbill:{ _tp : 'd', cn : '生产单',nav:'stock',cols : {number:'单号',planer_id: '计划员',pmer:'负责人',repository:'仓库',progress:'生产进度'}},
		checkbill:{ _tp : 'd', cn : '盘点单',nav:'stock',cols : {number:'单号',customer_id: '客户',date: '日期',amount: '金额',saler_id: '销售员',cashier_id: '出纳员 ',order_id: '开单员',}},
		moneyflow:{ _tp : 'd', cn : '资金流水',nav:'fi',cols : {number:'流水号',aper:'付款方[账户]',arer:'收款方[账户]',cashier_id: '出纳员',amount: '金额',type:'类型',}},
		//以下为虚拟表
		
		store:{cn:'库存',nav:'stock',cols:{product:'产品',spec:'规格',unit:'单位',t_cost:'平均成本',t_amount:'总金额',t_count:'总库存',}},
		statement:{cn:'客户对账',nav:'fi',cols:{name:'客户',count:'总签单',amount:'总欠款',lm:'更新日期',month:'月份',mcount:'签单数',mamount:'签单金额',mpreamount:'订金'},sort:{'count':' ','amount':' ','lm':'asc'}},
		supplierstatement:{cn:'供应商对账',nav:'fi',cols:{name:'供应商',allcount:'总单数',total:'总欠款',lm:'更新日期',month:'月份',count:'签单数',amount:'签单金额',preamount:'订金'}},
	}
	//预先插入的数据
	k.conf.preinsert={
	    xianjin:{tn:'account',number:'1001',name:'现金'},
	    classify:{tn:'setup',type:'classify','moneyflow':{a0:{v:'销售收入',f:1},b0:{v:'采购支出',f:1},c0:{v:'帐户互转',f:1}}},
	    roll:{tn:'setup',type:'roll',value:1,r0:{name:'总经理',remark:'拥有系统所有权限',f:1}},
	    setting:{tn:'setup',type:'setting'},
	};
	k.conf.frame={"p":[{"en":"home","cn":"开单宝",
		   "sol":[{"en":"start","cn":"起始页",
		       	   "plug":[{"en":"welcome","cn":"欢迎首页"},
		       	           {"en":"usercenter","cn":"用户中心"}]
//		        },{"en":"offical","cn":"办公精选",
//			           "plug":[{"en":"wjyp","cn":"文具用品"}]
//		        },{"en":"service","cn":"服务支持",
//		           "plug":[{"en":"question","cn":"在线问答"},
//		                   {"en":"faq","cn":"帮助手册"}]
		        }]
		},{"en":"sale","cn":"销售",
		   "sol":[{"en":"order","cn":"销售订单",
			       "plug":[{"en":"salebilling","cn":"销售开单"},
			               {"en":"salebill","cn":"销售单查询"},
//			               {"en":"quotation","cn":"客户报价单"}
			               ]
		        },{"en":"baseinfo1","cn":"资料管理",
			       "plug":[{"en":"product","cn":"商品信息"},
				    	   {"en":"clerk","cn":"职员信息"},
			               {"en":"customer","cn":"客户信息"}]
		        }]
			},{"en":"stock","cn":"库存",
		   "sol":[{"en":"stockmanage","cn":"仓储管理",
		       	   "plug":[{"en":"store","cn":"库存查询"},
		       		   	   {"en":"supplier","cn":"供应商信息"}]
//			    },{"en":"baseinfo2","cn":"资料管理",
//			       "plug":[{"en":"repository","cn":"仓库信息"},
//	       		   	   	   {"en":"billconfirm","cn":"出入库确认"}]
			    },{"en":"purchasemanage","cn":"采购管理",
	               "plug":[{"en":"bringbilling","cn":"采购开单"},
	                       {"en":"bringbill","cn":"采购单查询"}]
//	        	},{"en":"stockbill","cn":"仓库变动",
//	        		"plug":[{"en":"checkbilling","cn":"库存盘点"},
//	        		        {"en":"checkbill","cn":"盘点单查询"},
//	        		        {"en":"allotbilling","cn":"调拨开单"},
//	        		        {"en":"allotbill","cn":"调拨单查询"}]
//	        	},{"en":"productmanage","cn":"生产管理",
//	        		"plug":[{"en":"producttpl","cn":"生产模板"},
//	        		        {"en":"productbilling","cn":"生产开单"},
//	        		        {"en":"productbill","cn":"生产单查询"}]
	        	}]
		},{"en":"fi","cn":"财务",
		   "sol":[{"en":"balance","cn":"对账出纳",
		           "plug":[{"en":"statement","cn":"往来对账"},
		                   {"en":"moneyflow","cn":"出纳流水"}]
			    },{"en":"baseinfo3","cn":"资料管理",
			       "plug":[{"en":"account","cn":"账户管理"}]
//		        },{"en":"balancesheet","cn":"财务报表",
//		           "plug":[{"en":"balance3","cn":"利润表"},
//		                   {"en":"balance2","cn":"现金流表"},
//		                   {"en":"balance1","cn":"资产负债表"}]
		        }]
//		},{"en":"chart","cn":"统计",
//		   "sol":[{"en":"bysales","cn":"销售与采购",
//		           "plug":[{"en":"salebyvolume","cn":"总销量"},
//		                   {"en":"salebycustomer","cn":"客户分析"},
//		                   {"en":"salebyproduct","cn":"商品分析"}]
//		       },{"en":"bystock","cn":"库存与生产",
//		           "plug":[{"en":"salebyvolume1","cn":"库存分析"},
//		                   {"en":"salebyproduct1","cn":"采购统计"}]
//		       },{"en":"byfi","cn":"财务与账户",
//		           "plug":[{"en":"salebyvolume2","cn":"资产负债表"},
//		                   {"en":"salebycustomer2","cn":"现金流表"}]
//		       }]
		}],
		"other":{
			right:[{en:'delete',cn:'删除订单',
				'plug':[
					{en:'salebill',cn:'销售单'},
					{en:'bringbill',cn:'采购单'},
				],
			}],
		}}
})(window.kaidanbao);/** http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	//自动完成特殊存储
	var product_auto,auto={},headLen=0,cidCache;
	var pushHead=function(cid){
		var customer=k.cache.get(cid),len=0,v;
		if(!customer || !customer.quotation) return;
		product_auto.reverse(); 
		for(var pid in customer.quotation){
			v = k.cache.fixed[pid];
			if(v){ len++;
				product_auto.push({value:v.name+' ['+(v.number ||'')+' ￥'+customer.quotation[pid][0]+'/'+(v.unit ||'')+']'
					,data:{id:v._id,price:customer.quotation[pid][0],r:'-',spec:customer.quotation[pid][1],c:'blue'}});
			}
		}
		product_auto.reverse(); 
		headLen = len;
	}
	var popHead=function(){
		if(headLen === 0) return;
		product_auto.reverse();
		product_auto.length -= headLen;
		product_auto.reverse();
		headLen=0;
	}
	k.aspect.atcp={
		product_auto:function(pd,cid){
			if(!product_auto){ product_auto=[];
			    var v1=k.cache.fixed_by_table['product'],v;
			    for(var j in v1){ v = k.cache.get(v1[j]);
					if(v){
						product_auto.push({value:v.name+' ['+(v.number ||'')+' ￥'+v.price+'/'+(v.unit ||'')+']'
							,data:{id:v._id,price:v.price,r:'-'}});
					}
				}
			}
			if(cid){
				if(cid !== cidCache){
					popHead();
					pushHead(cid);
				}
			}else{
				if(cid !== 0) popHead();
			}
			if(cid !== 0) cidCache = cid;
			if(pd){
				popHead();
				if(isNaN(pd)){ //pd is id array
					
				}else{ //pd is id number
					var v1 = k.cache.get(pd);
					if(v1){
						product_auto.unshift({value:v1.name+' ['+(v1.number ||'')+' ￥'+v1.price+'/'+(v1.unit ||'')+']'
							,data:{id:v1._id,price:v1.price,r:'-'}});
					}
				}
				pushHead(cidCache);
			}
			return product_auto;
		},
		auto:function(ct,table){
			if(table==='customer' || table==='supplier' || table==='clerk'){
				if(!auto[table]){ auto[table]=[];
					var v1=k.cache.fixed_by_table[table],v;
					for(var j in v1){ v = k.cache.get(v1[j]);
						if(v) auto[table].push({value:v.name+' '+(v.name_py ||''),data:{id:v._id}});
					};
				}
				if(ct){
					if(isNaN(ct)){ //ct is id array
						
					}else{ //ct is id number
						var v1 = k.cache.get(ct);
						if(v1){
							auto[table].unshift({value:(v1.name ||'')+' '+(v1.name_py ||''),data:{id:v1._id}});
						}
					}
				}
				return auto[table];
			}
		},
	}
	k.aspect.auto_insert=function(values,comp){//自动插入客户，供应商，职员
		var v,i,vid,vids={},len = values.length;
		if(len == 0) comp();
		else{
			for(i in values){
				v = values[i];
				vid = k.cache.name_cache[v.tn][v.name];
				if(vid) {
					vids[v.tn+v.name] = vid;
					if(--len ==  0) comp(vids);
				}else if(!vids[v.tn+v.name]){
					vids[v.tn+v.name] = true;
					v.name_py = u.pinyin.getSZM(v.name);
					k.dao.addOne(v,function(err,val){
						if(err){}
						else{
							k.aspect.atcp.auto(val._id,val.tn);
							vids[val.tn+val.name] = val._id;
							if(--len == 0) comp(vids);
							setTimeout(function() {
								$('#layout div.'+val.tn+' div.kc-manage-box button').click();
							}, 1);
						}
					},3);
				}
			}
		}
	}
	k.aspect.auto_insert_p=function(values,comp){//自动插入商品
		var v,i,vids=[],len = values.length;
		for(i in values){
			v = values[i];v.tn = 'product';v.type='b';
			k.dao.addOne(v,function(err,val){
				if(err){}
				else{
					k.aspect.atcp.product_auto(val._id,0);
					vids[val.tmp_td_id] = val._id;
					if(--len ==  0) comp(vids);
					setTimeout(function() {
						$('#layout div.product div.kc-manage-box button').click();
					}, 1);
				}
			},3);
		}
	}
})(window.kaidanbao);
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
			$(box+' input.clerk').autocomplete({
				minChars: 0,
				autoSelectFirst: true,
//				newButton:'<div class="autocomplete-new"><span onclick="kaidanbao.aspect.manage.create(\'clerk\');$(\'.autocomplete-suggestions\').css(\'display\',\'none\');">新增职员</span></div>',
				lookup: k.aspect.atcp.auto(null,'clerk'),
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name).blur();
//					$(this).attr('data-id',s.data.id);
		        },
//		        onSearchComplete:function(q,s){
//		        	$(this).removeAttr('data-id');
//		        },
			});
			$(box+' button.refresh').click();
		},
		bill_top:function(){//构建表单顶部
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn,html;
			if(pn==='salebilling'){
				html = '<div style="width:26%;">客户：<input class="customer" type="search" style="width:75%;" /></div> \
					<div style="width:24%;">销售员：<input class="clerk saler" type="search" /></div> \
					<div style="width:24%;">开单员：<input class="clerk order" type="search" /></div> \
					<div style="width:26%;">单号：<input class="number" readonly="readonly" style="width:75%;" /></div>';
			}else if(pn==='bringbilling'){
				html = '<div style="width:26%;">供应商：<input class="supplier" type="search" style="width:70%;" /></div> \
					<div style="width:24%;">采购员：<input class="clerk buyer" type="search" /></div> \
					<div style="width:24%;">开单员：<input class="clerk order" type="search" /></div> \
					<div style="width:26%;">单号：<input class="number" readonly="readonly" style="width:75%;" /></div>';
			}
			$(box+' .bill-top').html(html);
		},
		bill_table:function(){//构建表格
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn,html;
			html= '<tr> \
				<th style="width:3%;"><svg hidden version="1.1" viewBox="0 -70 1034 1034"><path d="M933.79 349.75c-53.726 93.054-21.416 212.304 72.152 266.488l-100.626 174.292c-28.75-16.854-62.176-26.518-97.846-26.518-107.536 0-194.708 87.746-194.708 195.99h-201.258c0.266-33.41-8.074-67.282-25.958-98.252-53.724-93.056-173.156-124.702-266.862-70.758l-100.624-174.292c28.97-16.472 54.050-40.588 71.886-71.478 53.638-92.908 21.512-211.92-71.708-266.224l100.626-174.292c28.65 16.696 61.916 26.254 97.4 26.254 107.196 0 194.144-87.192 194.7-194.958h201.254c-0.086 33.074 8.272 66.57 25.966 97.218 53.636 92.906 172.776 124.594 266.414 71.012l100.626 174.29c-28.78 16.466-53.692 40.498-71.434 71.228zM512 240.668c-114.508 0-207.336 92.824-207.336 207.334 0 114.508 92.826 207.334 207.336 207.334 114.508 0 207.332-92.826 207.332-207.334-0.002-114.51-92.824-207.334-207.332-207.334z"></path></svg></th> \
				<th style="width:29%;">商品名称</th> \
				<th style="width:8%;">规格</th> \
				<th style="width:6%;">单位</th> \
				<th style="width:9%;">数量</th> \
				<th style="width:9%;">单价 </th> \
				<th style="width:11%;">金额</th> \
				<th>备注</th></tr> \
				<tr><td class="num">1</td><td class="p_name"><input        type="search" data-index="0" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="0" class="count"></td><td data-index="0" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">2</td><td class="p_name"><input hidden type="search" data-index="1" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="1" class="count"></td><td data-index="1" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">3</td><td class="p_name"><input hidden type="search" data-index="2" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="2" class="count"></td><td data-index="2" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">4</td><td class="p_name"><input hidden type="search" data-index="3" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="3" class="count"></td><td data-index="3" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">5</td><td class="p_name"><input hidden type="search" data-index="4" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="4" class="count"></td><td data-index="4" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">6</td><td class="p_name"><input hidden type="search" data-index="5" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="5" class="count"></td><td data-index="5" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">7</td><td class="p_name"><input hidden type="search" data-index="6" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="6" class="count"></td><td data-index="6" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">8</td><td class="p_name"><input hidden type="search" data-index="7" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="7" class="count"></td><td data-index="7" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr><td class="num">9</td><td class="p_name"><input hidden type="search" data-index="8" /></td><td class="p_spec"></td><td class="p_unit"></td><td data-index="8" class="count"></td><td data-index="8" class="p_price"></td><td class="amount"></td><td class="remark"></td></tr> \
				<tr class="foot"><td class="num"></td><td class="dx" colspan="3">合计：</td><td class="count-sum">0</td><td></td><td class="amount-sum">0.00</td><td></td></tr>';
			$(box+' .bill-table').html(html);
			
			$(box+' td').attr('spellcheck','false');
			$(box+' td.p_spec').attr('contenteditable','true');
			$(box+' td.p_unit').attr('contenteditable','true');
			$(box+' td.count').attr('contenteditable','true');
			$(box+' td.p_price').attr('contenteditable','true');
			$(box+' td.remark').attr('contenteditable','true');
			var amt_cal=function(index){
				var count = $(box+' td.count').eq(index).html();
				var price = $(box+' td.p_price').eq(index).html();
				if(u.is_float(count) && u.is_float(price)){
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
			$(box+' td.p_name input').autocomplete({
		    	minChars: 0,
		    	width:'41.2%',
//		    	newButton:'<div class="autocomplete-new"><span onclick="kaidanbao.plugin.product.create();$(\'.autocomplete-suggestions\').css(\'display\',\'none\');">新增商品</span></div>',
		        lookup: k.aspect.atcp.product_auto(),
		        onSelect:function(s){
		        	var index=parseInt($(this).attr('data-index'));
		        	var p = k.cache.get(s.data.id);
		        	$(box+' td.p_name input').eq(index).val(p.name).attr('data-id',s.data.id);
		        	$(box+' td.p_unit').eq(index).html(p.unit).removeAttr('contenteditable');
		        	$(box+' td.p_spec').eq(index).html(s.data.spec?s.data.spec:p.spec);
		        	$(box+' td.p_price').eq(index).html(s.data.price);

		        	$(box+' td.count').eq(index).focus();
		        },
		        onSearchComplete:function(q,s){
		        	var index=parseInt($(this).attr('data-index'));
		        	$(box+' td.p_name input').eq(index).removeAttr('data-id');
		        	$(box+' td.p_unit').eq(index).attr('contenteditable','true');
		        	if(!$(box+' td.p_name input').eq(index).val()){
		        		$(box+' td.p_spec').eq(index).html('');
		        		$(box+' td.p_unit').eq(index).html('');
		        		$(box+' td.count').eq(index).html('');
		        		$(box+' td.p_price').eq(index).html('');
		        		$(box+' td.amount').eq(index).html('');
		        		$(box+' td.remark').eq(index).html('');
		        	}
		        },
		    });
		},
		bill_bottom:function(){//构建表单底部
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			var html= ' \
				结算：<select class="settlement"><option value="q" >签单对账</option><option value="x" >现付全款</option></select> , \
				本次付款：<input class="payamount" value="0.00" /> , \
				账户：<select class="account"></select> , \
				出纳员：<input class="clerk cashier" type="search" /> , \
				摘要：<input class="pay-remark" type="text" />';
			$(box+' .bill-bottom').html(html);
			$(box+' select.settlement').change(function(){
				if($(this).val()==='q') $(box+' input.payamount').val('0.00');
				else $(box+' input.payamount').val($(box+' td.amount-sum').html());
			});
			if(pn==='salebilling'){
				$(box+' input.customer').autocomplete({
					minChars: 0,
					showNoSuggestionNotice: false,
					lookup: k.aspect.atcp.auto(null,'customer'),
					onSelect:function(s){
						$(this).val(k.cache.get(s.data.id).name);
						$(box+' input.customer').blur();
						$(box+' td.p_name input').eq(0).focus();
					},
				});
				$(box+' input.customer').blur(function(){
					k.aspect.atcp.product_auto(null,k.cache.name_cache['customer'][$(this).val().trim()]);
				});
				$(box+' input.customer').keydown(function(e){
					if(e.keyCode === 13 && $(box+' input.customer').val() && !e.ctrlKey){
						$(box+' td.p_name input').eq(0).focus();
					}
				});
			}else if(pn==='bringbilling'){
				$(box+' input.supplier').autocomplete({
					minChars: 0,
					showNoSuggestionNotice: false,
					lookup: k.aspect.atcp.auto(null,'supplier'),
					onSelect:function(s){
						$(this).val(k.cache.get(s.data.id).name);
						$(box+' input.supplier').blur();
						$(box+' td.p_name input').eq(0).focus();
			        },
				});
				$(box+' input.supplier').blur(function(){
					k.aspect.atcp.product_auto(null,k.cache.name_cache['supplier'][$(this).val().trim()]);
				});
				$(box+' input.supplier').keydown(function(e){
					if(e.keyCode === 13  && $(box+' input.supplier').val() && !e.ctrlKey){
						$(box+' td.p_name input').eq(0).focus();
					}
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
					k.dao.addOne(bill,function(err,id){
						if(id) {
							bill_map[k.frame.current_plugin] = bill;
							if(pn==='salebilling'){
								k.aspect.noty.message('新增销售单成功!');
							}
							if(pn==='bringbilling'){
								k.aspect.noty.message('新增采购单成功!');
							}
							$(box+' button.submit').html('成功').attr('disabled','disabled');
							$(box+' button.print-now').removeAttr('disabled').focus();
							setTimeout(function() {
								asp.billing.save_setting(bill,function(){
									asp.billing.save_moneyflow(bill,function(){
										k.syn.upl(function(){
											asp.billing.save_quotation(bill);
										});
									});
								});
							}, 500);
						}else k.aspect.noty.message('新增销售单失败!');
					},3);
				});
			});
			$(box+' button.print-now').click(function(){
				asp.print.prepare(bill_map[k.frame.current_plugin]);
				asp.print.ad();
				if(asp.print.act()) $(box+' button.print-now').attr('disabled','disabled');
				$(box+' button.refresh').focus();
			});
			$(box+' button.print-set').click(function(){
				asp.print.prepare(null,'[test]');
				var pn = k.frame.current_plugin,setting,type,title,tips,notice,color;
				$.facebox($('#print').html());
				if(pn === 'salebilling'){
					type = 'salebill-print';
					setting = k.cache.setup(type);
					$('#facebox div.title').html('<a href="#/sale/salebilling">销售开单</a> > 打印设置（鼠标点击文字即可修改设置）');
				}else if(pn === 'bringbilling'){
					type = 'bringbill-print';
					setting = k.cache.setup(type);
					$('#facebox div.title').html('<a href="#/sale/bringbilling">采购开单</a> > 打印设置（鼠标点击文字即可修改设置）');
				}
				$('#facebox div.footer').html('<button class="save">保存设置</button><button onclick="kaidanbao.aspect.print.facebox(1);">打印样单</button>');
				$('#facebox .print').css('width','203mm');
				$('#facebox .print td,#facebox .print th').css('border','1px solid #000');
//				$('#facebox .print').find('.tit').css('font-size','9mm');
				
				$('#facebox button.save').click(function(){
					title = $('#facebox .print .tit').html();
					tips = $('#facebox .print .tips').html();
					notice = $('#facebox .print .notice').html();
					color = $('#facebox .print .color').html();
					var up={tn:'setup',type:type},change;
					if(setting){
						if(setting.title !== title) {up.title = title;change=true;}
						if(setting.tips !== tips) {up.tips = tips;change=true;}
						if(setting.notice !== notice) {up.notice = notice;change=true;}
						if(setting.color !== color) {up.color = color;change=true;}
						if(change){
							up._id = setting._id;
							k.dao.updOne(up,function(err,r){
								if(r){ k.aspect.noty.message('打印设置保存成功！'); }
							});
						}
					}else{
						up.title = title;
						up.tips = tips;
						up.notice = notice;
						up.color = color;
						k.dao.addOne(up,function(err,id){
							if(id){
								k.aspect.noty.message('打印设置保存成功！');
							}
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
				$(box+' td.p_name input').eq(0).removeAttr('hidden');
				$(box+' input.payamount').val('0.00');
				var prefix_map={'salebilling':'XS-','bringbilling':'CG-'};
				$(box+' input.number').val(prefix_map[pn]+k.aspect.manage.get_number());
				$(box+' button.submit').removeAttr('disabled').html('提交');
				$(box+' button.print-now').removeAttr('disabled');
				$(box+' button.print-now').attr('disabled','disabled');
				$(box+' select.settlement').val('q');
				$(box+' input.pay-remark').val('');
				asp.billing.set_default();
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
		    			k.aspect.noty.message('商品详情无效!');
		    			return false;
		    		}
		    	}else{
		    		if($(box+' td.amount').eq(i).html()){
		    			k.aspect.noty.message('商品详情无效!');
		    			return false;
		    		}else break;
		    	}
			}
			if(i == 0){
				k.aspect.noty.message('商品详情无效!');
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

		    var order   = $(box+' input.order').val().trim(),
		    	cashier = $(box+' input.cashier').val().trim(),
		        buyer,saler,customer,supplier;

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
		    var auto_insert_vals=[];
		    if(order) auto_insert_vals.push({tn:'clerk',name:order});
		    if(cashier) auto_insert_vals.push({tn:'clerk',name:cashier});
		    if(buyer) auto_insert_vals.push({tn:'clerk',name:buyer});
		    if(saler) auto_insert_vals.push({tn:'clerk',name:saler});
		    
		    if(customer) auto_insert_vals.push({tn:'customer',name:customer});
		    if(supplier) auto_insert_vals.push({tn:'supplier',name:supplier});
		    k.aspect.auto_insert(auto_insert_vals,function(ids){
		    	if(ids){
		    		if(ids['clerk'+order]) bill.order_id = ids['clerk'+order];
		    		if(ids['clerk'+cashier]) bill.cashier_id = ids['clerk'+cashier];
		    		if(ids['clerk'+buyer]) bill.buyer_id = ids['clerk'+buyer];
		    		if(ids['clerk'+saler]) bill.saler_id = ids['clerk'+saler];
		    		if(ids['customer'+customer]) bill.customer_id = ids['customer'+customer];
		    		if(ids['supplier'+supplier]) bill.supplier_id = ids['supplier'+supplier];
		    	}
		    	var auto_insert_ps = [],pname;
		    	for(var i=0;i<9;i++){
		    		detail=[];pname = $(box+' td.p_name input').eq(i).val().trim();
		    		detail[4] = $(box+' td.amount').eq(i).html();
		    		if(detail[4] && pname){
		    			detail[0] = parseInt($(box+' td.p_name input').eq(i).attr('data-id'));
		    			detail[1] = $(box+' td.p_spec').eq(i).html();
		    			detail[2] = parseFloat($(box+' td.count').eq(i).html());
		    			detail[3] = parseFloat($(box+' td.p_price').eq(i).html());
		    			detail[4] = parseFloat(detail[4]);
		    			detail[5] = $(box+' td.remark').eq(i).html();
//		    			detail[6] = k.cache.get(detail[0]).type;
		    			bill.detail.push(detail);
		    			if(!detail[0]) {
		    				auto_insert_ps.push(
		    						{name : pname,unit : $(box+' td.p_unit').eq(i).html(),
	    							 spec : detail[1],price: detail[3],tmp_td_id:i });
		    			}
		    		}
		    	}
		    	if(auto_insert_ps.length>0){
		    		 k.aspect.auto_insert_p(auto_insert_ps,function(ids){
		    			 for(var j=0;j<9;j++){
		    				 if(bill.detail[j] && !bill.detail[j][0] && ids[j]){
		    					 bill.detail[j][0] = ids[j];
		    				 }
		    			 }
		    			 comp(bill);
		    		 });
		    	}else comp(bill);
		    });
		},
		save_moneyflow:function(bill,comp){
			var moneyflow={tn:'moneyflow'};
			if(bill.payamount){
				var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
				if(pn==='salebilling'){
					moneyflow.type='xs';
					moneyflow.aper_id=bill.customer_id;
					moneyflow.account_r=bill.account_id;
				}
				if(pn==='bringbilling'){
					moneyflow.type='cg';
					moneyflow.arer_id=bill.supplier_id;
					moneyflow.account_p=bill.account_id;
				}
				moneyflow.number='CN'+bill.number.substring(2);
				moneyflow.flag=(bill.settlement==='x'?'d':'a');
				moneyflow.amount=bill.payamount;
				moneyflow.cashier_id=bill.cashier_id;
				moneyflow.bill_number = bill.number;
				k.dao.addOne(moneyflow,function(err,id){
					comp();
				},3);
			}else comp();
		},
		save_setting:function(bill,comp){//保存设置
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			var setting=k.cache.setup(pn);
			var set_change_id=setting._id,set_change={tn:'setup'},change_count=0;
			
			var buyer = $(box+' input.buyer').val(),buyer_id;
			if(buyer) { buyer_id = k.cache.name_cache['clerk'][buyer.trim()];
				if(setting['buyer'+si]!==buyer_id ){
					change_count++;set_change['buyer'+si]=buyer_id;
				}
			}
			var saler = $(box+' input.saler').val(),saler_id;
			if(saler) { saler_id = k.cache.name_cache['clerk'][saler.trim()];
				if(setting['saler'+si]!==saler_id ){
					change_count++;set_change['saler'+si]=saler_id;
				}
			}
			var order = $(box+' input.order').val().trim(),order_id;
			if(order) { order_id = k.cache.name_cache['clerk'][order];
				if(setting['order'+si]!==order_id ){
					change_count++;set_change['order'+si]=order_id;
				}
			}
			var cashier = $(box+' input.cashier').val().trim(),cashier_id;
			if(cashier) { cashier_id = k.cache.name_cache['clerk'][cashier];
				if(setting['cashier'+si]!==cashier_id ){
					change_count++;set_change['cashier'+si]=cashier_id;
				}
			}
			var account = $(box+' select.account').val();
//			var repository = $(box+' select.repository').val();
			if(setting['account'+si]!== parseInt(account)){change_count++;set_change['account'+si]=parseInt(account);}
//			if(setting['repository'+si]!==parseInt(repository)){change_count++;set_change['repository'+si]=parseInt(repository);}
			
			if(change_count>0){
				if(set_change_id){
					set_change._id=set_change_id;
					k.dao.updOne(set_change,comp,3);
				}else{
					set_change['type']=pn;
					k.dao.addOne(set_change,comp,3);
				}
			}else comp()
		},
		save_quotation:function(bill){
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn,ogi;
			if(pn ==='salebilling') ogi = k.cache.get(bill.customer_id);
			if(pn ==='bringbilling') ogi = k.cache.get(bill.supplier_id);
			var up={_id:ogi._id,tn:ogi.tn};
			
			if(bill.settlement === 'q'){ //保存对账
				up['s'+k.cache.dates.mt[0]] = (ogi['s'+k.cache.dates.mt[0]] || {});
				up['s'+k.cache.dates.mt[0]]['i'+bill._id] = [bill.number,bill.amount,bill.payamount];
			}
			up.quotation=(ogi.quotation || {});  //保存报价单
			for(var j in bill.detail){
				if(bill.detail[j][3] != 0){
					up.quotation['i'+bill.detail[j][0]] = [bill.detail[j][3],bill.detail[j][1]];
				}
			}
			k.dao.updOne(up,null,3);//保存客户变化
		},
		clear_table:function(){
			var pn  = k.frame.current_plugin,box = '#layout div.'+pn;
			$(box+' td.p_name input').val('').attr('hidden','hidden').removeAttr('data-id');
			$(box+' td.p_spec').html('');$(box+' td.remark').html('');
        	$(box+' td.count').html('');$(box+' td.p_price').html('');
        	$(box+' td.amount').html('');$(box+' td.p_unit').html('').attr('contenteditable','true');

        	$(box+' td.dx').html('合计：');$(box+' td.count-sum').html('0');
        	$(box+' td.amount-sum').html('0.00');
        	
        	$(box+' td.p_name input').eq(0).removeAttr('hidden');
			$(box+' input.pay-remark').val('');
		},
		set_default:function(){
			var pn = k.frame.current_plugin,box = '#layout div.'+pn;
			var setting=k.cache.setup(pn);
			if(setting['buyer'+si]) $(box+' input.buyer').val(k.cache.get(setting['buyer'+si]).name);
			if(setting['saler'+si]) $(box+' input.saler').val(k.cache.get(setting['saler'+si]).name);
			if(setting['order'+si]) $(box+' input.order').val(k.cache.get(setting['order'+si]).name);
			if(setting['cashier'+si]) $(box+' input.cashier').val(k.cache.get(setting['cashier'+si]).name);
			if(setting['account'+si]) $(box+' select.account').val(setting['account'+si]);
//			if(setting['repository'+si]) $(box+' select.repository').val(setting['repository'+si]);
		},
	}
	k.aspect.bill={
		view:function(id,tn){
			k.dao.get(tn,id,function(bill){
				if(!bill) return;
				k.aspect.print.prepare(bill);
				$.facebox($('#print').html());
				$('#facebox div.title').html('查看订单详情');
				$('#facebox .print').css('width','203mm');
				$('#facebox .print td,#facebox .print th').css('border','1px solid #000');
				$('#facebox .print th').css('background-color','#fff');
				
				$('#facebox div.footer').html('<button onclick="kaidanbao.aspect.print.facebox();">打印</button><button class="del" style="color:#f08;">删除</button>');
				$('#facebox button.del').click(function(){
					k.aspect.noty.confirm('<br /><h1>确定删除订单？</h1>',function(){
						k.dao.del(tn,id,function(){
							k.aspect.noty.message('删除成功！');
							var ogi = k.cache.get(bill.customer_id || bill.supplier_id),up={_id:ogi._id,tn:ogi.tn};
							var date = bill.number.split('-')[2],sd='s'+date.substr(2,4);
							if(bill.settlement === 'q' && ogi[sd] !== 'x'){ //保存对账
								up[sd] = ogi[sd];
								up[sd]['i'+bill._id][3] = 'x';
								
								k.dao.updOne(up,null,1);//仅缓存客户变化
							}
							$.facebox.close();
							k.aspect.noty.confirm_close();
							$('#layout div.'+tn+' div.kc-manage-box button').click();
						});
					});
				});
			});
		},
		init:function(){
			var pn = k.frame.current_plugin,box = '#layout div.'+pn;
			//根据字段，填充th
//			k.aspect.manage.th_fill($(box+' table.kc-manage-list th.remark'),pn);
			k.aspect.manage.init({search:function(c){
				if(pn==='salebill'){ $(box+' input').attr('placeholder','搜索单号、客户、销售员、商品');}
				else if(pn==='bringbill'){ $(box+' input').attr('placeholder','搜索单号、供应商、采购员、商品');}
				var query = $(box+' input').val().trim(),qs,qs_len,matchs=0;
				if(query) {qs=query.toLowerCase().split(' ');qs_len=qs.length;}
				$(box+' table.kc-manage-list tr.list').remove();
				var amount=0,n=0,i=0;
				var s1 = $(box+' select.s1').val(),s2 = $(box+' select.s2').val();
				k.dao.queryDynamicByMonth(pn,s2,function(finish){
					if(finish) {
						//排序
						var v1=k.cache.dynamic[pn][s2],v;
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
						var rowspan,j,len;
						for(var idx in v1){ v = u.extend({},v1[idx]);
							v.product=[];len=0;
							if((v.st!=='d' && s1==='del') || (v.st==='d' && s1!=='del')) continue;
							for(j in v.detail){
								if(s1!=='tt' || v.detail[j][4] < 0) {
									v.product[j] = (k.cache.get(v.detail[j][0]).number || '')+' '+k.cache.get(v.detail[j][0]).name;
									len++;
								}
							}
							if(len > 0){
								v.supplier=k.cache.get(v.supplier_id).name;
								v.customer=k.cache.get(v.customer_id).name;
								v.saler=(k.cache.get(v.saler_id).name ||'');
								v.buyer=(k.cache.get(v.buyer_id).name ||'');
								if(qs){
									matchs=0;
									for(var iq in qs){
										if(v.number.toLowerCase().indexOf(qs[iq])>=0){
											v.number = v.number.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
											matchs++;
										}
										if(pn==='salebill'){
											if(v.customer.toLowerCase().indexOf(qs[iq])>=0){
												v.customer = v.customer.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;
											}
											if(v.saler.toLowerCase().indexOf(qs[iq])>=0){
												v.saler = v.saler.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;
											}
										}else if(pn==='bringbill'){
											if(v.supplier.toLowerCase().indexOf(qs[iq])>=0){
												v.supplier = v.supplier.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;
											}
											if(v.buyer.toLowerCase().indexOf(qs[iq])>=0){
												v.buyer = v.buyer.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;
											}
										}
										for(j in v.detail){
											if(v.product[j].toLowerCase().indexOf(qs[iq])>=0){
												v.product[j] = v.product[j].replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
												matchs++;break;
											}
										}
									}
									if(matchs < qs_len) continue;
								}
								if(pn==='salebill'){
									rowspan='</td><td rowspan="'+len+'"><span title="查看" onclick="kaidanbao.aspect.bill.view('+v._id+',\''+pn+'\')">'+v.number+'</span></td><td style="text-align:left;white-space:normal;width:8%;" rowspan="'+len+'">'+v.customer+'</td><td style="text-align:left;" rowspan="'+len+'">'+v.saler+'</td><td rowspan="'+len+'">'+v.amount+'</td><td rowspan="'+len+'">'+(v.payamount || 0);
								}else if(pn==='bringbill'){
									rowspan='</td><td rowspan="'+len+'"><span title="查看" onclick="kaidanbao.aspect.bill.view('+v._id+',\''+pn+'\')">'+v.number+'</span></td><td style="text-align:left;white-space:normal;width:8%;" rowspan="'+len+'">'+v.supplier+'</td><td style="text-align:left;" rowspan="'+len+'">'+v.buyer+'</td><td rowspan="'+len+'">'+v.amount+'</td><td rowspan="'+len+'">'+(v.payamount || 0);
								}
								n++;
								for(j in v.detail){
									if(v.product[j]){
										amount += v.detail[j][4];
										$(box+' table.kc-manage-list').append(
												'<tr class="list '+(n%2===0?'opp':'')+'"><td class="num">'+(++i)+rowspan
												+'</td><td style="text-align:left;">'+v.product[j]
												+'</td><td>'+(v.detail[j][1] ||'')
												+'</td><td>'+(v.detail[j][2] ||'')
												+'</td><td>'+(v.detail[j][3] ||'')+'/'+(k.cache.get(v.detail[j][0]).unit ||'')
												+'</td><td class="remark">'+(v.detail[j][5] ||'')
												+'</td></tr>');
										rowspan='';
									}
								}
							}
						}
						$(box+' section.summary-box').html('总计：'+i+' 条，'+amount.toFixed(2)+' 元');
					}
				});
//				}
			},select:function(){
				if(pn==='salebill'){
					$(box+' select.s1').append('<option value="dt"><销售单></option>');
				}else if(pn==='bringbill'){
					$(box+' select.s1').append('<option value="dt"><采购单></option>');
				}
				$(box+' select.s1').append('<option value="tt"><退货单></option><option value="del"><已删除></option>');
				for(var i in k.cache.dates.m_t){
					if(i<=k.cache.sign.month_length) $(box+' select.s2').append('<option>'+k.cache.dates.m_t[i]+'</option>');
				}
			},create:'noop',classify:'noop'});
		},
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	/** 客户表增删改查组件 */
	k.aspect.manage={
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
			target.html('');
			if(mod==='a'){ target.append('<option value="a"><所有账户></option>'); }
			var i,a,cache_map={};
			for(i in k.cache.fixed_by_table['account']){
				if(!cache_map['i'+k.cache.fixed_by_table['account'][i]]){
					cache_map['i'+k.cache.fixed_by_table['account'][i]]=1;
					a = k.cache.get(k.cache.fixed_by_table['account'][i]);
					target.append('<option value="'+a._id+'">'+a.name+'</option>');
				}
			}
		},
		selectClassifyRefresh:function(target,tn,mod){
			target.html('');
			var clazz = k.cache.setup(tn+'_classify').value,map={a:'类型',b:'类别'};
			if(mod[1]==='a') target.append('<option value="a"><所有'+map[mod[0]]+'></option>');
			if(mod[2]==='n') target.append('<option value="n"><无'+map[mod[0]]+'></option>');
			if(clazz){
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
			
			var v1=k.cache.fixed_page[c.table],v,map={};
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
			var classify=k.cache.setup(c.table+'_classify') || {value:''};
			for(var j in v1){ v = u.extend({},k.cache.get(v1[j]));
				if(map['i'+v1[j]]){continue;}   //由于每次添加编辑会unshift，避免重复
				else{map['i'+v1[j]]=1}

				if(s1==='n' && v.mold && classify.value[v.mold] && classify.value[v.mold].v) continue;
				if(s1 !=='n' && s1 !=='a' && v.mold !== s1) continue;
				if(s2==='n' && v.classify && classify.value[v.classify] && classify.value[v.classify].v) continue;
				if(s2!=='n' && s2 !=='a' && v.classify !== s2) continue;
				
				v.number = v.number || '';
				if(qs){
					matchs=0;
					for(var iq in qs){
						if(v.number && v.number.toLowerCase().indexOf(qs[iq])>=0){
							v.number = v.number.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
							matchs++;
						}
						if(v.name.toLowerCase().indexOf(qs[iq])>=0){
							v.name = v.name.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
							matchs++;
						}
					}
					if(matchs < qs_len) continue;
				}
				if(c.count) c.count(v);
				if(v.mold && classify.value[v.mold] && classify.value[v.mold].v) v.mold = classify.value[v.mold].v;
				else v.mold='<无类型>';
				if(v.classify && classify.value[v.classify] && classify.value[v.classify].v) v.classify = classify.value[v.classify].v;
				else v.classify='<无类别>';
				v.ct = u.date.getTimeFormat(v.ct,'d');
				v.lm = u.date.getTimeFormat(v.lm,'d');
				var tds  = '';
				for(var col in k.conf.table[c.table]['cols']){
					if(col === 'name') tds += ('<td style="text-align:left;"><span title="查看" onclick="kaidanbao.aspect.manage.modify('+v._id+')">'+v.name+'</span></td>');
					else tds += ('<td>'+(v[col] ||'')+'</td>');
				}
				$(c.box+' table.kc-manage-list').append('<tr class="list '+(i%2===0?'opp':'')+'"><td class="num">'+(i++)+'</td>'+tds+'<td class="remark">'+
						(v.remark ||'')+'</td></tr>');
			}
			if(c.notice) c.notice();
		},
		insert:function(table){
			var value={tn:table},key,val;
			for(key in k.conf.table[table]['cols']){
				if(k.conf.table[table]['cols'][key]) {
					if(key == 'classify' || key === 'mold'){
						val = $('#facebox select.'+key).val();
						if(val !== 'n') value[key] = val;
					}else if(key!='ct' && key!='lm'){
						val = $('#facebox input.'+key).val().trim();
						if(val) value[key] = val;
					}
				} 
			}
			if(value['name']){
				if(k.cache.name_cache[table][value['name']]){
					k.aspect.noty.message(k.conf.table[table]['cn']+'名称不能重复!');
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
					k.aspect.atcp.auto(val._id,table);
					setTimeout(function() {
						$('#layout div.'+table+' div.kc-manage-box button').click();
					}, 1);
				}
			});
			
		},
		modify:function(id){
			var pn = k.frame.current_plugin,key;
			var box = '#layout div.'+pn,value=k.cache.get(id);
			var html='',key,name;
			for(key in k.conf.table[pn]['cols']){
				if(name = k.conf.table[pn]['cols'][key]) {
					if(key==='mold' || key==='classify' || key==='ct' || key==='lm') continue;
					if(k.conf.table[pn].py && key=='name'){//拼音
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
						<input style="width:150px;" class="name" value="'+value.name+'" /><input value="'+(value.name_py || '')+'" class="pinyin" style="width:85px;margin-left:3px;" placeholder="简拼" /></div>';
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
					<textarea class="remark" maxlength="120">'+(value.remark ||'')+'</textarea></div> \
					<div class="fb-input-wrapper"> \
					<label>&nbsp;</label> \
					<button onclick="kaidanbao.aspect.manage.update('+value._id+')">修改</button> \
			</div>');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.mold'),pn,'a0n');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.classify'),pn,'b0n');
			var classify=k.cache.setup(pn+'_classify') || {value:''};
			if(value.mold && classify.value[value.mold] && classify.value[value.mold].v) $('#facebox select.mold').val(value.mold);
			else $('#facebox select.mold').val('n');
			if(value.classify && classify.value[value.classify] && classify.value[value.classify].v) $('#facebox select.classify').val(value.classify);
			else $('#facebox select.classify').val('n');
			$('#facebox div.title').html('修改'+k.conf.table[pn]['cn']+'信息');
			if(k.conf.table[pn].py){
				$('#facebox input.name').change(function(){
					$('#facebox input.pinyin').val(u.pinyin.getSZM($(this).val()));
				});
			}
		},
		update:function(id){
			var old=k.cache.get(id);
			var table=k.frame.current_plugin,val;
			var value={_id:id,tn:table},key,old_name=old.name;
			for(key in k.conf.table[table]['cols']){
				if(k.conf.table[table]['cols'][key]) {
					if(key == 'mold' || key == 'classify'){
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
			if(value['name']){
				if(k.cache.name_cache[table][value['name']] && k.cache.name_cache[table][value['name']] !== id){
					k.aspect.noty.message(k.conf.table[table]['cn']+'名称不能重复!');
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
					k.aspect.atcp.auto(val._id,table);
					setTimeout(function() {
						$('#layout div.'+table+' div.kc-manage-box button').click();
					}, 1);
				}
			});
		},
		create:function(table){
			var html='',key,name;
			for(key in k.conf.table[table]['cols']){
				if(name = k.conf.table[table]['cols'][key]) {
					if(key==='mold' || key==='classify' || key==='ct' || key==='lm') continue;
					if(k.conf.table[table].py && key=='name'){//拼音
						html += '<div class="fb-input-wrapper"><label>'+name+'：</label> \
						<input style="width:150px;" class="name" /><input class="pinyin" style="width:85px;margin-left:3px;" placeholder="简拼" /></div>';
					}else{
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
					<textarea class="remark" maxlength="120"></textarea></div> \
					<div class="fb-input-wrapper"> \
					<label>&nbsp;</label> \
					<button onclick="kaidanbao.aspect.manage.insert(\''+table+'\')">提交</button> \
			</div>');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.mold'),table,'a0n');
			k.aspect.manage.selectClassifyRefresh($('#facebox select.classify'),table,'b0n');
			$('#facebox div.title').html('<a href="#/'+k.conf.table[table]['nav']+'/'+table+'">'+k.conf.table[table]['cn']+'管理</a> > 新增'+k.conf.table[table]['cn']+'信息');
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
						var key,clazz = k.cache.setup(conf.table+'_classify');
						$.facebox('<div class="classify"> \
							<fieldset> \
				              <legend>类型</legend> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							</fieldset> \
							<fieldset style="margin-left:10px;"> \
				              <legend>类别</legend> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							  <input /><input /><input /><input /> \
							</fieldset></div>');
						$('#facebox div.title').html(k.conf.table[conf.table]['cn']+'分类管理');
						$('#facebox div.footer').html('<button class="ensure">保存分类</button>');
						if(clazz){
							for(key in clazz.value){
								$('#facebox div.classify fieldset:eq('+(key[0]=='a'?0:1)+') input').eq(key.substring(1)).val(clazz.value[key].v).attr('placeholder',clazz.value[key].old||'');
							}
						}
						$('#facebox div.footer .ensure').click(function(){
							var c1 = $('#facebox div.classify fieldset:eq(0) input');
							var c2 = $('#facebox div.classify fieldset:eq(1) input');
							var classify=clazz.value || {};
							for(var i =0;i<12;i++){
								if(!classify['a'+i]) classify['a'+i]={};
								classify['a'+i].v=c1.eq(i).val();
								if(c1.eq(i).val()) classify['a'+i].old=c1.eq(i).val();
								
								if(!classify['b'+i]) classify['b'+i]={};
								classify['b'+i].v=c2.eq(i).val();
								if(c2.eq(i).val()) classify['b'+i].old=c2.eq(i).val();
							}
							if(clazz){
								k.dao.updOne({tn:'setup',_id:clazz._id,value:classify});								
							}else{
								k.dao.addOne({type:conf.table+'_classify',tn:'setup',value:classify});
							}
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
		box:box,table:conf.table,notice:conf.notice,count:conf.count,modify_name:conf.modify_name
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
				u.file.tableToExcel('<table>'+$(box+' table.kc-manage-list').html()+'</table>',
						$('div.lay-left:not([hidden]) li.selected a').html()+'-'+$(box+' div.kc-manage-box select.s1 option:selected').html().replace('&lt;','[').replace('&gt;',']')+'-'+$(box+' div.kc-manage-box select.s2 option:selected').html().replace('&lt;','[').replace('&gt;',']')+(s_input.val()?('-'+s_input.val()):''));
			});
		},
	}
})(window.kaidanbao);
/** http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var clodop;
	var ad=function(){
		$('#print td.color').html($('#print td.color').html()+'（开单宝：www.kaidan.me）');
	}
	var print=function(select){
		if(!clodop){
			//初始化C-LODOP
			if(window.getCLodop && typeof window.getCLodop == 'function'){ 
//					if(window.location.host === 'kaidanbao.cn'){//kaidanbao.cn
//						clodop = window.getCLodop();
//						clodop.SET_LICENSES("","74A38B4E525F7B4F72F7AAC816C77A87","C94CEE276DB2187AE6B65D56B3FC2848","");
//					}else if(window.location.host === 'kaidan.me'){//kaidan.me
				clodop = window.getCLodop();
				clodop.SET_LICENSES("","BFEED6994BBE99CEEC3AEFCA727BD890","C94CEE276DB2187AE6B65D56B3FC2848","");
//					}
			}
		}
		if(clodop){
			clodop.PRINT_INIT("kdb2_print");
			clodop.SET_PRINT_PAGESIZE (1,2100,1400,"");
			clodop.ADD_PRINT_HTM('1mm','1mm','100%','100%',document.getElementById("print").innerHTML);
			if(select) clodop.PRINTA();
			else clodop.PRINT();
			return true;
		}
	}
	var prepare=function(bill,msg){//打印之前执行
		if(bill && bill.payamount) msg = '定金：'+bill.payamount+' 元';
		var pn  = (bill||{}).tn || k.frame.current_plugin,box = '#layout div.'+pn;
		var setting,
		title = '开单宝有限公司销售单',
//		tips = '唯一官网：kaidanbao.cn，唯一淘宝店：kaidan.taobao.com，微信：kaidanbao-cn，QQ：445324773',
		tips = '主营：T5/T8日光灯外壳配件及支架、铝基板、成品。地址：古镇曹一乐昌西路18号。QQ：12345678901234567<br />电话：0760-23661072，18898484018。古镇农行账户：6228480108990910078 王伟',
		notice = '注：以上货物当面点清，签字即视为结算凭证；对质量有意见请在7天内提出书面异议，过期视为默认。',
		color = '（白单存根，红单客户，蓝单回单，黄单结款）';
		if(bill) {
			setting=k.cache.setup(bill.tn+'-print');
		}else{
			if(pn === 'salebilling') setting=k.cache.setup('salebill-print');
			else if(pn === 'bringbilling') setting=k.cache.setup('bringbill-print');
		}
		if(setting){
			title = setting.title;
			tips = setting.tips;
			notice = setting.notice;
			color = setting.color;
		}
		var i=0,page='<div class="tit" contenteditable="true">'+title+'</div> \
		<div style="text-align:left;" class="tips" spellcheck="false" contenteditable="true">'+tips+'</div> \
		<table><tr><td colspan="7" class="top">';
		if(pn==='salebilling' || pn==='salebill'){
			page+='<div>客户：'+(bill?(k.cache.get(bill.customer_id).name):$(box+' input.customer').val())+'</div> \
			<div>销售员：'+(bill?(k.cache.get(bill.saler_id).name || ''):$(box+' input.saler').val())+'</div>';
		}
		if(pn==='bringbilling' || pn==='bringbill'){
			page+='<div>供应商：'+(bill?k.cache.get(bill.supplier_id).name:$(box+' input.supplier').val())+'</div> \
			<div>采购员：'+(bill?(k.cache.get(bill.buyer_id).name || ''):$(box+' input.buyer').val())+'</div>';
		}
		page+='<div>单号：'+(bill?bill.number:$(box+' input.number').val())+'</div><tr><th>商品名称</th><th>规格</th><th>单位</th><th>数量</th><th>售价</th><th>金额</th><th>备注</th></tr>';
		for(i=0;i<9;i++){
			if(!bill || (bill && bill.detail[i])){
//				<td class="num">'+(i+1)+ '</td> \
				page+='<tr> \
					<td class="name">'+(bill?(k.cache.get(bill.detail[i][0]).name || k.cache.get(bill.detail[i][0]).number):$(box+' td.p_name input').eq(i).val())+'</td> \
					<td class="spec">'+(bill?bill.detail[i][1]:$(box+' td.p_spec').eq(i).html())+'</td> \
					<td class="unit">'+(bill?(k.cache.get(bill.detail[i][0]).unit || ''):$(box+' td.p_unit').eq(i).html())+'</td> \
					<td class="count">'+(bill?bill.detail[i][2]:$(box+' td.count').eq(i).html())+'</td> \
					<td class="price">'+(bill?bill.detail[i][3]:$(box+' td.p_price').eq(i).html())+'</td> \
					<td class="amount">'+(bill?bill.detail[i][4]:$(box+' td.amount').eq(i).html())+'</td> \
					<td class="remark">'+(bill?bill.detail[i][5]:$(box+' td.remark').eq(i).html())+'</td></tr>';
			}else{
				page+='<tr><td class="name"></td><td class="spec"></td> \
					<td class="unit"></td><td class="count"></td><td class="price"></td> \
					<td class="amount"></td><td class="remark"></td></tr>';
			}
		}
		page+='<tr><td colspan="3" class="dx">'+(bill?('合计：'+u.DX(bill.amount)):$(box+' td.dx').html())+'</td> \
		<td class="count-sum">'+(bill?bill.count:$(box+' td.count-sum').html())+ '</td> \
		<td></td><td class="amount-sum">'+(bill?bill.amount:$(box+' td.amount-sum').html())+'</td><td class="remark">'+(msg || '')+'</td></tr> \
		<tr><td colspan="7" class="notice" contenteditable="true">'+notice+'</td></tr> \
		<tr><td colspan="7" class="color" contenteditable="true">'+color+'</td></tr></table> \
		<div style="text-align:left;" class="man"> \
		<div>开单员：'+(bill?(k.cache.get(bill.order_id).name || ''):$(box+' input.order').val())+'</div> \
		<div>出纳员：'+(bill?(k.cache.get(bill.cashier_id).name || ''):$(box+' input.cashier').val())+'</div> \
		<div>送货经手人：</div> \
		<div>收货经手人：</div> \
		</div>';
		$('#print div.print').html(page);
		//设置打印页面css
		var boxWidth='202mm',fs = '4mm';
		$('#print td,#print th').css('height','6mm').css('text-align','center').css('border','1px solid #000').css('padding','0.3mm 1mm');
		$('#print th').css('font-weight','normal');
		$('#print table').css('width',boxWidth).css('border-collapse','collapse');
		$('#print td.top div').css('width','33%').css('float','left');
		$('#print td.top,#print td.color,#print td.notice').css('text-align','left');
		
		$('#print .print').find('*').css('font-size',fs).css('font-family','宋体').css('line-height','1');
		$('#print td.name').css('width','60mm').css('text-align','left');
		$('#print td.spec').css('width','15mm');
		$('#print td.unit').css('width','10mm');
		$('#print td.count').css('width','15mm');
		$('#print td.price').css('width','15mm');
		$('#print td.amount').css('width','20mm');
		$('#print td.remark').css('width','60mm').css('text-align','left');
		$('#print td.dx').css('text-align','left');
		
		$('#print .print > div').css('width',boxWidth).css('float','left');
		$('#print div.tit').css('margin-bottom','2mm').css('font-size','8mm').css('text-align','center').css('letter-spacing','1mm').css('font-family','Microsoft Yahei').css('font-weight','bold');
		$('#print div.tips').css('margin-bottom','2mm');
		$('#print div.man').css('margin-top','2mm');
		$('#print div.man div').css('width','23%').css('float','left');
	}
	k.aspect.print={ad:ad,prepare:prepare,act:print,
		facebox:function(select){
			$.facebox.close();
			setTimeout(function() {
				ad();print(select);
			}, 600);
		},
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
})(window.kaidanbao);
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
			var customer=k.cache.get(id),bill,i=0,total=0,count,amount,sd,sds=[],month='a',type='s',number;
			var table_list=function(){
				i=0;total=0;
				var table = '<tr><th class="chk" title="全选"><input data-bid="bid" type="checkbox" id="checkbox_a" hidden '+(type==='s'?'':'disabled="disabled"')+' class="chk_1 first" /><label for="checkbox_a"></label></th><th>订单号</th><th>总额</th><th>已付</th><th>状态</th></tr>';
				for(j in k.cache.dates.mt){
					sd = 's'+k.cache.dates.mt[j];
					if(month==='a' || month===sd){
						if(customer[sd] && customer[sd]!=='x'){
							for(var bid in customer[sd]){
								bill = customer[sd][bid];
								if(bill[3]!=='x'){
									table += ('<tr'+(i%2?' class="opp"':'')+'><td class="chk"><input data-bid="'+bid+'" type="checkbox" id="checkbox_a'+(++i)+'" hidden class="chk_1 list" /><label for="checkbox_a'+i+'"></label></td><td><span onclick="kaidanbao.plugin.statement.view_bill(null,'+bid.substring(1)+')">'+
											bill[0]+'</span></td><td>'+bill[1]+'</td><td>'+
											(bill[2]||0)+'</td><td>未结清</td></tr>');
									if(bill[3]!=='d') total +=bill[1];
									if(bill[2]) total -= bill[2];
								}
							}
							sds.push(sd);
						}
					}
				}
				return table;
			}
			$.facebox('<table class="list">'+table_list()+'</table><table class="fix"> \
					<tr><td>选择订单：</td><td class="count">0 / '+i+'</td><td>收款金额：</td><td><input class="amount" placeholder="'+total.toFixed(2)+'" /></td><td>出纳员：</td><td><input class="cashier" type="search" /></td></tr> \
					<tr><td>收款账户：</td><td><select class="account"></select></td><td>对账月份：</td><td><select class="month"><option value="a">所有月份</option></select></td> \
					<td>操作类型：</td><td><select class="type"><option value="s">选择结清</option><option value="z">追加定金</option></select></td></tr><table>');
			$('#facebox div.title').html('客户对账单：<span style="color:#078;">'+customer.name+' ￥'+total.toFixed(2)+'</span>');
			$('#facebox div.footer').html('<button class="ensure">确认收款</button>');
			$('#facebox div.footer .ensure').click(function(){
				var payamount=$('#facebox input.amount').val().trim();
				if(!u.is_float(payamount)){
					k.aspect.noty.message('收款金额格式错误！');
					return;
				}
				payamount = parseFloat(payamount);
				if(payamount==0) {
					k.aspect.noty.message('收款金额不能为零！');
					return;
				}
				if(!$('#facebox input.cashier').attr('data-id')){
					k.aspect.noty.message('出纳员不能为空！');
					return;
				}
				//先遍历已选择的订单
				var checked_bill={},month=$('#facebox select.month').val();
				$('#facebox input.list').each(function(i){
					if($('#facebox input.list').eq(i).prop('checked')) {
						checked_bill[$('#facebox input.list').eq(i).attr('data-bid')]=1;
					}
				});
				if($('#facebox td.count').html()[0] =='0'){
					k.aspect.noty.message('未选择任何订单！');
					return;
				}
				var up={tn:customer.tn,_id:customer._id},upsd={};
				for(var i=0;i<24;i++){ //对账不超过24个月
					sd='s'+k.cache.dates.mt[24-i-1];upsd[sd]={};
					if(customer[sd] && customer[sd]!=='x'){
						if(month==='a' || month ===sd){
							if(type === 's'){
								upsd[sd]['nonechecked']=true;
								upsd[sd]['allchecked']=true;
								for(var bid in customer[sd]){
									if(checked_bill[bid]) {
										if(upsd[sd]['nonechecked']) up[sd] = customer[sd];
										upsd[sd]['nonechecked']=false;
										up[sd][bid][3]='x';
									}else{
										if(customer[sd][bid][3]!=='x') upsd[sd]['allchecked']=false;
									}
								}
								if(upsd[sd]['allchecked'] && (i < 23)) {
									up[sd]='x';
								}
							}else{
								for(var bid in customer[sd]){
									if(checked_bill[bid]) {
										up[sd]         = customer[sd];
										up[sd][bid][2] = up[sd][bid][2] || 0;
										up[sd][bid][2]+= parseFloat($('#facebox input.amount').val().trim());
										number = up[sd][bid][0];
										break;
									}
								}
							}
						}
					}
				}
				k.dao.updOne(up,function(err,r){
					if(r){
						k.aspect.noty.message('收款成功！');
						$.facebox.close();
						$('#layout div.statement div.kc-manage-box button').click();
						var moneyflow={tn:'moneyflow'};
						moneyflow.amount     = payamount;
						moneyflow.cashier_id = parseInt($('#facebox input.cashier').attr('data-id'));
						if(customer.tn==='customer'){
							moneyflow.account_r  = parseInt($('#facebox select.account').val());
							moneyflow.type='xs';
							moneyflow.aper_id=customer._id;
						}else{
							moneyflow.account_p  = parseInt($('#facebox select.account').val());
							moneyflow.type='cg';
							moneyflow.arer_id=customer._id;
						}
						moneyflow.number='CN-'+k.aspect.manage.get_number();
						if(type==='z') {
							moneyflow.type = 'z';
							moneyflow.bill_number = number;
						}
						k.dao.addOne(moneyflow);
					}
				});
			});
			k.aspect.manage.selectAccountRefresh($('#facebox select.account'));
			for(var i in sds){
				$('#facebox select.month').append('<option value="'+sds[i]+'">'+sds[i].replace('s','20')+'</option>');
			}
			var month_change=function(){
				month = $('#facebox select.month').val();
				$('#facebox table.list').html(table_list());
				$('#facebox td.count').html('0 / '+i);
				$('#facebox input.amount').val('');
				
				$('#facebox input.first').change(function(){
					var checked = $('#facebox input.first').prop('checked');
					if(checked) {
						$('#facebox input.first').next().css('background-color','#e7eff5');
						$('#facebox td.count').html(i+' / '+i);
						$('#facebox input.amount').val(total.toFixed(2));
					}else{
						$('#facebox input.first').next().css('background-color','#fff');
						$('#facebox td.count').html('0 / '+i);
						$('#facebox input.amount').val('');
					}
					$('#facebox input.list').prop('checked',checked);
				});
				$('#facebox input.list').change(function(){
					if(type==='s'){
						count=0;amount=0;
						$('#facebox input.list').each(function(i){
							if($('#facebox input.list').eq(i).prop('checked')) {
								count++;
								var am = $('#facebox table.list tr:eq('+(i+1)+') td:eq(2)').html();
								var pm = $('#facebox table.list tr:eq('+(i+1)+') td:eq(3)').html();
								amount +=(parseFloat(am)-parseFloat(pm));
							}
						});
						if($('#facebox input.first').prop('checked') && (count !== i)) {
							$('#facebox input.first').next().css('background-color','#fff');
						}
						$('#facebox td.count').html(count+' / '+i);
						$('#facebox input.amount').val(amount?amount.toFixed(2):'');
					}else{
						$('#facebox input.list').each(function(i){
							$('#facebox input.list').eq(i).prop('checked',false);
						});
						$(this).prop('checked',true);
						$('#facebox td.count').html('1 / '+i);
					}
				});
			}
			$('#facebox input.cashier').autocomplete({
				minChars: 0,
				lookup: k.aspect.atcp.auto(null,'clerk'),
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
					$(this).attr('data-id',s.data.id);
				},
				onSearchComplete:function(q,s){
					$(this).removeAttr('data-id');
				},
			});
			$('#facebox select.month').change(month_change);
			$('#facebox select.type').change(function(){
				type = $(this).val();
				if(type==='s'){
					$('#facebox th.chk input').removeAttr('disabled');
				}else{
					$('#facebox input.first').prop('checked',false).attr('disabled','disabled');
					$('#facebox input.first').next().css('background-color','#fff');
					$('#facebox td.count').html('0 / '+i);
					$('#facebox input.amount').val(0);
					$('#facebox input.list').each(function(i){
						$('#facebox input.list').eq(i).prop('checked',false);
					});
				}
			});
			month_change();
		},
		release:function(){ $('#layout div.statement table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.statement button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.statement';
			k.aspect.manage.init({create:'noop',classify:'noop',
				search:function(){
					$(box+' table.kc-manage-list tr.list').remove();
					var i,j,rowspan,len,v,t_m={},t_a,c_m={},p_m={},c_a,count=0,amount=0,sd,bid,n=0,m=0,map={};
					var s1 = $(box+' select.s1').val();
					for(i in k.cache.fixed_page[s1]){
						len=0;t_a=0;c_a=0;
						if(map['i'+k.cache.fixed_page[s1][i]]) continue;
						else map['i'+k.cache.fixed_page[s1][i]]=1;
						
						v=k.cache.get(k.cache.fixed_page[s1][i]);
						t_m['i'+v._id]={},p_m['i'+v._id]={},c_m['i'+v._id]={};
						for(j in k.cache.dates.mt){
							sd = 's'+k.cache.dates.mt[j];
							if(v[sd] && v[sd]!=='x'){
								t_m['i'+v._id][sd]=0,p_m['i'+v._id][sd]=0,c_m['i'+v._id][sd]=0;
								for(bid in v[sd]){
									if(v[sd][bid][3]!=='x'){
										t_a     +=(parseFloat(v[sd][bid][1])-parseFloat(v[sd][bid][2] || 0));
										c_a     += 1;
										t_m['i'+v._id][sd] +=parseFloat(v[sd][bid][1]);
										p_m['i'+v._id][sd] +=parseFloat(v[sd][bid][2] || 0);
										c_m['i'+v._id][sd] += 1;
									}
								}
								if(c_m['i'+v._id][sd]>0) len++;
							}
						}
						v.len = len;v.count=c_a;v.amount=t_a;
					}
					map={};
					//排序
					var asc  = $(box +' th.sort.asc').attr('data-sort');
					var desc = $(box +' th.sort.desc').attr('data-sort');
					if(asc){
						k.cache.fixed_page[s1].sort(function(a,b){
							return k.cache.get(a)[asc] < k.cache.get(b)[asc]?1:-1;
						});
					}else if(desc){
						k.cache.fixed_page[s1].sort(function(a,b){
							return k.cache.get(a)[desc] > k.cache.get(b)[desc]?1:-1;
						});
					}
					for(i in k.cache.fixed_page[s1]){
						if(map['i'+k.cache.fixed_page[s1][i]]) continue;
						else map['i'+k.cache.fixed_page[s1][i]]=1;
						
						v=k.cache.get(k.cache.fixed_page[s1][i]);
						if(v.len == 0) continue;
						n++;count+=v.count;amount+=v.amount;
						rowspan='</td><td rowspan="'+v.len+'"><span title="查看" onclick="kaidanbao.plugin.statement.view('+v._id+')">'+k.cache.get(v._id).name+'</span></td><td rowspan="'+v.len+'">'+v.count+'</td><td rowspan="'+v.len+'">'+v.amount.toFixed(2)+'</td><td rowspan="'+v.len+'">'+u.date.getTimeFormat(v.lm,'d');
						for(j in k.cache.dates.mt){
							sd = 's'+k.cache.dates.mt[j];
							if(v[sd] && v[sd]!=='x' && c_m['i'+v._id][sd]>0){
								$(box+' table.kc-manage-list').append(
										'<tr class="list '+(n%2===0?'opp':'')+'"><td>'+(++m)+rowspan
										+'</td><td>'+k.cache.dates.m_t[j]
										+'</td><td>'+c_m['i'+v._id][sd]
										+'</td><td>'+t_m['i'+v._id][sd].toFixed(2)
										+'</td><td>'+p_m['i'+v._id][sd].toFixed(2)
										+'</td><td class="remark"></td></tr>');
								rowspan='';op='';
							}
						}
					}
					$(box+' section.summary-box').html('总计：'+count+' 单，'+amount.toFixed(2)+' 元');
				},select:function(){
					$(box+' select.s1').append('<option value="customer">客户对账</option><option value="supplier">供应商对账</option>');
					$(box+' select.s2').append('<option>所有月份</option>');
					$(box+' input').attr('placeholder','按客户名称搜索');
				}
			});
		}
	}
	p.moneyflow={
		insert:function(){
			var account_p=$('#facebox select.account-p').val(),
			    account_r=$('#facebox select.account-r').val(),
			    remark=$('#facebox textarea.remark').val(),
			    type=$('#facebox select.type').val(),
			    mf={tn:'moneyflow',number:$('#facebox input.number').val(),amount:$('#facebox input.amount').val(),cashier_id:$('#facebox input.cashier').attr('data-id'),type:type};
			if(remark) mf.remark=remark;
			if(mf.amount) mf.amount=parseFloat(mf.amount);
			if(type === 'os'){
				mf.account_r=account_r;
			}else if(type === 'gz' || type === 'fz' || type === 'sf' || type === 'oz'){
				mf.account_p=account_p;
			}else if(type === 'zz'){
				mf.account_r=account_r;
				mf.account_p=account_p;
			}
			k.dao.addOne(mf,function(){
				$.facebox.close();
				$('#layout div.moneyflow div.kc-manage-box button').click();
			});
		},
		create:function(){
			$.facebox(' \
				<div class="fb-input-wrapper"> \
				<label>流水号：</label><input disabled="disabled" class="number" /></div> \
				<div class="fb-input-wrapper"> \
				<label>类型：</label><select class="type"><option value="os">其他收入</option><option value="oz">其他支出</option><option value="zz">内部转账</option></select></div> \
				<div class="fb-input-wrapper hide account-p" hidden> \
				<label>付款账户：</label><select class="account-p account" /></div> \
				<div class="fb-input-wrapper hide account-r"> \
				<label>收款账户：</label><select class="account-r account" /></div> \
				<div class="fb-input-wrapper"> \
				<label>金额：</label><input placeholder="必填" class="amount" /></div> \
				<div class="fb-input-wrapper"> \
				<label>出纳员：</label><input type="search" placeholder="必填" class="cashier" /></div> \
				<div class="fb-input-wrapper"> \
				<label>摘要：</label><textarea class="remark" maxlength="120"></textarea></div> \
				<div class="fb-input-wrapper"> \
				<label>&nbsp;</label> \
				<button onclick="kaidanbao.plugin.moneyflow.insert()">提交</button> \
			</div>');
			$('#facebox div.title').html('<a href="#/fi/moneyflow">出纳流水</a> > 新增出纳信息');
			$('#facebox input.number').val('CN-'+k.aspect.manage.get_number());
			var type,i,account;
			$('#facebox select.type').change(function(e){
				type = $('#facebox select.type').val();
				$('#facebox div.hide').attr('hidden','hidden');
				if(type === 'os'){
					$('#facebox div.account-r').removeAttr('hidden');
				}else if(type === 'oz'){
					$('#facebox div.account-p').removeAttr('hidden');
				}else if(type === 'zz'){
					$('#facebox div.account-p').removeAttr('hidden');
					$('#facebox div.account-r').removeAttr('hidden');
				}
			});
			$('#facebox input.cashier').autocomplete({
				minChars: 0,
				lookup: k.aspect.atcp.auto(null,'clerk'),
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
					$(this).attr('data-id',s.data.id);
		        },
		        onSearchComplete:function(q,s){
		        	$(this).removeAttr('data-id');
		        },
			});
			k.aspect.manage.selectAccountRefresh($('#facebox select.account'));
		},
		release:function(){ $('#layout div.moneyflow table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.moneyflow button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.moneyflow';
			k.aspect.manage.init({create:kaidanbao.plugin.moneyflow.create,classify:'noop'
				,search:function(){ total=0;
//					$(box+' table.kc-manage-list th.oprate').remove();
					$(box+' table.kc-manage-list tr.list').remove();
					$(box+' table.kc-manage-list th.remark').html('摘要');
					$(box+' input').attr('placeholder','搜索流水号、收款方、付款方、出纳员');
					var s1=$(box+' select.s1').val(),i=0,amount=0;
					var s2=$(box+' select.s2').val();
					k.dao.queryDynamicByMonth('moneyflow',s2,function(finish){
						if(finish) {
							var v1=k.cache.dynamic['moneyflow'][s2],v;
							for(var idx in v1){ v = v1[idx];
//								if(s1 !=='a' && v.type !== s1) return;
								amount+=v.amount;
								$(box+' table.kc-manage-list').append(
										'<tr class="list '+(++i%2===0?'opp':'')+'"><td>'+i
										+'</td><td>'+v.number
										+'</td><td>'+(v.aper_id?k.cache.get(v.aper_id).name:((v.type!=='xs' && v.type!=='os' || v.type==='zz')?'[ '+(v.account_p?k.cache.get(v.account_p).name:'')+' ]':''))
										+'</td><td>'+(v.arer_id?k.cache.get(v.arer_id).name:((v.type==='xs' || v.type==='os' || v.type==='zz')?'[ '+(v.account_r?k.cache.get(v.account_r).name:'')+' ]':''))
										+'</td><td>'+k.cache.get(v.cashier_id).name
										+'</td><td>'+v.amount
										+'</td><td>'+v.type
										+'</td><td class="remark">'+(v.remark || '')
										+'</td></tr>');
							}
							$(box+' section.summary-box').html('总计 '+i+' 条流水，总金额 '+amount.toFixed(2)+' 元');
						}
					});
				},select:function(){
					$(box+' select.s1').append('<option value="a"><所有类型></option>');
					for(var i in k.cache.dates.m_t){
						if(i<=k.cache.sign.month_length) $(box+' select.s2').append('<option>'+k.cache.dates.m_t[i]+'</option>');
					}
				}
			});
		},
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	var code_sended = false;
	p.welcome={
		init:function(){
			var box = '#layout div.lay-main .welcome';
			$('#layout div.lay-main').append(' \
				<div hidden class="welcome"> \
					<div class="pan-box chart-box"> \
						<div class="title">欢迎使用开单宝！惜时光，演绎精彩生活。</div> \
						<div class="content"> \
						</div> \
					</div> \
					<div class="pan-box list-box"> \
						<div class="title">在线用户</div> \
						<div class="content"> \
					<table><th class="printer" title="打印机"> \
					<svg version="1.1" viewBox="0 -70 1034 1034"><path d="M256 896h512v-128h-512v128zM960 704h-896c-35.2 0-64-28.8-64-64v-320c0-35.2 28.794-64 64-64h192v-256h512v256h192c35.2 0 64 28.8 64 64v320c0 35.2-28.8 64-64 64zM128 512c-35.346 0-64 28.654-64 64s28.654 64 64 64 64-28.654 64-64-28.652-64-64-64zM704 64h-384v320h384v-320z"></path></svg> \
					</th><th>用户</th></tr> \
					<tr><td><input name="Fruit" type="radio" value="" /></td><td>lulu</td></tr> \
					<tr><td><input name="Fruit" type="radio" value="" /></td><td>jinhui-fingal</td></tr> \
					<tr><td><input name="Fruit" type="radio" value="" /></td><td>jinhui-kaidanbao</td></tr> \
					</table>\
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
						<img src="/image/vx.jpg" title="公众号：kaidanme"> \
					</div> \
					<div hidden class="pan-box note-box"> \
						<div class="title">通知公告</div> \
					</div> \
				</div>');
			
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
				k.aspect.noty.confirm('<br /><h1>确定退出？</h1>',function(){
					window.location.href = './';
				});
			});
			$(box+' .note-box:eq(0) .content').html(navigator.userAgent);
		},
	}
	p.usercenter={
		roll:{
			upset:function(ri){
				var td='',opp=0,n=0;
				var json = k.conf.frame;
				//json['p'][m]['sol'][n]['plug'][l]
				var p=json['p'],sol,plug,i,j,m,en,cn;
				for(i=1;i<p.length;i++){
					if(p[i]['sol'].length === 0) continue;
					en=p[i]['en'];cn=p[i]['cn'];
					td += ('<tr'+(opp++%2?'':' class="opp"')+'><td class="grey" rowspan="'+p[i]['sol'].length+'">'+cn+'</td><td class="grey">'+p[i]['sol'][0]['cn']+'</td>');
					sol = p[i]['sol'];
					for(j=0;j<sol.length;j++){
						if(j>0) td+=('<tr'+(opp++%2?'':' class="opp"')+'><td class="grey">'+p[i]['sol'][j]['cn']+'</td>');
						plug=sol[j]['plug'];
						for(m=0;m<plug.length;m++){
							td += ('<td><input data-pn="'+plug[m]['en']+'" type="checkbox" id="checkbox_a'+(++n)+'" hidden class="chk_1 '+plug[m]['en']+'" /><label for="checkbox_a'+n+'"></label>'+plug[m]['cn']+'</td>');
						}
						td+='</tr>';
					}
				}
				$.facebox('名称：<input class="name" style="width:100px;" />，说明：<input class="remark" style="width:200px;" /><br /><br /><table class="frame">'+td+'</table>');
				$('#facebox div.footer').html('<button class="ensure">确定</button>');
				var roll = k.cache.setup('roll'),len=roll.value;
				if(ri){
					//修改
					$('#facebox div.title').html('修改角色');
					var old_plugin = roll['r'+ri].plugin;
					$('#facebox input.chk_1').each(function(i){
						if(old_plugin[$('#facebox input.chk_1').eq(i).attr('data-pn')]) $('#facebox input.chk_1').eq(i).prop('checked','checked');
					});
					$('#facebox input.name').val(roll['r'+ri].name);
					$('#facebox input.remark').val(roll['r'+ri].remark);
				}else{
					//新增
					$('#facebox div.title').html('新增角色');
					len += 1;ri = roll.value;
				}
				$('#facebox div.footer .ensure').click(function(){
					var plugin={};
					var name = $('#facebox input.name').val().trim();
					if(!name) {
						k.aspect.noty.message('角色名称不能为空');
						return;
					}
					$('#facebox input.chk_1').each(function(i){
						if($('#facebox input.chk_1').eq(i).prop('checked')) {
							plugin[$('#facebox input.chk_1').eq(i).attr('data-pn')] = 1;
						}
					});
					var roll_upd = {_id:roll._id,value:len,tn:'setup'};
					roll_upd['r'+ri] = {
							name  : $('#facebox input.name').val(),
							remark: $('#facebox input.remark').val(),
							plugin: plugin
					};
					k.dao.updOne(roll_upd,function(){
						$.facebox.close();
						window.kaidanbao.plugin.usercenter.roll.load();
					});
				});
			},load:function(){
				var box = '#layout div.usercenter';
				//角色
				var roll=k.cache.setup('roll');
				$(box+' .roll-box .content').html('<table><tr><th>名称</th><th>说明</th></tr></table>');
				for(var n=0;n<roll.value;n++){
					var name = roll['r'+n].name;
					if(!roll['r'+n].f){//可修改
						name = '<span onclick="kaidanbao.plugin.usercenter.roll.upset('+n+');">'+name+'</span>';
					}
					$(box+' .roll-box table').append('<tr><td>'+name+'</td><td>'+roll['r'+n].remark+'</td></tr>');
				}
			}
		},
		inc:{
			load:function(){
				var user = k.cache.sign.user;
				$('#layout div.usercenter .inc-info .content').html(
						'<span onclick="kaidanbao.plugin.usercenter.inc.change(\'inc\');">公司简称</span>：'+user.inc+'<br />'+
						'<span onclick="kaidanbao.plugin.usercenter.inc.change(\'mobile\');">安全电话</span>：'+(user.safe_mobile || '')+'<br />'+
						'注册日期：'+u.date.getTimeFormat(user.ct,'d')+'<br />'
				);
			},
			update:function(type){
				var user = k.cache.sign.user;
				var ur = {_id:user._id};
				if(type == 'inc'){
					var inc = $('#facebox input.inc').val().trim();
					if(!u.valid_hanname(inc)) return;
					ur.inc = inc;
				}else if(type=='mobile'){
					var mobile = $('#facebox input.mobile').val().trim();
					var code = $('#facebox input.code').val().trim();
					var password = $('#facebox input.password').val();
					var pwd_local = k.safe.local_pwd(password);
					var local_pwd = k.cache.local()['lp'+user['staff'+k.cache.sign.staff_id].loginname];
					if(!u.valid_mobile(mobile)) return;
					if(pwd_local != local_pwd){
						k.aspect.noty.message('密码错误！');
						return;
					}
					if(code_sended && !code) {
						k.aspect.noty.message('验证码不能为空！');
						return;
					}
					ur.safe_mobile = mobile;
					ur.code = parseInt(code);
				}
				k.net.api('/manage/upduser',ur,function(err,r){
					if(r){
						if(r.obj.mobile){
							code_sended = true;
							k.aspect.noty.message('已发短信至:'+r.obj.mobile);
							$('#facebox button.send-msg').html('已发送').attr('disabled','disabled');
						}else{
							if(inc) window.kaidanbao.plugin.loading.change_inc(inc);
							user.safe_mobile = mobile;
							window.kaidanbao.plugin.usercenter.inc.load();
							k.aspect.noty.message('操作成功！');
							$.facebox.close();
						}
					}
				});
			},
			change:function(type){
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
					$('#facebox div.title').html('修改手机号码');
				}
			}
		},
		staff:{
			load:function(){
				var staff = k.cache.sign.user['staff'+k.cache.sign.staff_id];
				var roll=k.cache.setup('roll');
				$('#layout div.usercenter .staff-info .content').html(
						'<span onclick="kaidanbao.plugin.usercenter.staff.change(\'loginname\');">登录账号</span>：'+staff.loginname+'<br />'+
						'<span onclick="kaidanbao.plugin.usercenter.staff.change(\'login-pwd\');">登录密码</span>：******<br />'+
						'<span class="setnick" onclick="kaidanbao.plugin.usercenter.staff.change(\'nick\');">用户昵称</span>：'+(staff.nick || '')+'<br />'+
						'用户角色：'+roll[''+(staff.roll || 'r0')].name+'<br />'+
						'用户状态：正常<br />'+
						'到期日期：'+staff.due+'<br />'
				);
				if(!staff.nick){
					//设置昵称
					$('#layout div.usercenter .staff-info span.setnick').click();
				}
			},
			renewpay:function(){
				var user = k.cache.sign.user,staff=user['staff'+k.cache.sign.staff_id];
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
			renewal:function(){
				var user = k.cache.sign.user,staff=user['staff'+k.cache.sign.staff_id];
				$.facebox(
						'<br /><div class="fb-input-wrapper"> \
						<label>用户名称：</label> \
						<input class="inc" disabled="disabled" value="'+(staff.nick || staff.loginname)+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>当前有效期至：</label> \
						<input class="inc" disabled="disabled" value="'+(staff.due)+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>续后有效期至：</label> \
						<input class="inc" disabled="disabled" value="'+u.date.getDay(366,staff.due)+'" /></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.staff.renewpay();">付款</button> \
						</div>');
				$('#facebox div.title').html('用户续费');
			},
			update:function(clazz){
				var oldstaff = k.cache.sign.user['staff'+k.cache.sign.staff_id];
				var staff={_id:oldstaff._id};
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
					if(old_pwd_local != loc['lp'+loc.ln]){
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
					if(staff.nick == oldstaff.nick) return;
				}
				if(staff.nick){
					var py = u.pinyin.getSZM(staff.nick);
					var clerk_id = k.cache.name_cache.clerk[staff.nick];
					if(clerk_id){//已有职员的名字
						if(clerk_id == oldstaff.bind_clerk){ //未改变
							$.facebox.close();
						}else{//改变绑定职员
							staff.bind_clerk=clerk_id;
							k.net.api('/manage/updstaff',staff,function(err,r){
								if(r){
									u.extend(oldstaff,staff,true);
									window.kaidanbao.plugin.usercenter.staff.load();
									window.kaidanbao.plugin.usercenter.stafflist.load();
									$.facebox.close();
									k.dao.updOne({_id:clerk_id,tn:'clerk',number:k.cache.sign.staff_id,bind_si:k.cache.sign.staff_id});
								}
							});
						}
					}else{
						if(oldstaff.bind_clerk){
							//更新绑定职员
							k.net.api('/manage/updstaff',staff,function(err,r){
								if(r){
									u.extend(oldstaff,staff,true);
									window.kaidanbao.plugin.usercenter.staff.load();
									window.kaidanbao.plugin.usercenter.stafflist.load();
									$.facebox.close();
									k.dao.updOne({tn:'clerk',number:k.cache.sign.staff_id,_id:oldstaff.bind_clerk,name:staff.nick,name_py:py});
								}
							});
						}else{
							//新增绑定职员
							k.dao.addOne({tn:'clerk',number:k.cache.sign.staff_id,bind_si:k.cache.sign.staff_id,name:staff.nick,name_py:py},function(err,r){
								staff.bind_clerk = r._id;
								k.net.api('/manage/updstaff',staff,function(err,r){
									if(r){
										u.extend(oldstaff,staff,true);
										window.kaidanbao.plugin.usercenter.staff.load();
										window.kaidanbao.plugin.usercenter.stafflist.load();
										$.facebox.close();
									}
								});
							});
						}
					}
				}else{
					k.net.api('/manage/updstaff',staff,function(err,r){
						if(r){
							u.extend(oldstaff,staff,true);
							var loc = k.cache.local();
							if(staff.loginname && staff.loginname != loc.ln){
								loc['ll'+staff.loginname] = loc['ll'+loc.ln];
								loc['lp'+staff.loginname] = loc['lp'+loc.ln];
								loc['ui'+staff.loginname] = loc['ui'+loc.ln];
								loc['si'+staff.loginname] = loc['si'+loc.ln];
								loc['bi'+staff.loginname] = loc['bi'+loc.ln];
								delete loc['ll'+loc.ln];
								delete loc['lp'+loc.ln];
								delete loc['ui'+loc.ln];
								delete loc['si'+loc.ln];
								delete loc['bi'+loc.ln];
								loc.ln = staff.loginname;
							}
							if(staff.password){
								loc['lp'+loc.ln] = new_pwd_local;
							}
							k.cache.local(loc);
							window.kaidanbao.plugin.usercenter.staff.load();
							$.facebox.close();
						}
					});
				}
			},
			change:function(clazz){
				var oldstaff = k.cache.sign.user['staff'+k.cache.sign.staff_id];
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
						<input class="nick" value="'+(oldstaff.nick || '')+'" /></div> \
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
			load:function(){
				var user = k.cache.sign.user,staff=user.staff1;
				$('#layout div.usercenter .staff-list .content').html(
						'<table><tr><th>序</th><th>用户</th><th>角色</th><th>状态</th></tr></table>'
				);
				var roll = k.cache.setup('roll');
				$('#layout div.usercenter .staff-list table').append('<tr><td>1</td><td>'+(staff.nick || staff.loginname)+'</td><td>'+roll['r0'].name+'</td><td>正常</td></tr>');
				for(var si=2; si<=user.staff_len;si++){
					staff = user['staff'+si];
					$('#layout div.usercenter .staff-list table').append(
						'<tr><td>'+si+'</td><td><span>'+(staff.nick || staff.loginname)+'<span></td><td>'+(roll[(staff.roll || 'r0')]).name+'</td><td>正常</td></tr>');
				}
			},
			addpay:function(){
				var loginname = $('#facebox input.loginname').val().trim();
				var password = $('#facebox input.password').val().trim();
				var roll = $('#facebox select.nick').val();
				if(!u.valid_loginname(loginname)) return;
				if(!u.valid_password(password)) return;
				k.net.api('/sign/checkloginname',{loginname : loginname},function(err,r1){
					if(r1){
						if(r1 && r1.obj.used){
							k.aspect.noty.message('用户名重复！');
							return;
						}
						var pwd_local = k.safe.local_pwd(password);
						k.aspect.pay({url:'/manage/addstaff',
							param:{ui:k.cache.sign.user._id,loginname:loginname,password:k.safe.up_pwd(pwd_local,password),roll:roll}
						},function(r){
							k.aspect.noty.confirm_close();
							k.aspect.noty.message('新增成功！');
							var staff = r.obj;
							k.cache.sign.user['staff'+staff.si] = staff;
							k.cache.sign.user.staff_len = staff.si;
							k.dao.put('sys',{id:'user',value:k.cache.sign.user});
							window.kaidanbao.plugin.usercenter.stafflist.load();
							$.facebox.close();
						});
					}
				},true);
			},
			addstaff:function(){
				$.facebox(
						'<br /><div class="fb-input-wrapper"> \
						<label>登录名称：</label> \
						<input class="loginname" /></div> \
						<div class="fb-input-wrapper"> \
						<label>登录密码：</label> \
						<input class="password" type="password" /></div> \
						<div class="fb-input-wrapper"> \
						<label>用户角色：</label> \
						<select class="roll" ><option value="r1">总经理</option></select></div> \
						<div class="fb-input-wrapper"> \
						<label>&nbsp;</label> \
						<button onclick="kaidanbao.plugin.usercenter.stafflist.addpay();">确定</button> \
						</div>');
				$('#facebox div.title').html('新增用户');
			},
		},
		init:function(){
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
					<div class="pan-box user-box roll-box"> \
						<div class="title">角色设置 - <span onclick="kaidanbao.plugin.usercenter.roll.upset();">新增</span></div> \
						<div class="content"></div> \
					</div> \
					<div class="pan-box user-box"> \
						<div class="title">默认设置</div> \
					</div> \
					<div class="pan-box user-box"> \
						<div class="title">操作日志</div> \
					</div> \
			</div>');
			//公司
			p.usercenter.inc.load();
			//用户
			p.usercenter.staff.load();
			//用户列表
			p.usercenter.stafflist.load();
			//角色
			p.usercenter.roll.load();
		},
	}
	
})(window.kaidanbao);
/**
 * 加载中...
 */
(function(k){
	var u = k.utils;
	var p = k.plugin;
	var addup=function(c){c();};//下面重新定义
	p.loading={
		change_inc:function(inc){
			if(inc) k.cache.sign.user.inc=inc;
			else inc = k.cache.sign.user.inc;
			$('#layout div.lay-top li.home a').html(inc);
			$(document).attr("title",inc+' - kaidan.me');
		},
		init:function(){
			if(k.cache.sign.user_id){//必须先登录
				k.dao.init(function(){
					k.syn.init(function(){
						k.cache.init(function(){
							addup(function(){
								window.kaidanbao.plugin.loading.change_inc();
								//TODO 测试使用
								window.location.hash = '#/home/welcome';
								k.cache.sign.loaded = true;
								k.aspect.noty.close_progress();
//								if(k.cache.sign.session){
//									//联网时，服务器推送
//									k.syn.sse();
//								}
							});
						});
					});
				});
			}else{
				window.location.href = './';
			}
		}
	}
	
	/**
	 * 统计，每次登陆时执行，s1601超过2年的仅保留总值
	 * 1,customer,s1601~s9912，对账{i1:[订单编号,总金额,定金,结款状态]...}从salebill统计
	 * 2,supplier,s1601~s9912，对账{i1:[订单编号,总金额,定金,结款状态]...}从bringbill统计
	 * 3,account,amount[0,1,2,...,11]每个月底余额，0是1月底，...，从salebill,bringbill,moneyflow统计
	 * 			 s1601~s9912，{a0:收入...,b0:支出...,c0:内部转账...},
	 * 5,product,s1601~s9912: 销售采购{s1:销售额,...,b2:采购额,...},从salebill bringbill统计
				 store:[0,1,2,...,11],12月月底库存数
	 */
	var i,d,cid,sid,aid,rid,pid;
	var customer={},supplier={},account={},repository={},product={},monthly={};//i1:统计值
	var up_salebill=function(m,comp){
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd='s'+k.cache.dates.mt[m],srd='sr'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m];
		k.dao.queryDynamicByMonth('salebill',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				//customer对账{i1:[订单编号,总金额,定金,结款状态(d删除,x已付全款,[空]普通签单)]...}
				cid = r.customer_id;
				if(!customer['i'+cid]){ customer['i'+cid]={_id:cid};}
				if(r.settlement === 'q'){
					if(!customer['i'+cid][sd]){ customer['i'+cid][sd]={};}
					if(!customer['i'+cid][sd]['i'+r._id]){ customer['i'+cid][sd]['i'+r._id]=[];}
					customer['i'+cid][sd]['i'+r._id][0]=r.number;
					customer['i'+cid][sd]['i'+r._id][1]=r.amount;
					customer['i'+cid][sd]['i'+r._id][2]=r.payamount;
					customer['i'+cid][sd]['i'+r._id][3]=r.st;
				}
				//account,[0,1,2,...,11]
				aid=r.account_id;
				if(aid){
					//s1601~s9912，[销售收入,其他收入,采购支出,工资支出,房租物业,税费支出,其他支出,内部转账]
					if(!account['i'+aid]){ account['i'+aid]={_id:aid};}
					if(!account['i'+aid][sd]) account['i'+aid][sd]=[0,0,0,0,0,0,0,0];
					if(r.payamount){
						//销售收入
						account['i'+aid][sd][0] +=r.payamount;
					}
				}
				rid=r.repository_id;
				if(!repository['i'+rid]) repository['i'+rid]={_id:rid};
				for(i in r.detail){
					d = r.detail[i],pid=d[0];//[product_id,spec,count,price,amount,remark,type]
					//repository,p[pid]:[0,1,2,...,11]
					if(!repository['i'+rid]['p'+pid]){
						repository['i'+rid]['p'+pid]=(k.cache.get(rid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+rid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+rid]['p'+pid][m1] = 0;
						repository['i'+rid]['p'+pid][m0] = 0;
					}	
					repository['i'+rid]['p'+pid][mm] -= d[2];
//					 * 5,product,s1601~9912: 销售{i1:销售额,...},从salebill统计
//					 	 sr1601~9912: 销售退货{i1:退货额,...},从salebill统计
					if(!product['i'+pid]){
						product['i'+pid]={_id:pid};
					}
					if(!product['i'+pid][sd]) product['i'+pid][sd]={}
					if(!product['i'+pid][sd]['i'+cid]) product['i'+pid][sd]['i'+cid]=0;
					product['i'+pid][sd]['i'+cid] += d[4];
					if(d[4]<0){ //退货
						if(!product['i'+pid][srd]) product['i'+pid][srd]={}
						if(!product['i'+pid][srd]['i'+cid]) product['i'+pid][srd]['i'+cid]=0;
						product['i'+pid][srd]['i'+cid] += d[4];
					}else if(d[3] != 0 && m<2){ //报价单
						if(!customer['i'+cid]['quotation']) {
							customer['i'+cid]['quotation'] = {};
						}
						customer['i'+cid]['quotation']['i'+pid]=[d[3],d[1]];
					}
				}
			}
		},'next');
	}
	var up_bringbill=function(m,comp){
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd='s'+k.cache.dates.mt[m],brd='br'+k.cache.dates.mt[m],bd='b'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m];
		k.dao.queryDynamicByMonth('bringbill',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				//supplier对账{i1:[订单编号,总金额,定金,结款状态]...}
				sid=r.supplier_id;
				if(!supplier['i'+sid]){ supplier['i'+sid]={_id:sid};}
				if(r.settlement === 'q'){
					if(!supplier['i'+sid][sd]){ supplier['i'+sid][sd]={};}
					if(!supplier['i'+sid][sd]['i'+r._id]){ supplier['i'+sid][sd]['i'+r._id]=[];}
					supplier['i'+sid][sd]['i'+r._id][0]=r.number;
					supplier['i'+sid][sd]['i'+r._id][1]=r.amount;
					supplier['i'+sid][sd]['i'+r._id][2]=r.payamount;
					supplier['i'+sid][sd]['i'+r._id][3]=r.st;
				}
				//account,[0,1,2,...,11]
				aid = r.account_id;
				if(aid){
					//s1601~s9912，[销售收入,其他收入,采购支出,工资支出,房租物业,税费支出,其他支出,内部转账]
					if(!account['i'+aid]){ account['i'+aid]={_id:aid};}
					if(!account['i'+aid][sd]) account['i'+aid][sd]=[0,0,0,0,0,0,0,0];
					if(r.payamount){
						//采购支出
						account['i'+aid][sd][2] -=r.payamount;
					}
				}
				rid = r.repository_id;
				if(!repository['i'+rid]) repository['i'+rid]={_id:rid};
				for(i in r.detail){
					d = r.detail[i],pid=d[0];//[product_id,spec,count,price,amount,remark,type]
					//repository,p[pid]:[0,1,2,...,11]
					if(!repository['i'+rid]['p'+pid]){
						repository['i'+rid]['p'+pid]=(k.cache.get(rid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+rid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+rid]['p'+pid][m1] = 0;
						repository['i'+rid]['p'+pid][m0] = 0;
					}	
					repository['i'+rid]['p'+pid][mm] += d[2];
					//5,product,b1601~9912: 采购{i2:采购额,...},从bringbill统计
					//          br1601~9912: 采购退货{i2:退货额,...},从bringbill统计
					if(!product['i'+pid]){
						product['i'+pid]={_id:pid};
						product['i'+pid][sd]={};
					}
					if(!product['i'+pid][bd]) product['i'+pid][bd]={};
					if(!product['i'+pid][bd]['i'+sid]) product['i'+pid][bd]['i'+sid]=0;
					product['i'+pid][bd]['i'+sid] += d[4];
					
					if(d[4]<0){ //退货
						if(!product['i'+pid][brd]) product['i'+pid][brd]={};
						if(!product['i'+pid][brd]['i'+sid]) product['i'+pid][brd]['i'+sid]=0;
						product['i'+pid][brd]['i'+sid] += d[4];
					}else if(d[3] != 0 && m<2){ //报价单
						if(!supplier['i'+sid]['quotation']) {
							supplier['i'+sid]['quotation'] = {};
						}
						supplier['i'+sid]['quotation']['i'+pid]=[d[3],d[1]];
					}
				}
			}
		},'next');
	}
	var up_allotbill=function(m,comp){
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd = 's'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m];
		k.dao.queryDynamicByMonth('allotbill',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				//repository,p[pid],[0,1,2,...,11]
				var coid = r.callout_id;
				var ciid = r.callin_id;
				if(!repository['i'+coid]) repository['i'+coid]={_id:coid};
				if(!repository['i'+ciid]) repository['i'+ciid]={_id:ciid};
				for(var i in r.detail){
					var dtl=r.detail[i],pid = dtl[0];
					if(!repository['i'+coid]['p'+pid]){
						repository['i'+coid]['p'+pid]=(k.cache.get(coid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+rcoidid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+coid]['p'+pid][m1] = 0;
						repository['i'+coid]['p'+pid][m0] = 0;
					}	
					repository['i'+coid]['p'+pid][mm] -=dtl[1];
					if(!repository['i'+ciid]['p'+pid]){
						repository['i'+ciid]['p'+pid]=(k.cache.get(ciid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+ciid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+ciid]['p'+pid][m1] = 0;
						repository['i'+ciid]['p'+pid][m0] = 0;
					}	
					repository['i'+ciid]['p'+pid][mm] +=dtl[1];
				}
			}
		});
	}
	var up_checkbill=function(m,comp){
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd = 's'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m];
		k.dao.queryDynamicByMonth('checkbill',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				var rid = r.repository_id;
				//repository,p[pid],[0,1,2,...,11]
				if(!repository['i'+rid]) repository['i'+rid]={_id:rid};
				for(var i in r.detail){
					var dtl=r.detail[i],pid = dtl[0];
					if(!repository['i'+rid]['p'+pid]){
						repository['i'+rid]['p'+pid]=(k.cache.get(rid)['p'+pid] || [0,0,0,0,0,0,0,0,0,0,0,0]);
						repository['i'+rid]['p'+pid][m2] = 0;//临时保存变动数值，最后计算
						repository['i'+rid]['p'+pid][m1] = 0;
						repository['i'+rid]['p'+pid][m0] = 0;
					}
					repository['i'+rid]['p'+pid][mm] +=(dtl[2]-dtl[1]);
				}
			}
		});
	}
	var up_moneyflow=function(m,comp){
		var sd = 's'+k.cache.dates.mt[m],mm = k.cache.dates.mi[m],apid,arid;
		var t_map={'xs':0,'os':1,'cg':2,'gz':3,'fz':4,'sf':5,'oz':6,'zz':7};
		
		k.dao.queryDynamicByMonth('moneyflow',k.cache.dates.m_t[m],function(err,r){
			if(err){
				comp();
			}else{
				//3,account,amount[0,1,2,...,11]每个月底余额，0是1月底，...，从salebill,bringbill,moneyflow统计
				//s1601~s9912，[销售收入,其他收入,采购支出,工资支出,房租物业,税费支出,其他支出,内部转账]
				apid=r.account_p;arid=r.account_r;
				if(apid){
					if(!account['i'+apid]){ account['i'+apid]={_id:apid};}
					if(!account['i'+apid][sd]) {account['i'+apid][sd]=[0,0,0,0,0,0,0,0];}
					if(!r.flag) account['i'+apid][sd][t_map[r.type]] -= r.amount;
				}
				if(arid){
					if(!account['i'+arid]){ account['i'+arid]={_id:arid};}
					if(!account['i'+arid][sd]) {account['i'+arid][sd]=[0,0,0,0,0,0,0,0];}
					if(!r.flag) account['i'+arid][sd][t_map[r.type]] += r.amount;
				}
			}
		});
	}
	var compare_cs=function(tn){
		var old,now,sid,bid,sd,change,q_change,up;
		//customer,s1601~s9912对账{i1:[订单编号,总金额,定金,结款状态,删除状态(d删除,x已付全款,[空]普通签单)]...}
		//supplier,s1601~s9912对账{i1:[订单编号,总金额,定金,结款状态,删除状态]...}
		var buckt = (tn==='customer'?customer:supplier);
		for(var i=0;i<3;i++){
			sd='s'+k.cache.dates.mt[i];
			for(sid in buckt){
				old = k.cache.fixed[sid];
				now = buckt[sid];
				if(!old) continue;
				up  = {tn:tn,_id:old._id};
				up[sd] = (old[sd] || {});
				change=false;
				if(up[sd] !== 'x'){
					for(bid in now[sd]){
						if(up[sd][bid]){
							if(up[sd][bid][3]!=='x' && now[sd][bid][3] === 'd'){
								change=true;
								up[sd][bid][3]='x';
							}
						}else{
							if(now[sd][bid][3] !=='d'){
								change=true;
								up[sd][bid] = now[sd][bid];
							}
						}
					}
				}
				if(change) k.dao.updOne(up,null,3);
				if(i==0 && now['quotation']){
					old['quotation'] = old['quotation'] || {};
					q_change=false;
					for(var pid in now['quotation']){
						if(!old['quotation'][pid] ||
							old['quotation'][pid][0] != now['quotation'][pid][0] ||
							old['quotation'][pid][1] != now['quotation'][pid][1]) {
							old['quotation'][pid] = now['quotation'][pid];
							q_change = true;
						}
					}
					if(q_change) k.dao.updOne({tn:tn,_id:old._id,quotation:old.quotation},null,3);
				}
			}
		}
	}
	var compare_and_save=function(){
		compare_cs('customer');
		compare_cs('supplier');
		var m0=k.cache.dates.mi[0];m1=k.cache.dates.mi[1];m2=k.cache.dates.mi[2];m3=k.cache.dates.mi[3];
		var sd0='s'+k.cache.dates.mt[0],sd1='s'+k.cache.dates.mt[1],sd2='s'+k.cache.dates.mt[2];
		var old , now , aid;
		for(aid in account){
			old = k.cache.fixed[aid];
			now = {tn:'account',amount:(old.amount || [0,0,0,0,0,0,0,0,0,0,0,0]),_id:old._id};
			now[sd2] = account[aid][sd2] || [0,0,0,0,0,0,0,0];
			now[sd1] = account[aid][sd1] || [0,0,0,0,0,0,0,0];
			now[sd0] = account[aid][sd0] || [0,0,0,0,0,0,0,0];
			now.amount[m2]=now.amount[m3]+now[sd2][0]+now[sd2][1]+now[sd2][2]+now[sd2][3]+now[sd2][4]+now[sd2][5]+now[sd2][6]+now[sd2][7];
			now.amount[m1]=now.amount[m2]+now[sd1][0]+now[sd1][1]+now[sd1][2]+now[sd1][3]+now[sd1][4]+now[sd1][5]+now[sd1][6]+now[sd1][7];
			now.amount[m0]=now.amount[m1]+now[sd0][0]+now[sd0][1]+now[sd0][2]+now[sd0][3]+now[sd0][4]+now[sd0][5]+now[sd0][6]+now[sd0][7];
			if(old.amount.toString()!==now.amount.toString()) k.dao.updOne(now,null,3);
		}
	}
	addup = function(comp){
		up_bringbill(2,function(){
			up_bringbill(1,function(){
				up_bringbill(0,function(){
		up_salebill(2,function(){
			up_salebill(1,function(){
				up_salebill(0,function(){
		up_moneyflow(2,function(){
			up_moneyflow(1,function(){
				up_moneyflow(0,function(){
					//比较&保存
					compare_and_save();
					comp();
		});});});});});});});});});
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	p.customer={
		release:function(){ $('#layout div.repository table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.repository button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.customer';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 位客户');
				total=0;
			}});
		},
	}
	p.supplier={
		release:function(){ $('#layout div.supplier table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.supplier button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.supplier';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 位供应商');
				total=0;
			}});
		},
	}
	p.clerk={
		release:function(){ $('#layout div.clerk table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.clerk button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.clerk';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 位员工');
				total=0;
			}});
		},
	}
	p.account={
		init:function(){
			var total=0,box = '#layout div.account';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 个账户');
				total=0;
			}});
		},
	}
	p.product={
		release:function(){ $('#layout div.product table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.product button.s-btn').click(); },
		init:function(){
			var total=0,box = '#layout div.product';
			k.aspect.manage.init({count:function(v){
				total++;
			},notice:function(){
				$(box+' input').attr('placeholder','搜索 '+total+' 个商品');
				total=0;
			}});
		},
	}
	p.salebilling={
		init:function(){
			k.aspect.billing.init();
		}
	}
	p.salebill={
		release:function(){ $('#layout div.salebill table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.salebill button.s-btn').click(); },
		init:function(){
			k.aspect.bill.init();
		}
	}
	//下面移到【 库存 】
	p.bringbilling={
		init:function(){
			k.aspect.billing.init();
		}
	}
	p.bringbill={
		release:function(){ $('#layout div.bringbill table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.bringbill button.s-btn').click(); },
		init:function(){
			k.aspect.bill.init();
		}
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	var local = k.cache.local();
	var loadSign=function(){
//		indexedDB.deleteDatabase("kdb5");
		if(document.getElementById('sign')) return;
//		var bg=[
//        'mengjing1','mengjing2','mengjing3',
//        'huaer1','huaer2','huaer3',
//        'chuntian1','chuntian2','chuntian3',
//        'dongman1','dongman2','dongman3',
//        'katong1','katong2','katong3',
//        ],i=0;
//		window.addEventListener('click',function(){
//			$('body').css('background-image','url(../bg/'+bg[i]+'.jpg)');
//			if(++i>=bg.length) i=0;15101161756，KAANS-ZEKZA-DTYNG-MXIZY
//		});
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
			</div> \
			<div hidden class="sign-loading"> \
				<p class="progress_msg">正在加载，请稍候...</p> \
			  	<progress value="0" max="100" ></progress> \
			</div> \
		</div>');
		document.onkeydown=function(e){ 
			if(e.keyCode === 13 ){//Enter
				if(e.ctrlKey){//Ctrl + Enter 开单页面
					$('#layout div.'+k.frame.current_plugin+' button.submit').click();
				}else{//Enter 登录页面
					if(window.location.hash === '#/sign/login') $('#sign .sign-button-login button').click();
				}
			}
		} 
	}
	p.forget={
		init:function(){
			loadSign();
			$('#sign button.captcha-button').click(function(){
				var loginname = $('#sign input.loginname').val().trim();
				if(!u.valid_loginname(loginname)) return;
				k.net.api('/sign/forget',{loginname : loginname},function(err,r){
					if(r){
						k.aspect.noty.message('已发短信至:'+r.obj.mobile);
						$('#sign button.captcha-button').html('已发送').attr('disabled','disabled').css('background-color','#555');
					}
				},true);
			});
			$('#sign button.forget').click(function(){
				var loginname = $('#sign input.loginname').val().trim();
				if(!u.valid_loginname(loginname)) return;
				var password = $('#sign input.password').val();
				if(!u.valid_password(password)) return;
				var pwd_local = k.safe.local_pwd(password);
				var captcha = $('#sign input.captcha').val();
				if(!captcha) return;
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
						k.aspect.noty.message('用户名已被使用，请更换');
						return;
					}
					var pwd_local = k.safe.local_pwd(password);
					k.aspect.pay({url:'/sign/register',no_session:true,
						param:{loginname : loginname, password : k.safe.up_pwd(pwd_local,password), inc  : inc}
					},function(){
						k.aspect.noty.confirm_close();
						window.location.hash = '#/sign/login';//直接登录
						$('#sign button.login').click();
//						k.aspect.noty.message('注册成功！');
					});
				},true);
			});
		}
	}
	p.login={
		init:function(){
			loadSign();
			if(local['ln']) {
				$('#sign input.loginname').val(local['ln']);
				$('#sign input.password').focus();
			}else{
				$('#sign input.loginname').focus();
			}
			$('#sign .sign-button-login button').click(function(){
				var loginname = $('#sign input.loginname').val();
				var password = $('#sign input.password').val();
				if(!u.valid_loginname(loginname)) return;
				if(!u.valid_password(password)) return;
				
				var pwd_local = k.safe.local_pwd(password);
				k.aspect.noty.progress('登录中。。。');
				k.net.api('/sign/login',{
					loginname:loginname,
					password:k.safe.up_pwd(pwd_local,password),
					box_id  :(local['bi'+loginname] || 0)
				},function(err,r){
					if(err){
						if(err.code){
							//能联网，登录失败
							k.aspect.noty.close_progress();
							k.aspect.noty.message('登录失败！');
						}else{
							//不能联网，离线检查
							if(k.safe.local_pwd(password) === local['lp'+loginname]){
								k.cache.sign.user_id  = local['ui'+loginname];
								k.cache.sign.staff_id = local['si'+loginname];
								k.cache.sign.box_id   = local['bi'+loginname];
								location.hash = '#/sign/loading';
							}else {
								k.aspect.noty.close_progress();
								k.aspect.noty.message('用户名或密码错误！');
							}
						}
					}else {
						if(local['bi'+loginname] != r.obj.box_id) {
							k.cache.sign.need_create_db = true;
						}
						local['ln'] = loginname;
						local['ll'+loginname] = new Date().getTime();
						local['lp'+loginname] = pwd_local;
						local['ui'+loginname] = r.obj.user._id;
						local['si'+loginname] = r.obj.staff_id;
						local['bi'+loginname] = r.obj.box_id;
						//localStorage
						k.cache.local(local);
						k.cache.sign.user = r.obj.user;
						
						k.cache.sign.user_id  = r.obj.user._id;
						k.cache.sign.staff_id = r.obj.staff_id;
						k.cache.sign.box_id   = r.obj.box_id;
						
						k.cache.sign.session  = {token: r.obj.token,usb: r.obj.user._id+'-'+r.obj.staff_id+'-'+r.obj.box_id};
						location.hash = '#/sign/loading';
					}
				},true);
			});
		}
	}
})(window.kaidanbao);/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	p.store={
		export_check:function(){
			var r = $('#facebox select.repository').val(),checker=$('#facebox input.checker').val();
			var i,id,v,cache_map={},box='#export',checker_id=$('#facebox input.checker').attr('data-id');
			if(checker_id){
				$(box).html('<table><th>系统编号</th><th>产品</th><th>规格</th><th>单位</th><th>系统库存</th><th>盘点后库存</th></table>');
				for(i in k.cache.fixed_by_table['product']){
					id = k.cache.fixed_by_table['product'][i];
					if(!cache_map['i'+id]){
						cache_map['i'+id] = 1;
						v = k.cache.get(id);
						$(box+' table').append('<tr><td>p'+v._id
								+'</td><td>'+(v.number+' '+(v.name || '-'))
								+'</td><td>'+(v.spec || '-')
								+'</td><td>'+(v.unit || '-')
								+'</td><td>'+v.count
								+'</td><td style="background-color:#f5f5f5;">-</td></tr>');
					}
				}
				u.file.tableToExcel($('#export').html(),k.cache.get(r).name+'-盘点表-'+checker);
			}else k.aspect.noty.message('盘点员不能为空!');
		},
		import_check:function(file){
			k.aspect.noty.progress('正在导入，请稍后...');
			u.file.excelToTable(file,function(html){
				if(html){
					$('#export').html(html);
					var p =[],i,id,count;
//					console.log($('#export table tr').length);
					for(i=0;i<$('#export table tr').length;i++){
						id = $('#export table tr:eq('+i+') td:eq(0)').html();
						count = $('#export table tr:eq('+i+') td:eq(5)').html();
						if(id && id[0] === 'p' && count && u.is_float(count.trim())){
							p.push({_id:parseInt(id.substring(1)),count:parseFloat(count.trim())});
						}
					}
					if(p.length>0){
						
					}else k.aspect.noty.message('产品库存无更新!');
//					console.dir(p);
				}
				setTimeout(function() {
					k.aspect.noty.close_progress();
				}, 1000);
			});
		},
		check:function(){
			$.facebox(' \
					<div class="fb-input-wrapper"><label>盘点员：</label><input class="checker" type="search" /></div> \
					<div class="fb-input-wrapper"><label>仓库：</label><select class="repository"></select></div> \
					<div class="fb-input-wrapper"><label>盘点步骤：</label> \
						<textarea class="remark" disabled="disabled" style="color:#078;width:390px;height:60px;">第一步：选择仓库，导出盘点表。 \
							第二步：打开盘点表，填写【盘点后库存】。 \
							第三步：导入填写后的盘点表，完成盘点。 \
						</textarea></div> \
					<div class="fb-input-wrapper"><label>注意事项：</label> \
						<textarea class="remark" disabled="disabled" style="color:#f08;width:390px;height:60px;">1：请勿修改盘点表的其他字段，勿修改文件名。 \
							2，填表期间，可以关闭本页面，可以部分盘点。 \
							3，导入盘点表前请仔细检查，导入后不支持撤销。 \
						</textarea></div> \
					<div class="fb-input-wrapper"> \
					<label>&nbsp;</label> \
					<button onclick="kaidanbao.plugin.store.export_check();">导出盘点表</button> \
					<button onclick="$(\'#importfile\').click();">导入盘点表</button> \
				</div>');
			$('#facebox div.title').html('库存盘点');
			$('#facebox input.checker').autocomplete({
				minChars: 0,
				newButton:'<div class="autocomplete-new"><span onclick="kaidanbao.aspect.manage.create(\'clerk\');$(\'.autocomplete-suggestions\').css(\'display\',\'none\');">新增职员</span></div>',
				lookup: k.aspect.atcp.auto(null,'clerk'),
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
					$(this).attr('data-id',s.data.id);
		        },
		        onSearchComplete:function(q,s){
		        	$(this).removeAttr('data-id');
		        },
			});
			k.aspect.manage.selectRepositoryRefresh($('#facebox select.repository'));
		},
		init:function(){
			var total=0,box = '#layout div.store',cache_map={};
			k.aspect.manage.init({search:function(c){
				$(box+' table.kc-manage-list tr.list').remove();
				var query = $(box+' input').val().trim(),qs,qs_len,matchs=0;
				if(query) {qs=query.toLowerCase().split(' ');qs_len=qs.length;}
				var amount=0,v,i,id,n=0,product;
				cache_map={};
				for(i in k.cache.fixed_by_table['product']){
					id = k.cache.fixed_by_table['product'][i];
					if(!cache_map['i'+id]){
						cache_map['i'+id] = 1;
						v = k.cache.get(id);
						product = (v.name +' '+ (v.number || ''));
						if(qs){
							matchs=0;
							for(var iq in qs){
								if(product.toLowerCase().indexOf(qs[iq])>=0){
									product = product.replace(new RegExp('('+qs[iq]+')', 'gi'), '<b>$1<\/b>');
									matchs++;
								}
							}
							if(matchs < qs_len) continue;
						}
						$(box+' table.kc-manage-list').append(
								 '<tr class="list '+(++n%2===0?'opp':'')+'"><td>'+n
								+'</td><td style="text-align:left;">'+product
								+'</td><td>'+(v.spec || '')
								+'</td><td>'+(v.unit || '')
								+'</td><td>'+(v.cost || '')
								+'</td><td>'+(v.amount || '')
								+'</td><td>'+(v.count || '')
								+'</td><td class="remark">'+(v.stock_remark ||'')
								+'</td></tr>');
					}
				}
				$(box+' section.summary-box').html('总：'+n+' 条，'+amount.toFixed(2)+' 元');
			},select:function(){
				$(box+' section.func-a').html('<span onclick="kaidanbao.plugin.store.check();" class="check">盘点</span>');
				$(box+' input').attr('placeholder','搜索商品名称');
				$(box+' select.s1').append('<option value="all"><所有类型></option>');
				for(var i in k.conf.table.product.type_define){
					$(box+' select.s1').append('<option value="'+i+'">'+k.conf.table.product.type_define[i]+'</option>');
				}
			},create:'noop',classify:'noop'});
		},
	}
})(window.kaidanbao);
