/**
 * TODO 静态资源服务器，开发测试使用  7c4a9011a01e8d8a1522e2a1e38c9d59
 */
var db,mongoClient = require('mongodb').MongoClient;;

mongoClient.connect('mongodb://localhost:27017/kdb_master', function(err, mdb) {
	if(err) {console.error("connect err:", err);}
	else{ db = mdb;}
//	db.createCollection('staff');
//	db.close();
	db.collection('cdkey', {strict:true}, function(err, col) {
//		console.dir(col);
//		db.close();
//		col.find().toArray(function(err, items) {
//			if(err) {
//				console.error("find err:", err);
//			}else{
//				console.dir(items);
//			}
//			db.close();
//		});
//		col.updateOne({_id:34}, {$set:{due:'2015-02-13'}}, {upsert:false}, function(err, r) {
//			if(err) {									
//				console.error("update err:", err);
//			}else{
//				console.dir(r);
//			}f7496e334573f3d07aee4adfaf708ca0
//			db.close();
//		});
		col.updateOne({st:'u'}, {$set:{st:'v'}}, {upsert:false}, function(err, r) {
			if(err) {
				console.error("update err:", err);
			}else{
				console.dir(r);
			}
			db.close();
		});
//		col.deleteMany({_id:2}, function(err,r){
//			console.dir(err);
//			console.dir(r);
//			db.close();
//		});
//		col.findOneAndUpdate({_id:'user_id'}, {$inc:{value:1}},{
//	        returnOriginal: false
//	    },function(err,r){
//	    	console.dir(err);
//	    	console.dir(r);
//	    	console.log(r.value.value);
//	    	db.close();
//	    });
//		{"_id":1000,"d":"161210","k":"SVXA-HOXH-FOOH"}
//		{"_id":3000,"d":"161211","k":"HVXC-FPZT-OXIX"}
//		{"_id":3001,"d":"161211","k":"HVXC-VYPT-NJEQ"}
//		{"_id":3002,"d":"161211","k":"HVXC-WUCU-FFZB"}
//		col.insertOne({"_id":1000,"d":"161211","k":"SVXA-HOXH-FOOH"}, function(err,r){
//			console.dir(err);
//			console.dir(r);
//			db.close();
//		});
//		col.insertOne({"_id":"user_default_rowid","value":100000100000}, function(err,r){
//			console.dir(err);
//			console.dir(r);
//			db.close();
//		});
	});
	
});

