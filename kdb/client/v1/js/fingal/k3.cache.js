/**
 * 静态表数据的完整缓存，可直接使用
 * local={
 *  c:ln,//当前登录用户名
 * 	s+[ln]:{},//用户名为ln的用户的信息 pwd,ui,ll,si
 *  u+[ui]:{bi,bw,hw,os,clodop},//当前设备信息
 * }
 */
(function(k){
	var u=k.utils;
	var fixed={},					//所有 f 记录均缓存
		local,clodop,//本地存储
		fixed_by_table={			//分表格存储id，特点：无重复，初始有排序
			setup:[],clerk:[],customer:[],supplier:[],account:[],product:[],repository:[],
		},
		name_cache={
			customer:{},
			product:'', //产品名字可以重复
			supplier:{},
			clerk:{},
			account:{},
			repository:{}
		},
		fixed_page={   //固定表页面缓存，特点：无重复
			customer:[],supplier:[],account:[],product:[],clerk:[],repository:[],
			customer_len:0,supplier_len:0,account_len:0,product_len:0,clerk_len:0,repository_len:0,
		},
		dynamic_page={},//动态表页面缓存，每个表保存一个月的缓存
		setup={},//分类{a0:{},a2:{},...,b0:{},b1:{}}
		sign={   //登录参数，
//			fastprint:0,        //无需预览直接打印
//			user_id   :0,		//当前本地库所属用户id
//			staff_id  :0,	    //当前登录的客户staffid
//			box_id  :0,		    //当前本地数据库序号，用户用户记录id前缀@k.dao.getId()
//			need_create_db  :0, //是否需要新建数据库
//			month_length:0,		//用户从注册到目前的月份数
//			session:{token,usb},//会话信息
//			user:{}  //客户信息，含用户列表
//			loaded:false,//已登录且loading完成
//			online:{}//在线用户{usb:1}
		},
		dates={//相关时间常量
			m_t: [], //['2016-09','2016-08','2016-07',...]
			m_t_map:{},//{'2016-09':0,'2016-08':1,'2016-07':2,...}
			mt : [],//['1609','1608','1607',...]
			mt_map:{},//{'1609':0,'1608':1,'1607':2,...}
			mts: [], //[1476360544555,1476360546422,...]对应m_t每个月的开始时间戳
			mts_max:2548944000000, //2050/10/10
		},
		sys={   //系统参数,需要持久化到本地库，用于同步控制，离线识别，每次登陆后全部加载
//			index_id:0,		  //当前用户记录id后缀序号@k.dao.getId()
//			syn_fixed_last_time :0, //最后静态表同步时间戳
//			syn_dynamic_last_time :0, //最后动态表同步时间戳
//			save_static_months :0, //保存统计数据的月份{s1601:1,s1602:0}
		},day_chart={};//每天统计
	
	//初始化时间常量
	dates.m_t = k.utils.date.get_before_yms(30);
	for(var n in dates.m_t){
		n = parseInt(n);
		dates.m_t_map[dates.m_t[n]] = n;
		dates.mt.push(dates.m_t[n].substr(2).replace('-',''));
		dates.mt_map[dates.mt[n]] = n;
		dates.mts.push(new Date(dates.m_t[n].replace('-','/')+'/1').getTime());
	}
	
	var put = function(value,up){
		if(value.tp === 'f'){
			if(up) u.extend(fixed[value._id],value,true);
			else fixed[value._id] = value;
			
			if(name_cache[value.tn] && value.name) name_cache[value.tn][value.name]=value._id;
			if(!up && fixed_by_table[value.tn]) fixed_by_table[value.tn].push(value._id);
			if(!up && fixed_page[value.tn]) fixed_page[value.tn].push(value._id);
		}
		return fixed[value._id];
	}
	k.cache={
		fixed:fixed,name_cache:name_cache,dynamic:dynamic_page,fixed_page:fixed_page,
		sign:sign,dates:dates,sys:sys,clodop:clodop,day_chart:day_chart,
		local:function(val){
			if(val){
				local = val;
				localStorage.setItem('k',JSON.stringify(val));
			}else {
				if(localStorage['k']){
					if(val === '') localStorage.removeItem('k');
					if(!local) local = JSON.parse(localStorage['k']);
				}
				return local || {};
			}
		},
		setup:function(type){
			return fixed[setup[type]] || '';
		},
		get:function(id){return fixed[id] || ''},//防止undefine
		put:put,
		fixed_by_table:fixed_by_table,
		init:function(comp){
			sign.month_length = Math.ceil((new Date().getTime()-sign.user.ct)/2629800000);
			k.dao.queryAllFixed(function(err,r){
				if(r){ if(!fixed[r._id]) put(r);
				}else{
					var value,i,v,rid,aid;
					for(i in fixed_by_table['setup']){
						value = fixed[fixed_by_table['setup'][i]];
						setup[value.type]=value._id;
					}
					if(!setup.role){//插入角色字段
						k.dao.addOne(k.conf.preinsert.role,function(err,r){
							setup.role=r._id;
						});
					}
					if(!setup.classify){//插入分类字段
						k.dao.addOne(k.conf.preinsert.classify,function(err,r){
							setup.classify=r._id;
						});
					}
					if(fixed_by_table.account.length==0){//插入现金账号
						aid = k.dao.addOne(k.conf.preinsert.xianjin);
					}
					if(fixed_by_table.repository.length==0){//插入主仓库
						k.conf.preinsert.mainstock['t'+dates.mt[0]]={};//库存赋值，防止第一次用户空指针
						rid = k.dao.addOne(k.conf.preinsert.mainstock);
					}
					if(!setup.setting){//插入设置字段
						k.conf.preinsert.setting.value.repository_id = rid;
						k.conf.preinsert.setting.value.account_id = aid;
						k.dao.addOne(k.conf.preinsert.setting,function(err,r){
							setup.setting=r._id;
						});
					}
					comp();
				}
			});
		},sort:function(){
			for(var tn in fixed_by_table){//排序
				fixed_by_table[tn].sort(function(a,b){
					return fixed[a].lm > fixed[b].lm;
				});
			}
		}
	}
})(window.kaidanbao);