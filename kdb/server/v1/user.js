/**
 * 业务逻辑，主要接口
 */
var u=require('./utils');
var log = require('./log');
var sse = require('./sse');
var c,user_dao;

/**
 */
function addOne(req_json,comp){
	if(req_json.p._id){
		req_json.p.ui = req_json.s.ui;
		user_dao.addOne(req_json.p,function(id){
			if(id){
				comp(200);
				sse.broad('addOne',req_json.p,req_json.s.usb);
			}else{
				comp(500);
			}
		});
	}else{
		comp(400);
	}
};
function updOne(req_json,comp){
	if(req_json.p._id){
		user_dao.updOne(req_json.p,function(id){
			if(id){
				comp(200);
				sse.broad('updOne',req_json.p,req_json.s.usb);
			}else{
				comp(500);
			}
		});
	}else{
		comp(400);
	}
};
function down(req_json,comp){
	req_json.p.ui=req_json.s.ui;
	user_dao.findManyWithinTimeFrame(req_json.p,function(docs){
		if(docs){
			comp(200,'ok',docs);
		}else{
			comp(500);
		}
	});
};
function upl(req_json,comp){
	var p=req_json.p,i,len = p.length,ids=[];
	for(i in p){
		p[i].ui = req_json.s.ui;
		if(!p[i]._id){ len--;continue; }
		user_dao.updOne(p[i],function(id){
			if(id) ids.push(id);
			if(--len == 0){//complete
				if(ids.length == 0) comp(500);
				else if(ids.length == p.length) comp(200,'ok',{all:true});
				else comp(200,'ok',{ids:ids});
			}
		});
	}
}

//初始化
function init(config){
	if(c) return;
	c = config;
	user_dao   = require('./dao').user;
}
exports.addOne = addOne;
exports.updOne = updOne;
exports.down = down;
exports.upl = upl;
exports.init = init;