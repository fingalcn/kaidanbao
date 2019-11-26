/**
 * http://usejsdoc.org/
 * 
 * 遵循如下原则：
 * 保存模型：1缓存->2本地库->3上传库->4网络云端
 * 静态数据全部缓存，尽量使用缓存操作。动态数据全部不缓存
 * 
 * 仅支持以下两种查询
 * 1，启动时，查询所有静态表数据
 * 2，按表名-时间查询动态记录
 * 
 * 支持以下两种变动
 * 1，添加一条记录
 * 2，更新一条记录（删除）
 * 
 */
(function(k){
	var u = k.utils;
	var db,db_upd;
//=================================数据库增删改查=====================================
	//获取
	var get=function(table,id,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.get(id).onsuccess=function(v){
		      if(comp) {comp(v.target.result); }
		    };
		});
	};
	//计数
//	var count=function(table,comp,upddb){
//		var mydb = upddb?db_upd:db;
//		mydb.doTransaction(table,function(e){
//			e.count().onsuccess=function(v){
//				if(comp) {comp(v.target.result); }
//			};
//		});
//	};
	//删除
	var del=function(table,id,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e['delete'](id).onsuccess=function(v){
				if(comp) comp(v.target.result);
			};
		});
	}
	//新增,
	var add=function(table,value,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.add(value).onsuccess=function(r){
				//e.target.result 是id
				if(comp) {comp(r.target.result); }
			};
		});
	};
	//新增/修改，put
	var put=function(table,value,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.put(value).onsuccess=function(r){
				//e.target.result 是id
				if(comp) {comp(r.target.result); }
			};
		});
	};
	//更新
	var upd=function(table,value,comp,upset,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.get(value._id).onsuccess=function(v){
				var r=v.target.result;
				if(r){
					u.extend(r,value,true);
					put(table,r,function(){
						if(comp) {comp(r); }
					},upddb);
				}else if(upset){
					add(table,value,function(){
						if(comp) {comp(value); }
					},upddb);
				}else{
					if(comp) {comp(); }
				}
				
			};
		});
	};
	//条件查询
//	var getArray=function(table,index,value,comp){
//	  db.doTransaction(table,function(e){
//		  var ind,range=null,r; //从存储对象中获取索引对象
//		  if(index) {ind=e.index(index); }
//		  else {ind = e; }
////		  IDBKeyRange.lowerBound(any,bool)
////		  IDBKeyRange.upperBound(any,bool)
////		  IDBKeyRange.bound(any,any,bool,bool)
////		  IDBKeyRange.only(any)
//		  if(value) {range=IDBKeyRange.bound(value[0],value[1],true,true); }
//		  //从索引对象中遍历数据[next,prev]
//		  ind.openCursor(range,'prev').onsuccess=function(e){
//		    r=e.target.result;
//		    if(r){
//				comp(null,r.value);
//				r['continue']();
//			}else{
//				comp(true,null);
//			}
//		  };
//	  });
//	};
//==================================打开数据库==================================
	var openDB = function(comp){
		var cn=indexedDB.open(k.conf.db.name+k.cache.sign.user_id,1);
		cn.onupgradeneeded=function(e){
		  db=e.target.result;
		  
		  db.createObjectStore('info',{keyPath:'_id'}).createIndex('lm','lm');//基本资料
		  db.createObjectStore('bill',{keyPath:'_id'}).createIndex('ct','ct'); //订单表
		  
		  db.createObjectStore('log',{keyPath:'_id'}).createIndex('ct','ct');//操作日志，存本地不上传
		  db.createObjectStore('sys',{keyPath:'id'});//sys_table
		  
		  k.cache.sign.need_create_db = true;
		  //下列表为历史兼容表
//		  db.createObjectStore('salebill',{keyPath:'_id'}).createIndex('ct','ct'); //销售单
//		  db.createObjectStore('bringbill',{keyPath:'_id'}).createIndex('ct','ct');//采购单
//		  db.createObjectStore('moneyflow',{keyPath:'_id'}).createIndex('ct','ct');//资金流水
//		  db.createObjectStore('checkbill',{keyPath:'_id'}).createIndex('ct','ct');//盘点单
//		  db.createObjectStore('allotbill',{keyPath:'_id'}).createIndex('ct','ct');//调拨单
		  //以下表暂时无用
		  db.createObjectStore('manuals',{keyPath:'_id'}).createIndex('ct','ct');//使用手册、常见问题、我的提问、单独使用，不在同步体系
		};
		cn.onsuccess=function(e){
			db=e.target.result;
			db.doTransaction=function(t,f){
				var ta=db.transaction(t,"readwrite");
				ta.onerror=function(){}; //TODO handle error
				f(ta.objectStore(t));
			};
			//upddb
			var cn_upd=indexedDB.open(k.conf.db.name+'upd'+k.cache.sign.user_id,1);
			cn_upd.onupgradeneeded=function(e){
				db_upd=e.target.result;
				db_upd.createObjectStore('upd',{keyPath:'_id'});
			};
			cn_upd.onsuccess=function(e){
				db_upd=e.target.result;
				db_upd.doTransaction=function(t,f){
					var ta=db_upd.transaction(t,"readwrite");
					ta.onerror=function(){}; //TODO handle error
					f(ta.objectStore(t));
				};
				comp();
			};
		};
	};
//==================================内部方法==================================
	var id_count=0,first_get_id=true;
	var getId=function(n,comp,has_id){
		if(has_id) {
			comp([has_id]);
			return [has_id];
		}else{
			var r = [],i;id_count+=n;
			for(i=0;i<n;i++){ r.push(k.cache.sign.box_id*1000000+(++k.cache.sys.index_id)); }
			if(first_get_id){
				id_count += 7;
				first_get_id = false;
			}
			if(id_count > 7){
				put('sys',{id:'index_id',value:k.cache.sys.index_id+id_count},function(){
					id_count = 0;
					comp(r);
				});
			}else{
				comp(r);
			}
			return r;
		}
	};
// =================================================================
	k.dao = {
		get:function(table,id,comp,upddb){
			get(upddb?'upd':k.conf.table[table]._lo,id,comp,upddb);
		},
		add:function(table,value,comp,upddb){
			add(upddb?'upd':k.conf.table[table]._lo,value,comp,upddb);
		},
		put:function(table,value,comp,upddb){
			put(upddb?'upd':k.conf.table[table]._lo,value,comp,upddb);
		},
		upd:function(table,value,comp,upset,upddb){
			upd(upddb?'upd':k.conf.table[table]._lo,value,comp,upset,upddb);
		},
		delupddb:function(id){
			del('upd',id,null,1);
		},
		clearupddb:function(){
			db_upd.doTransaction('upd',function(e){
				e.clear();
			});
		},
		/**新增一条记录
		 * @value 记录
		 * @conp 回调函数
		 * @model 1缓存->2本地库->3上传库->4网络云端(默认)
		 * 参数暂时不支持为：1缓存
		 * 假定每次均成功（首先进行缓存）
		 */
		addOne:function(value,comp,model){
			k.cache.dynamic[value.tn]=null;
			k.cache.dynamic['moneyflow']=null;
			if(!value.si) value.si=k.cache.sign.staff_id;
			value.ui=k.cache.sign.user_id;
			value.ct=u.date.getNow();
			value.lm=value.ct;
			value.tp=k.conf.table[value.tn]._tp;
			var table = k.conf.table[value.tn]._lo;
			return getId(1,function(ids){
				value._id=ids[0];
				k.cache.put(value);
				if(model === 1){
//					k.cache.put(value);
					if(comp) comp(false,value);
				}else if(model === 2){
					add(table,value,function(id){
//						if(id) k.cache.put(value);
						if(comp) {comp(!id,value); }
					});
				}else if(model === 3){
					add(table,value,function(id){
						if(id){
							add('upd',value,function(id2){
//								if(id2) k.cache.put(value);
//								else del(table,id);
								if(comp) comp(!id2,value);
							},1);
						}else if(comp) comp(true,value);
					});
				}else {
					add(table,value,function(id){
						if(id){
//							k.cache.put(value);
							add('upd',value,null,1);
							k.net.api('/user/addOne',value,function(err){
								if(err){
								}else{
									del('upd',id,null,1);
								}
							});
						}
						if(comp) {comp(!id,value); }
					});
				}
			},value._id)[0];
		},
		/**更新一条记录
		 * @value 更新字段集合
		 * @conp 回调函数
		 * @model 1缓存->2本地库->3上传库->4网络云端(默认)
		 * 参数暂时不支持为：1缓存
		 */
		updOne:function(value,comp,model){
			k.cache.dynamic[value.tn]=null;
			k.cache.dynamic['moneyflow']=null;
			value.lm=u.date.getNow();
			value.mi=k.cache.sign.staff_id;//最后修改的staff_id
			value.tp= k.conf.table[value.tn]._tp;
			var table = k.conf.table[value.tn]._lo;
			//1静态记录缓存更新
			if(model===1) {
				comp(false,k.cache.put(value,1));
			}else if(model === 2){
				upd(table,value,function(v2){
					if(v2) k.cache.put(v2,1);
					if(comp) {comp(!v2,v2); }
				});
			}else if(model === 3){
				upd(table,value,function(v3){
					if(v3){
						k.cache.put(v3,1);
						upd('upd',value,function(v){
							if(comp) comp(!v,v3);
						},true,1);
					}else if(comp) {comp(true,v3); }
				});
			}else{
				upd(table,value,function(v4){
					if(v4){
						k.cache.put(v4,1);
						upd('upd',value,function(v){
							k.net.api('/user/updOne',v,function(err){
								if(err){
								}else{
									del('upd',v._id,null,1);
								}
							});
							if(comp) {comp(!v,v4); }
						},true,1);
					}else if(comp) {comp(true,v4); }
				});
			}
		},
		/**
		 * 直接保存缓存的fiexed记录
		 */
		save:function(id,props){
			var i,v=k.cache.get(id),up={_id:v._id,tn:v.tn,tp:v.tp};
			if(!v._id) return;
			for(var i in props){
				up[props[i]] = v[props[i]];
			}
			upd('upd',up,null,true,1);
//			upd(k.conf.table[v.tn]._lo,v);
		},
		/**
		 * 查询最近四个月订单记录，初始化统计使用
		 */
		query_bill:function(comp){
			db.doTransaction('bill',function(e) {
				e.index('ct').openCursor(
						IDBKeyRange.bound(k.cache.dates.mts[k.conf.kdb.ms],k.cache.dates.mts_max, true, false), 
						'prev').onsuccess = function(e){
					var r = e.target.result;
					if (r) {
						comp(null, r.value);
						r['continue']();
					} else {
						comp(true);
					}
				};
			});
		},
		queryAllFixed : function(comp) {
			db.doTransaction('info', function(e) {
				var r; // 从存储对象中获取索引对象
				e.index('lm').openCursor(null, 'prev').onsuccess = function(e) {
					r = e.target.result;
					if (r) {
						comp(null, r.value);
						r['continue']();
					} else {
						comp(true, null);
					}
				};
			});
		},
		/** @month YYYY-MM */
		queryDynamicByMonth : function(table, month, comp,sort) {
			if(k.cache.dynamic[table] && k.cache.dynamic[table][month]) {
				comp(true);
			}else{
				k.cache.dynamic[table] = {};
				var m = k.cache.dates.m_t_map[month],arrs={};
				var start = k.cache.dates.mts[m],end = k.cache.dates.mts_max;
				if(m > 0) end = k.cache.dates.mts[m-1];
				var range = IDBKeyRange.bound(start, end, true, false);
				db.doTransaction(k.conf.table[table]._lo,function(e) {
					e.index('ct').openCursor(range, (sort || 'prev')).onsuccess = function(e){
						var r = e.target.result; // 从存储对象中获取索引对象
						if (r) {
							arrs[r.value.tn] = arrs[r.value.tn] || [];
							if(table==='moneyflow'&&r.value.payamount&&(r.value.tn==='salebill'||r.value.tn==='bringbill')){
								arrs['moneyflow'] = arrs['moneyflow'] || [];
								arrs['moneyflow'].push({number:r.value.number,
									type:(r.value.tn==='salebill'?'a0':'b0'),
									account_id:r.value.account_id,amount:r.value.payamount,
									supplier_id:r.value.supplier_id,customer_id:r.value.customer_id,
									cashier_id:r.value.cashier_id,order_id:r.value.order_id});
							}
							arrs[r.value.tn].push(r.value);
							comp(null, r.value);
							r['continue']();
						} else {
							k.cache.dynamic[table][month]=arrs[table]||[];
							comp(true);
						}
					};
				});
			}
		},
		query_logs:function(comp){
			db.doTransaction('log',function(e) {
				e.index('ct').openCursor(
						IDBKeyRange.bound(k.cache.dates.mts[1], k.cache.dates.mts_max, true, false)
						, 'prev').onsuccess = function(e){
					var r = e.target.result; // 从存储对象中获取索引对象
					if (r) {
						comp(null, r.value);
						r['continue']();
					} else {
						comp(true);
					}
				};
			});
		},
		addLog:function(value){
			value.si=k.cache.sign.staff_id;
			value.ui=k.cache.sign.user_id;
			value.ct=u.date.getNow();
			value.lm=value.ct;
			value._id=value.ct;
			value.tp='l';
			value.tn='log';
			add('log',value);
		},
		query_upddb:function(comp){
			db_upd.doTransaction('upd', function(e) {
				var r; // 从存储对象中获取索引对象
				e.openCursor().onsuccess = function(e) {
					r = e.target.result;
					if (r) {
						comp(null, r.value);
						r['continue']();
					} else {
						comp(true, null);
					}
				};
			});
		},
		query_sys:function(comp){
			db.doTransaction('sys', function(e) {
				var r; // 从存储对象中获取索引对象
				e.openCursor().onsuccess = function(e) {
					r = e.target.result;
					if (r) {
						comp(null, r.value);
						r['continue']();
					} else {
						comp(true, null);
					}
				};
			});
		},
		/** @table upddb or sys */
//		queryAll : function(table, comp,upddb) {
//			var mydb = upddb?db_upd:db;
//			mydb.doTransaction(table, function(e) {
//				var r; // 从存储对象中获取索引对象
//				e.openCursor().onsuccess = function(e) {
//					r = e.target.result;
//					if (r) {
//						comp(null, r.value);
//						r['continue']();
//					} else {
//						comp(true, null);
//					}
//				};
//			});
//		},
		del:function(table,id,comp,up_name){
			var up = {_id:id,tn:table,st:'d'};
			if(up_name) up.name = up_name;//修改名称;
			k.dao.updOne(up,comp);
		},
		init:function(comp){
			openDB(function(){
				comp();
			});
		}
	};
})(window.kaidanbao);