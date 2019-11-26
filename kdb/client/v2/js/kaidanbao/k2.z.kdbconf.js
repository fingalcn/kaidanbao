/** http://usejsdoc.org/
 */
(function(k){
	k.conf.db={
		name:'kdb',
	}
	k.conf.kdb={
		max_staff_due:'2025-12-31',//最大充值期限
		max_show_lines:250,//页面最大显示记录条数
		default_profit_rate:0.15,//默认利润率为10%
		dz_min_dif:10,//对账欠款10元之内视为结清
		ms:3,//实时统计月份为4个月，从第0个月起
		role_err_msg:'您没有权限进行此操作！'
	}
	//数据库表定义 setup monthly customer product supplier clerk account repository
	k.conf.table={
		setup:{ _tp : 'f',_lo:'info', cn : '设置',cols : {type:'',value:'',}},//默认设置，分类，枚举
		
		product:{ _tp : 'f',_lo:'info', cn : '产品',nav:'sale',cols : {number: '编号',name: '名称',spec: '规格',unit: '单位',price: '售价',mold: '类型',classify: '类别',ct:'新建日期',lm:'更新日期'},sort:{'spec':' ','price':' ','number':' ','name':' ','ct':' ','lm':'asc'}},
		customer:{ _tp : 'f',_lo:'info',py:true, cn : '客户',nav:'sale',cols : {number: '编号',name:'名称',settletype:'结算方式',address:'地址',mobile:'联系方式',staff_clerk:'销售员',mold: '类型',classify:'类别',ct:'新建日期',lm:'更新日期'},sort:{'number':' ','ct':' ','lm':'asc','staff_clerk':' '}},
		supplier:{ _tp : 'f',_lo:'info',py:true, cn : '供应商',nav:'sale',cols : {number: '编号',name:'名称',settletype:'结算方式',address:'地址',mobile:'联系方式',staff_clerk:'采购员',mold: '类型',classify:'类别',ct:'新建日期',lm:'更新日期'},sort:{'number':' ','ct':' ','lm':'asc','staff_clerk':' '}},
		clerk:{ _tp : 'f',_lo:'info',py:true, cn : '职员',nav:'sale',cols : {number: '工号',name: '姓名',tel: '电话',mold: '类型',classify:'类别',ct:'新建日期',lm:'更新日期'},sort:{'number':' ','ct':' ','lm':'asc'}},
		account:{ _tp : 'f',_lo:'info', cn : '账户',nav:'fi',cols : {number: '编号',name: '名称',mold: '类型',classify: '类别',ct:'新建日期',lm:'更新日期'},sort:{'ct':' ','lm':'asc'}},
		repository:{ _tp : 'f',_lo:'info', cn : '仓库',nav:'stock',cols : {number: '编号',name: '名称',mold: '类型',classify: '类别',ct:'新建日期',lm:'更新日期'},sort:{'ct':' ','lm':'asc'}},
		
		salebill:{ _tp : 'd',_lo:'bill', cn : '销售单',nav:'sale',cols : {ct:'单号',customer_id: '客户',saler_id: '销售员',amount: '金额',payamount:'已付',product:'产品',p_spec:'规格',count:'数量',price:'单价'},sort:{'customer_id':' ','saler_id':' ','amount':' ','payamount':' ','ct':'asc'}},
		bringbill:{ _tp : 'd',_lo:'bill', cn : '采购单',nav:'sale',cols : {ct:'单号',supplier_id: '供应商',buyer_id: '采购员',amount: '金额',payamount:'已付',product:'产品',p_spec:'规格',count:'数量',price:'单价'},sort:{'supplier_id':' ','buyer_id':' ','amount':' ','payamount':' ','ct':'asc'}},
		checkbill:{ _tp : 'd',_lo:'bill', cn : '盘点单',nav:'stock',cols : {number:'单号',checker_id: '盘点员',amount:'盈亏额',product: '产品',unit: '单位',before: '盘点前库存',after:'盘点后库存',cost:'成本价调整'}},
		allotbill:{ _tp : 'd',_lo:'bill', cn : '调拨单',nav:'stock',cols : {number:'单号',alloter_id: '调拨员',callout:'发货仓库',callin:'收货仓库',amount:'金额',product:'产品',spec:'规格',count:'数量'}},
		productbill:{ _tp : 'd',_lo:'bill', cn : '生产单',nav:'stock',cols : {number:'单号',alloter_id: '生产员',repository:'仓库',cost:'原料成本',amount:'成品产值',praw:'原料名称',c_cost:'原料单价',count1:'原料数量',pend:'出产货品',price:'出厂价',count2:'出厂数量'}},
		moneyflow:{ _tp : 'd',_lo:'bill', cn : '资金流水',nav:'fi',cols : {number:'流水号',cs:'客户/供应商',account:'账户',cashier_id: '出纳员',amount: '金额',type:'类型',}},
		
		log:{_tp : 'd',_lo:'log'},sys:{_lo:'sys'},
		//以下为虚拟表
		
		store:{cn:'库存',nav:'stock',cols:{number:'编号',product:'产品名称',unit:'单位',price:'平均成本',count:'当前库存数',check_count:'盘点后库存'}},
		statement:{cn:'客户对账',nav:'fi',cols:{name:'客户',count:'总签单',amount:'总欠款',lm:'更新日期',month:'月份',mcount:'签单数',mamount:'签单金额',mpreamount:'订金'},sort:{'count':' ','amount':' ','lm':'asc'}},
		supplierstatement:{cn:'供应商对账',nav:'fi',cols:{name:'供应商',allcount:'总单数',total:'总欠款',lm:'更新日期',month:'月份',count:'签单数',amount:'签单金额',preamount:'订金'}},
		//为了兼容以前的
		'enum':{_lo:'info'},
	}
	//预先插入的数据
	k.conf.preinsert={
	    xianjin:{tn:'account',number:'1001',name:'现金',st:'f'},
	    mainstock:{tn:'repository',number:'1001',name:'主仓库',st:'f'},
	    classify:{tn:'setup',type:'classify','moneyflow':{a0:{v:'销售收入',f:1},a1:{v:'其他收入'},b0:{v:'采购支出',f:1},b1:{v:'房租水电'}}},
	    role:{tn:'setup',type:'role',value:2,r0:{name:'总经理',remark:'拥有系统所有权限',f:1},r1:{name:'销售员',remark:'销售权限',v:{'add-salebill':1,'find-salebill':1,'add-customer':1,'find-customer':1,'upd-customer':1,'find-product':1,'add-product':1,'upd-product':1,'findall-salebill':1,'findall-customer':1}}},
	    setting:{tn:'setup',value:{},type:'setting'},
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
			               {"en":"salebill","cn":"销售单查询"}]
		        },{"en":"baseinfo","cn":"资料管理",
			       "plug":[{"en":"product","cn":"产品信息"},
			               {"en":"customer","cn":"客户信息"},
	                       {"en":"account","cn":"账户信息"},
	        		       {"en":"repository","cn":"仓库信息"},
	        		       {"en":"clerk","cn":"职员信息"},
	                       {"en":"supplier","cn":"供应商信息"}]
		        }]
			},{"en":"stock","cn":"库存",
		   "sol":[{"en":"stockmanage","cn":"库存管理",
		       	   "plug":[{"en":"store","cn":"库存盘点"},
		    		       {"en":"checkbill","cn":"盘点单查询"},
	        		        {"en":"allotbilling","cn":"库存调拨"},
	        		        {"en":"allotbill","cn":"调拨单查询"}]
			    },{"en":"purchasemanage","cn":"采购管理",
	               "plug":[{"en":"bringbilling","cn":"采购开单"},
	                       {"en":"bringbill","cn":"采购单查询"}]
	        	},{"en":"productmanage","cn":"生产管理",
	        		"plug":[{"en":"productbilling","cn":"生产开单"},
	        		        {"en":"productbill","cn":"生产单查询"}]
	        	}]
		},{"en":"fi","cn":"财务",
		   "sol":[{"en":"balance","cn":"对账出纳",
		           "plug":[{"en":"statement","cn":"往来对账"},
		                   {"en":"moneyflow","cn":"出纳流水"}]
			    }]
		},{"en":"chart","cn":"统计",
		   "sol":[{"en":"bysales","cn":"销量统计",
		           "plug":[{"en":"salebyvolume","cn":"销售报表"},
		                   {"en":"salebycustomer","cn":"客户分析"}]
		       }]
		}],
	}
	k.conf.role_set={
		add:{cn:'新增',basic:[
			{en:'add-customer',cn:'客户'},
			{en:'add-supplier',cn:'供应商'},
			{en:'add-product',cn:'产品'},
			{en:'add-clerk',cn:'职员'},
			{en:'add-account',cn:'账户'},
			{en:'add-repository',cn:'仓库'}],bill:[
				{en:'add-salebill',cn:'销售单'},
				{en:'add-bringbill',cn:'采购单'},
				{en:'add-checkbill',cn:'盘点单'},
				{en:'add-allotbill',cn:'调拨单'},
				{en:'add-productbill',cn:'生产单'},
				{en:'add-moneyflow',cn:'出纳流水'}]},
		del:{cn:'删除',basic:[
			{en:'del-customer',cn:'客户'},
			{en:'del-supplier',cn:'供应商'},
			{en:'del-product',cn:'产品'},
			{en:'del-clerk',cn:'职员'},
			{en:'del-account',cn:'账户'},
			{en:'del-repository',cn:'仓库'}],bill:[
				{en:'del-salebill',cn:'销售单'},
				{en:'del-bringbill',cn:'采购单'},
				{en:'del-checkbill',cn:'盘点单'},
				{en:'del-allotbill',cn:'调拨单'},
				{en:'del-productbill',cn:'生产单'}]},
		upd:{cn:'修改',basic:[
			{en:'upd-customer',cn:'客户'},
			{en:'upd-supplier',cn:'供应商'},
			{en:'upd-product',cn:'产品'},
			{en:'upd-clerk',cn:'职员'},
			{en:'upd-account',cn:'账户'},
			{en:'upd-repository',cn:'仓库'}]},
		find:{cn:'查看',basic:[
			{en:'find-customer',cn:'客户'},
			{en:'find-supplier',cn:'供应商'},
			{en:'find-product',cn:'产品'},
			{en:'find-clerk',cn:'职员'},
			{en:'find-account',cn:'账户'},
			{en:'find-repository',cn:'仓库'}],bill:[
				{en:'find-salebill',cn:'销售单'},
				{en:'find-bringbill',cn:'采购单'},
				{en:'find-checkbill',cn:'盘点单'},
				{en:'find-allotbill',cn:'调拨单'},
				{en:'find-productbill',cn:'生产单'},
				{en:'find-moneyflow',cn:'出纳流水'}]},
		other:{cn:'其他',value:[
			{en:'findall-salebill',cn:'查看所有销售单'},
			{en:'findall-bringbill',cn:'查看所有采购单'},
			{en:'findall-customer',cn:'查看所有客户'},
			{en:'findall-supplier',cn:'查看所有供应商'}],v1:[
				{en:'find-statement',cn:'查看往来对账'},
				{en:'find-store',cn:'查看库存盘点'},
				{en:'print-set',cn:'打印设置'},
				{en:'down-table',cn:'下载表格'}],v2:[
					{en:'find-salebyvolume',cn:'查看销量统计'},
					{en:'find-salebycustomer',cn:'查看客户分析'},
				]}
	}
})(window.kaidanbao);