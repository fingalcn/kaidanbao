/**
 * 数据库连接
 */
var log = require('./log');
var userFixedDB,userDynamicDB,adminDB;//db
var u =require('./utils');
var c; // config

//获取自增id
function getId(key,comp,doc){
	if(doc && doc._id){
		comp(doc._id);
	}else{
		adminDB.collection('conf', {strict:true}, function(err, conf_col) {
			conf_col.findOneAndUpdate({_id:key}, {$inc:{value:1}},{
				returnOriginal: false
				, upsert: true
			},function(err,r){
				if(err){
					log.warn(err,'dao.getId');
					comp(); 
				}else{
					comp(r.value.value);
				}
			});
		});
	}
}
//admin，普通用户操作ADMIN数据库
var admin = {
	//新增一条记录
	addOne:function(collName,doc,comp){
		getId(collName+'_id',function(id){
			if(id){
				doc._id = id;
				doc.ct = u.getNow();
				doc.lm = doc.ct;
				adminDB.collection(collName, {strict:true}, function(err, col) {
					col.insertOne(doc, function(err,r){
						if(err) {
							log.warn(err,'dao.admin.addOne');
							comp();
						}else{
							comp(doc._id);
						}
					});
				});
			}else comp();
		},doc);
	},
	find:function(collName,filter,comp){
		adminDB.collection(collName, {strict:true}, function(err, col) {
			col.find(filter).toArray(function(err, items) {
				if(err) {
					log.warn(err,'dao.admin.findOne');
					comp();
				}else{
					comp(items);
				}
			});
		});
	},
	updOne:function(collName,doc,comp){
		adminDB.collection(collName, {strict:true}, function(err, col) {
			if(err){
				log.warn(err,'dao.admin.updOne');
				comp();
			}else{
				var key,param={$set:{}};
				for(key in doc){
					if(key === '_id') continue;
					if(doc[key] === '') {
						if(!param.$unset) param.$unset={};
						param.$unset[key]=1;
					}else{
						if(doc[key] || doc[key]===0) param.$set[key] = doc[key];
					}
				}
				param.$set['lm'] = u.getNow();
				col.updateOne({_id:doc._id}, param, {upsert:false}, function(err, r) {
					if(err) {
						log.warn(err,'dao.admin.updOne');
						comp();
					}else{
						comp(doc._id);
					}
				});
			}
      	});
	},
	findNextBox:function(comp,conf_name,oid){
		if(oid){
			comp(oid);
		}else{
			getId(conf_name || 'box_id',function(id){
				comp(id);
			});
		}
	}
};
//user数据库
var user = {
	addOne:function(doc,comp){
		var user_db=(doc.tp==='f'?userFixedDB:userDynamicDB);
		getId('user_default_rowid',function(id){
			if(id){
				doc._id = id;
				user_db.collection('erp', {strict:true}, function(err, col) {
					if(err){
						log.warn(err,'dao.user.addOne');
						comp();
					}else{
						doc.lm=u.getNow();
						col.insertOne(doc, function(err,r){
							if(err) {
								log.warn(err,'dao.user.addOne');
								comp();
							}else{
								comp(id);
							}
						});
					}
				});	
			}else comp();
		},doc);
	},
	//更新，字段为''表示删除该字段
	updOne:function(doc,comp){
		var user_db=(doc.tp==='f'?userFixedDB:userDynamicDB);
		user_db.collection('erp', {strict:true}, function(err, col) {
			if(err){
				log.warn(err,'dao.user.updOne');
				comp();
			}else{
				var key,param={$set:{}};
				for(key in doc){
					if(key === '_id') continue;
					if(doc[key] === '') {
						if(!param.$unset) param.$unset={};
						param.$unset[key]=1;
					}else{
						if(doc[key] || doc[key]===0) param.$set[key] = doc[key];
					}
				}
				param.$set['lm'] = u.getNow();
				col.updateOne({_id:doc._id}, param, {upsert:true}, function(err, r) {
					if(err) {
						log.warn(err,'dao.user.updOne');
						comp();
					}else{
						comp(doc._id);
					}
				});
			}
      	});
	},
	/**
	 * 按条件查找
	 * @param param
	 * @param comp
	 */
	findManyWithinTimeFrame:function(param,comp){
		var user_db=(param.tp==='f'?userFixedDB:userDynamicDB);
		var set = {'ui':param.ui};
		if(param.left) set['lm']={$gte:param.left};// >
		if(param.right) {
			if(set['lm']) set['lm'].$lte = param.right; // <
			else set['lm']={$lte:param.right};
		}
		//查找多条记录
		user_db.collection('erp', {strict:true}, function(err, col) {
			if(err){
				log.warn(err,'dao.user.findManyWithinTimeFrame');
				comp();
			}else{
				col.find(set).toArray(function(err, docs) {
					if(err){
						log.warn(err,'dao.user.findManyWithinTimeFrame');
						comp();
					}else{
						comp(docs);
					}
				});
			}
		});
	},
};
//manage，用户管理
//var manage={
	/**
	 * 查找所有master库的表：user,staff,cdkey
	 * @param param
	 * @param comp
	 */
//	findAll:function(coll_name,comp){
//		adminDB.collection(coll_name, {strict:true}, function(err, col) {
//			if(err){
//				log.warn(err,'dao.manage.findAll');
//				comp();
//			}else{
//				col.find({}).toArray(function(err, docs) {
//					if(err){
//						log.warn(err,'dao.user.findManyAfterLastModify');
//						comp();
//					}else{
//						comp(docs);
//					}
//				});
//			}
//		});
//	},
//};

//@config 必须
function connect(){
	var mongoClient = require('mongodb').MongoClient;
	if(c.DB.username){//服务端需认证用户名
		mongoClient.connect(c.DB.ADMIN.URL, function(err, mdb) {
			if(err) {
			}else{
				mdb.admin().authenticate(c.DB.username, c.DB.password, function(err, result) {
					if(err) { log.warn(err,'dao.connect');
					}else adminDB = mdb;
				});
			}
		});
		mongoClient.connect(c.DB.USER_FIXED.URL, function(err, mdb) {
			if(err) {
			}else{
				mdb.admin().authenticate(c.DB.username, c.DB.password, function(err, result) {
					if(err) { log.warn(err,'dao.connect');
					}else userFixedDB = mdb;
				});
			}
		});
		mongoClient.connect(c.DB.USER_DYNAMIC.URL, function(err, mdb) {
			if(err) {
			}else{
				mdb.admin().authenticate(c.DB.username, c.DB.password, function(err, result) {
					if(err) { log.warn(err,'dao.connect');
					}else userDynamicDB = mdb;
				});
			}
		});
	}else{
		//本地连接
		mongoClient.connect(c.DB.ADMIN.URL, function(err, mdb) {
			if(err) {log.warn(err,'dao.connect');
			}else{ adminDB = mdb;}
		});
		mongoClient.connect(c.DB.USER_FIXED.URL, function(err, mdb) {
			if(err) {log.warn(err,'dao.connect');
			}else{ userFixedDB = mdb;}
		});
		mongoClient.connect(c.DB.USER_DYNAMIC.URL, function(err, mdb) {
			if(err) {log.warn(err,'dao.connect');
			}else{ userDynamicDB = mdb;}
		});
	}
}
//初始化
function init(config){
	if(c) return;
	c = config;
	connect();
}
module.exports.admin = admin;
module.exports.user = user;

exports.init = init;
