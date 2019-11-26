/**
 * 加载中...
 * 订单处理中心
 */
(function(k){
	var u = k.utils;
	var p = k.plugin;
	var addup=function(c){
		if(k.cache.sign.need_create_db){
			k.aspect.bill_center.save();
			c();
		}else{
			k.dao.query_bill(function(err,bill){
				if(err){
					k.aspect.bill_center.save();
					c();
				}else{
					k.aspect.bill_center.handle(bill);
				}
			});
		}
	}
	p.loading={
		change_inc:function(inc){
			if(inc) k.cache.sign.user.inc=inc;
			else inc = k.cache.sign.user.inc;
			$('#layout div.lay-top li.home a').html(inc);
			$(document).attr("title",inc+'('+k.cache.get(k.cache.sign.staff.bind_clerk).name+')');
		},
		init:function(){
			if(k.cache.sign.user_id&&(!k.cache.sign.session||k.cache.sign.staff.due >= u.date.getTimeFormat(0,'d'))){//必须先登录
				k.dao.init(function(){
					k.syn.init(function(){
						//TODO 前面慎用缓存
						k.cache.init(function(){
							addup(function(){
								window.kaidanbao.plugin.loading.change_inc();
								window.location.hash = '#/home/welcome';
								k.cache.sign.loaded = true;
								k.aspect.noty.close_progress();
								if(k.cache.sign.session){
									//联网时，服务器推送
									k.syn.sse.init();
									k.aspect.bill_center.save();
									k.aspect.log('在线登录');
								}else k.aspect.log('离线登录');
							});
						});
					});
				});
			}else{
				window.location.href = './';
			}
		}
	}
	
	/**订单处理中心：单个订单处理，订单统计数据缓存，统计数据保存
	 * 每个月进行一次全量保存
	 * customer&supplier s1601~9912  : 对账{b1:[订单编号,总金额,定金,结款状态]...}
						 t1601~9912  : 统计{p1:销售额,p2...}
						 quotation   : 六个月内的报价单{p1:[price,spec,time]}
	 * account    t1601~9912  : '每个月的收支{a0:销售收入额,b0:采购支出额,...}',
	 * product    t1601~9912  : '{r1:[销售数，额，利润，采购数，额，盘点盈亏数，额，调拨盈亏数，额，生产盈亏数，额],...}',
	 *
	 * repository t1601~9912  : '每个月月底的{p1:[库存数,成本价],...}',
	 */
	var customer_dz={},customer_tj={},customer_q={};
	var supplier_dz={},supplier_tj={},supplier_q={};
	var account_tj={};
	var product_tj={};
	var moneyflow_dz=[];//追加定金，临时保存
	
	var repository;
	var sd,td;
	//TODO 下面这句以后要删除
	var dr;
//	var check_price={};//{r1:{s1601:{p1:[price,time]}}}
	var lm_map={};
	
	var bill_cache={};//订单缓存，防止重复
	var bill_acton={//不同类型订单处理函数
		salebill:function(bill,rc){
			var cid = bill.customer_id;
			var bid = bill._id;
			var rid = (dr||bill.repository_id);
			var aid = bill.account_id;
			var sd0 = 't'+k.cache.dates.mt[0],j,d,pid,prof;
			
			//统计每天销售额
			var date;
			if(bill.ct > u.date.getDayTimes(-51)){
				date = u.date.getTimeFormat(bill.ct,'d');
				k.cache.day_chart[date] = k.cache.day_chart[date]||0;
				k.cache.day_chart[date] += bill.amount;
			}
			//日期运算
			if(!lm_map[cid]){
				lm_map[cid] = k.cache.get(bill.customer_id);
				if(lm_map[cid]) lm_map[cid].lm = bill.lm;
			}else if(lm_map[cid].lm && lm_map[cid].lm < bill.lm){
				lm_map[cid].lm = bill.lm;
			}
			//保存客户对账单
			if(bill.settlement === 'q'){
				customer_dz[cid]     = customer_dz[cid]     || {};
				customer_dz[cid][sd] = customer_dz[cid][sd] || {};
				if(!customer_dz[cid][sd][bid]) customer_dz[cid][sd][bid]=[bill.number,bill.amount,bill.payamount||0];
			}
			//保存账户统计
			if(bill.payamount){
				account_tj[aid] = account_tj[aid]||{};
				account_tj[aid][td] = account_tj[aid][td]||{};
				
				account_tj[aid][td].a0 = account_tj[aid][td].a0 || 0;
				account_tj[aid][td].a0 += bill.payamount;
			}
			for(j in bill.detail){
				j = parseInt(j);
				d = bill.detail[j],pid=d[0];//[product_id,spec,count,price,amount,remark]
				//日期运算
				if(!lm_map[pid]){
					lm_map[pid] = k.cache.get(d[0]);
					if(lm_map[pid]) lm_map[pid].lm = bill.lm+j;//+j，避免lm值相同
				}else if(lm_map[pid].lm && lm_map[pid].lm < bill.lm){
					lm_map[pid].lm = bill.lm+j;
				}
				//报客户价单保存
				customer_q[cid] = customer_q[cid]||{};
				customer_q[cid]['quotation'] = customer_q[cid]['quotation']||{};
				
				if(!customer_q[cid]['quotation'][pid] 
					|| customer_q[cid]['quotation'][pid][2]<bill.ct) {
					customer_q[cid]['quotation'][pid] = [d[3],d[1],bill.ct];
				}
				
				//TODO 以后要将parseFloat 删掉
				prof = parseFloat(d[6])||(d[4]*k.conf.kdb.default_profit_rate);
				//保存客户统计
				customer_tj[cid] = customer_tj[cid]||{};
				customer_tj[cid][td] = customer_tj[cid][td]||{};
				
				customer_tj[cid][td][pid] = customer_tj[cid][td][pid]||[0,0];
				customer_tj[cid][td][pid][0] += d[4];
				customer_tj[cid][td][pid][1] += prof;
				
				//保存商品统计
				product_tj[pid] = product_tj[pid]||{};
				product_tj[pid][td] = product_tj[pid][td]||{};
				
				if(product_tj[pid][td][rid]) {
					product_tj[pid][td][rid][0] += d[2];
					product_tj[pid][td][rid][1] += d[4];
					product_tj[pid][td][rid][2] += prof;
				}else product_tj[pid][td][rid]=[d[2],d[4],prof,0,0,0,0,0,0,0,0];
				//开单处理
				if(rc) {
					repository[rid] = repository[rid]||{};
					repository[rid][sd0] = k.cache.get(dr||bill.repository_id)[sd0];
					repository[rid][sd0][pid] = repository[rid][sd0][pid]||[0,0];
					repository[rid][sd0][pid][0] -= d[2];
					repository[rid][sd0][pid][1] -= (d[4]-prof);
				}
			}
			//开单处理
			if(rc) {
				if(customer_dz[cid]&&customer_dz[cid][sd]) k.cache.get(bill.customer_id)[sd] = customer_dz[cid][sd];
				if(customer_q[cid]) k.cache.get(bill.customer_id)['quotation'] = customer_q[cid]['quotation'];
			}
		},
		bringbill:function(bill,rc){
			var sid = bill.supplier_id;
			var bid = bill._id;
			var rid = (dr||bill.repository_id);
			var aid = bill.account_id;
			var sd0 = 't'+k.cache.dates.mt[0],j,d,pid;
			//日期运算
			if(!lm_map[sid]){
				lm_map[sid] = k.cache.get(bill.supplier_id);
				if(lm_map[sid]) lm_map[sid].lm = bill.lm;
			}else if(lm_map[sid].lm && lm_map[sid].lm < bill.lm){
				lm_map[sid].lm = bill.lm;
			}
			//保存供应商对账单
			if(bill.settlement === 'q'){
				supplier_dz[sid] = supplier_dz[sid]||{};
				supplier_dz[sid][sd] = supplier_dz[sid][sd]||{};
				
				if(!supplier_dz[sid][sd][bid]) supplier_dz[sid][sd][bid]=[bill.number,bill.amount,bill.payamount||0];
			}
			//保存账户统计
			if(bill.payamount){
				account_tj[aid] = account_tj[aid]||{};
				account_tj[aid][td] = account_tj[aid][td]||{};
				
				account_tj[aid][td].b0 =account_tj[aid][td].b0 ||0;
				account_tj[aid][td].b0 += bill.payamount;
			}
			for(j in bill.detail){
				j = parseInt(j);
				d = bill.detail[j],pid=d[0];//[product_id,spec,count,price,amount,remark]
				//日期运算
				if(!lm_map[pid]){
					lm_map[pid] = k.cache.get(d[0]);
					if(lm_map[pid]) lm_map[pid].lm = bill.lm + j;//+j，避免lm值相同
				}else if(lm_map[pid].lm && lm_map[pid].lm < bill.lm){
					lm_map[pid].lm = bill.lm + j;
				}
				//供应商报价单保存
				supplier_q[sid] = supplier_q[sid]||{};
				supplier_q[sid]['quotation'] = supplier_q[sid]['quotation']||{};
				
				if(!supplier_q[sid]['quotation'][pid] 
					|| supplier_q[sid]['quotation'][pid][2]<bill.ct) {
					supplier_q[sid]['quotation'][pid] = [d[3],d[1],bill.ct];
				}
				//保存供应商统计
				supplier_tj[sid] = supplier_tj[sid]||{};
				supplier_tj[sid][td] = supplier_tj[sid][td]||{};
				
				supplier_tj[sid][td][pid] = supplier_tj[sid][td][pid]||0;
				supplier_tj[sid][td][pid] += d[4];
				//保存商品统计
				product_tj[pid] = product_tj[pid]||{};
				product_tj[pid][td] = product_tj[pid][td]||{};
				
				if(product_tj[pid][td][rid]) {
					product_tj[pid][td][rid][3] +=d[2];
					product_tj[pid][td][rid][4] +=d[4];
				}else product_tj[pid][td][rid]=[0,0,0,d[2],d[4],0,0,0,0,0,0];
				//开单处理
				if(rc) {
					repository[rid] = repository[rid]||{};
					repository[rid][sd0] = k.cache.get(dr||bill.repository_id)[sd0];
					repository[rid][sd0][pid] = repository[rid][sd0][pid]||[0,0];
					repository[rid][sd0][pid][0] += d[2];
					repository[rid][sd0][pid][1] += d[4];
				}
			}
			//开单处理
			if(rc) {
				if(supplier_dz[sid]&&supplier_dz[sid][sd]) k.cache.get(bill.supplier_id)[sd] = supplier_dz[sid][sd];
				if(supplier_q[sid]) k.cache.get(bill.supplier_id)['quotation'] = supplier_q[sid]['quotation'];
			}
		},
		moneyflow:function(bill,rc){
			var sid = bill.supplier_id,cid=bill.customer_id,aid=bill.account_id,i,j,d,org;
			//更改客户对账单
			if(bill.bill_ids){
				if(cid) {
					customer_dz[cid] = customer_dz[cid]||{};
					org = customer_dz[cid];
				}
				if(sid) {
					supplier_dz[sid] = supplier_dz[sid]||{}; 
					org = supplier_dz[sid];
				}
				//开单处理
				if(rc) {
					org =  k.cache.get(sid||cid);
				}
				if(bill.bill_ids.length === 1 && bill.bill_ids[0].length===2){//一条记录
					d = bill.bill_ids[0];
					if(d[1]&&!parseInt(d[1])) d[1] = d[1].substr(1);//TODO 处理旧数据'i'+
					if(rc){
						org[d[0]][d[1]][2] += bill.amount;
						if(org[d[0]][d[1]][2] >= org[d[0]][d[1]][1]-k.conf.kdb.dz_min_dif
								&&org[d[0]][d[1]][2] <= org[d[0]][d[1]][1]+k.conf.kdb.dz_min_dif){
							org[d[0]][d[1]] = 'x';
						}
					}else{
						moneyflow_dz.push([(cid||sid),d[0],d[1],bill.amount,bill._id]);
					}
				}else{
					for(i in bill.bill_ids){
						d = bill.bill_ids[i];
						org[d[0]] = org[d[0]]||{};
						
						for(j=1; j<d.length;j++){
							if(!parseInt(d[j])) d[j] = d[j].substr(1);//TODO 处理旧数据'i'+
							org[d[0]][d[j]] = 'x';
						}
					}
				}
			}
			//保存账户统计
			account_tj[aid] = account_tj[aid]||{};
			account_tj[aid][td] = account_tj[aid][td]||{};
			
			account_tj[aid][td][bill.type||'a0']  = account_tj[aid][td][bill.type||'a0']||0;
			account_tj[aid][td][bill.type||'a0'] += bill.payamount;
			
		},
		checkbill:function(bill,rc){
			var rid = bill.repository_id,pid,j,d;
			var sd0 = 't'+k.cache.dates.mt[0];
			for(j in bill.detail){
//			[[product_id,spec,before_count,after_count,checkprice,count,amount,remark],...],
				d=bill.detail[j];pid = d[0];
				//保存商品统计
				product_tj[pid] = product_tj[pid]||{};
				product_tj[pid][td] = product_tj[pid][td]||{};
				
				if(product_tj[pid][td][rid]) {
					product_tj[pid][td][rid][5] += d[5];
					product_tj[pid][td][rid][6] += d[6];
				}else product_tj[pid][td][rid]=[0,0,0,0,0,d[5],d[6],0,0,0,0];
				//开单处理
				if(rc) {
					repository[rid] = repository[rid]||{};
					repository[rid][sd0] = k.cache.get(rid)[sd0];
					repository[rid][sd0][pid] = repository[rid][sd0][pid]||[0,0];
					repository[rid][sd0][pid][0] += d[5];
					repository[rid][sd0][pid][1] += d[6];
				}
			}
		},
		allotbill:function(bill,rc){
			var coid = bill.callout_id,ciid = bill.callin_id,pid,j,d;
			var sd0 = 't'+k.cache.dates.mt[0];
			for(j in bill.detail){
//				[product_id,spec,count,cost,amount,remark]
				d=bill.detail[j];pid = d[0];
				//保存商品统计
				product_tj[pid] = product_tj[pid]||{};
				product_tj[pid][td] = product_tj[pid][td]||{};
				
				if(product_tj[pid][td][coid]) {
					product_tj[pid][td][coid][7] -= d[2];
					product_tj[pid][td][coid][8] -= d[4];
				}else product_tj[pid][td][coid]=[0,0,0,0,0,0,0,-d[2],-d[4],0,0];
				
				if(product_tj[pid][td][ciid]) {
					product_tj[pid][td][ciid][7] += d[2];
					product_tj[pid][td][ciid][8] += d[4];
				}else product_tj[pid][td][ciid]=[0,0,0,0,0,0,0,d[2],d[4],0,0];
				//开单处理
				if(rc) {
					repository[coid] = repository[coid]||{};
					repository[coid][sd0] = k.cache.get(coid)[sd0];
					repository[coid][sd0][pid] = repository[coid][sd0][pid]||[0,0];
					repository[coid][sd0][pid][0] -= d[2];
					repository[coid][sd0][pid][1] -= d[4];
					
					repository[ciid] = repository[ciid]||{};
					repository[ciid][sd0] = k.cache.get(ciid)[sd0];
					repository[ciid][sd0][pid] = repository[ciid][sd0][pid]||[0,0];
					repository[ciid][sd0][pid][0] += d[2];
					repository[ciid][sd0][pid][1] += d[4];
				}
			}
		},
		productbill:function(bill,rc){
			var rid = bill.repository_id,pid1,pid2,j,d;
			var sd0 = 't'+k.cache.dates.mt[0];
			for(j in bill.detail){
//			[[pid1,cost,count1,amount1,pid2,price,count2,amount2],...],
				d = bill.detail[j];pid1 = d[0];pid2 = d[4];
				//保存商品统计
				product_tj[pid1] = product_tj[pid1]||{};
				product_tj[pid1][td] = product_tj[pid1][td]||{};
				
				product_tj[pid2] = product_tj[pid2]||{};
				product_tj[pid2][td] = product_tj[pid2][td]||{};
				
				if(product_tj[pid1][td][rid]) {
					product_tj[pid1][td][rid][9] -= d[2];
					product_tj[pid1][td][rid][10] -= d[3];
				}else product_tj[pid1][td][rid]=[0,0,0,0,0,0,0,0,0,-d[2],-d[3]];
				
				if(product_tj[pid2][td][rid]) {
					product_tj[pid2][td][rid][9] += d[6];
					product_tj[pid2][td][rid][10] += d[7];
				}else product_tj[pid2][td][rid]=[0,0,0,0,0,0,0,0,0,d[6],d[7]];
				//开单处理
				if(rc) {
					repository[rid] = repository[rid]||{};
					repository[rid][sd0] = k.cache.get(rid)[sd0];
					repository[rid][sd0][pid1] = repository[rid][sd0][pid1]||[0,0];
					repository[rid][sd0][pid1][0] -= d[2];
					repository[rid][sd0][pid1][1] -= d[3];
					
					repository[rid] = repository[rid]||{};
					repository[rid][sd0] = k.cache.get(rid)[sd0];
					repository[rid][sd0][pid2] = repository[rid][sd0][pid2]||[0,0];
					repository[rid][sd0][pid2][0] += d[6];
					repository[rid][sd0][pid2][1] += d[7];
				}
			}
		},
		
	}
	var del_action={
		salebill:function(bill,rc){
			var rid = (dr||bill.repository_id);
			var sd0 = 't'+k.cache.dates.mt[0],j,d,pid;
			
			//统计每天销售额
			var date;
			if(bill.ct > u.date.getDayTimes(-51)){
				date = u.date.getTimeFormat(bill.ct,'d');
				k.cache.day_chart[date] = k.cache.day_chart[date]||0;
				k.cache.day_chart[date] -= bill.amount;
			}
			//保存客户对账单
			if(bill.settlement === 'q'){
				customer_dz[bill.customer_id][sd][bill._id]='x';
			}
			//修改库存
			for(j in bill.detail){
				d = bill.detail[j],pid=d[0];//[product_id,spec,count,price,amount,remark]
				repository[rid] = repository[rid]||{};
				repository[rid][sd0] = k.cache.get(dr||bill.repository_id)[sd0];
				repository[rid][sd0][pid] = repository[rid][sd0][pid]||[0,0];
				repository[rid][sd0][pid][0] += d[2];
				repository[rid][sd0][pid][1] += (d[4]-(parseFloat(d[6])||(d[4]*k.conf.kdb.default_profit_rate)));
			}
		},
		bringbill:function(bill,rc){
			var rid = (dr||bill.repository_id);
			var sd0 = 't'+k.cache.dates.mt[0],j,d,pid;
			//保存客户对账单
			if(bill.settlement === 'q'){
				supplier_dz[bill.supplier_id][sd][bill._id]='x';
			}
			//修改库存
			for(j in bill.detail){
				d = bill.detail[j],pid=d[0];//[product_id,spec,count,price,amount,remark]
				repository[rid] = repository[rid]||{};
				repository[rid][sd0] = k.cache.get(dr||bill.repository_id)[sd0];
				repository[rid][sd0][pid] = repository[rid][sd0][pid]||[0,0];
				repository[rid][sd0][pid][0] -= d[2];
				repository[rid][sd0][pid][1] -= d[4];
			}
		},
		checkbill:function(bill,rc){
			var rid = (dr||bill.repository_id),pid,j,d;
			var sd0 = 't'+k.cache.dates.mt[0];
			for(j in bill.detail){
//				[[product_id,spec,before_count,after_count,checkprice,count,amount,remark],...],
				d = bill.detail[j];pid = d[0];
				//开单处理
				if(rc) {
					repository[rid] = repository[rid]||{};
					repository[rid][sd0] = k.cache.get(dr||bill.repository_id)[sd0];
					repository[rid][sd0][pid] = repository[rid][sd0][pid]||[0,0];
					repository[rid][sd0][pid][0] -= d[5];
					repository[rid][sd0][pid][1] -= d[6];
				}
			}
		},
		allotbill:function(bill,rc){
			var coid = bill.callout_id,ciid = bill.callin_id,pid,j,d;
			var sd0 = 't'+k.cache.dates.mt[0];
			for(j in bill.detail){
//				[product_id,spec,count,cost,amount,remark]
				d=bill.detail[j];pid = d[0];
				//开单处理
				if(rc) {
					repository[coid] = repository[coid]||{};
					repository[coid][sd0] = k.cache.get(coid)[sd0];
					repository[coid][sd0][pid] = repository[coid][sd0][pid]||[0,0];
					repository[coid][sd0][pid][0] += d[2];
					repository[coid][sd0][pid][1] += d[4];
					
					repository[ciid] = repository[ciid]||{};
					repository[ciid][sd0] = k.cache.get(ciid)[sd0];
					repository[ciid][sd0][pid] = repository[ciid][sd0][pid]||[0,0];
					repository[ciid][sd0][pid][0] -= d[2];
					repository[ciid][sd0][pid][1] -= d[4];
				}
			}
		},
		productbill:function(bill,rc){
			var rid = bill.repository_id,pid1,pid2,j,d;
			var sd0 = 't'+k.cache.dates.mt[0];
			for(j in bill.detail){
//			[[pid1,cost,count1,amount1,pid2,price,count2,amount2],...],
				d = bill.detail[j];pid1 = d[0];pid2 = d[4];
				//开单处理
				if(rc) {
					repository[rid] = repository[rid]||{};
					repository[rid][sd0] = k.cache.get(rid)[sd0];
					repository[rid][sd0][pid1] = repository[rid][sd0][pid1]||[0,0];
					repository[rid][sd0][pid1][0] += d[2];
					repository[rid][sd0][pid1][1] += d[3];
					
					repository[rid] = repository[rid]||{};
					repository[rid][sd0] = k.cache.get(rid)[sd0];
					repository[rid][sd0][pid2] = repository[rid][sd0][pid2]||[0,0];
					repository[rid][sd0][pid2][0] -= d[6];
					repository[rid][sd0][pid2][1] -= d[7];
				}
			}
		},
	}
	
	var sd0='s'+k.cache.dates.mt[0];td0='t'+k.cache.dates.mt[0];
	var sd1='s'+k.cache.dates.mt[1];td1='t'+k.cache.dates.mt[1];
	var sd2='s'+k.cache.dates.mt[2];td2='t'+k.cache.dates.mt[2];
	var sd3='s'+k.cache.dates.mt[3];td3='t'+k.cache.dates.mt[3];
	var sd4='s'+k.cache.dates.mt[4];td4='t'+k.cache.dates.mt[4];
	var sd5='s'+k.cache.dates.mt[5];td5='t'+k.cache.dates.mt[5];
	//@comp 统计处理时不传，开单处理时要传
	var bill_handle=function(bill,comp){
		if(bill_cache[bill._id] && !comp) return;
		else bill_cache[bill._id]=1;
		
		if(bill.ct >= k.cache.dates.mts[0]){       sd=sd0;td=td0;
		}else if(bill.ct >= k.cache.dates.mts[1]){ sd=sd1;td=td1;
		}else if(bill.ct >= k.cache.dates.mts[2]){ sd=sd2;td=td2;
		}else if(bill.ct >= k.cache.dates.mts[3]){ sd=sd3;td=td3;
		}else if(bill.ct >= k.cache.dates.mts[4]){ sd=sd4;td=td4;
		}else if(bill.ct >= k.cache.dates.mts[5]){ sd=sd5;td=td5;
		}else return;
		if(bill.st === 'd'){//删除订单处理
			if(comp) del_action[bill.tn](bill,comp);
		}else{
			if(k.cache.sign.user_id == 3 && !dr) {
				//TODO 金辉铝业的默认仓库
				dr=8024000002;
			}
//			if(k.cache.sign.user_id == 21 && !dr) {
//				//TODO 开发测试时金辉铝业的默认仓库
//				dr=96000002;
//			}
			bill_acton[bill.tn](bill,comp);
		}
	}
	var repository_count=function(){//计算库存
//p1 s1601{r1:[销售数，额，毛利润，采购数，额，盘点盈亏数，额，调拨盈亏数，额，生产消耗数，额，生产出品数，额],}
		if(!repository){
			repository={};
			var r,rid,pid,v,sdc,sdm,pr1,pr2;
			for(var n in k.cache.name_cache.repository){
				//repository s1601 每个月月底的{p1:[库存数,库存额],...}
				r = k.cache.get(k.cache.name_cache.repository[n]);
				repository[r._id] = r;
			}
			
			for(var i=k.conf.kdb.ms;i>=0;i--){
				sdc = 't'+k.cache.dates.mt[i];
				sdm = 't'+k.cache.dates.mt[i+1];
				for(rid in repository){//深拷贝
					repository[rid][sdc]  = JSON.parse(JSON.stringify(repository[rid][sdm] || {}));
				}
				for(pid in product_tj){
					if(product_tj[pid][sdc]){
						for(rid in product_tj[pid][sdc]){
							v = product_tj[pid][sdc][rid]; 
							repository[rid][sdc][pid]    = repository[rid][sdc][pid] || [0,0];
							repository[rid][sdc][pid][0] += (-  v[0]   +v[3]+v[5]+v[7]+v[9]);
							repository[rid][sdc][pid][1] += (v[2]-v[1] +v[4]+v[6]+v[8]+v[10]);
							if(repository[rid][sdc][pid][0]===0) delete repository[rid][sdc][pid];
						}
					}
				}
			}
		}
	}
	var save=function(){
		repository_count();
		var sd0='s'+k.cache.dates.mt[0];
		var sds='s'+k.cache.dates.mt[k.conf.kdb.ms];
		
		var upc={},ups={},up,id,prop;
		var sd,cid,sid,aid,pid,rid,props;
		var cust,v;
		for(cid in customer_dz){
			upc[cid] = upc[cid]||{props:[]};
			cust = k.cache.get(cid);
			for(sd in customer_dz[cid]){ 
				upc[cid]['props'].push(sd);
				if(sd >= sds){
					cust[sd] = customer_dz[cid][sd];
				}else{
					cust[sd] = cust[sd]||{};
					for(var bid in customer_dz[cid][sd]){
						v = customer_dz[cid][sd][bid];
						if(v === 'x'){
							cust[sd][bid] = 'x';
						}
					}
				}
//				customer_dz[cid][sd] = cust[sd];
			}
		}
		for(cid in customer_tj){
			upc[cid] = upc[cid]||{props:[]};
			cust = k.cache.get(cid);
			for(sd in customer_tj[cid]){
				cust[sd] = customer_tj[cid][sd];
				upc[cid]['props'].push(sd);
			}
		}
		for(cid in customer_q){ 
			k.cache.get(cid).quotation = customer_q[cid].quotation;
			//quotation不上传服务器
//			upc[cid] = upc[cid]||{props:[]}; 
//			upc[cid]['props'].push('quotation'); 
		}
		//-----------------------------------------
		for(sid in supplier_dz){
			ups[sid] = ups[sid]||{props:[]};
			cust = k.cache.get(sid);
			for(sd in supplier_dz[sid]){
				ups[sid]['props'].push(sd); 
				if(sd >= sds){
					cust[sd] = supplier_dz[sid][sd];
				}else{
					cust[sd] = cust[sd]||{};
					for(var bid in supplier_dz[sid][sd]){
						v = supplier_dz[sid][sd][bid];
						if(v === 'x'){
							cust[sd][bid] = 'x';
						}
					}
				}
			}
		}
//		moneyflow_dz.push([sid,sd,bid,amount,mid]);
		for(var i in moneyflow_dz){
			v = moneyflow_dz[i];
			cust = k.cache.get(v[0]);

			if(cust.tn === 'customer'){
				upc[v[0]] = upc[v[0]]||{props:[]};
				up = upc[v[0]];
			}else if(cust.tn === 'supplier'){
				ups[v[0]] = ups[v[0]]||{props:[]};
				up = ups[v[0]];
			}
			if(cust && cust[v[1]] &&cust[v[1]][v[2]] && cust[v[1]][v[2]]!=='x'
					&& (!cust[v[1]][v[2]][4] || !cust[v[1]][v[2]][4][v[4]])){

				up.props.push(v[1]);
				
				cust[v[1]][v[2]][4] = cust[v[1]][v[2]][4]||{};
				cust[v[1]][v[2]][4][v[4]] = v[3];
				
				cust[v[1]][v[2]][2] += v[3];
				if(cust[v[1]][v[2]][2] >= cust[v[1]][v[2]][1]-k.conf.kdb.dz_min_dif
						&& cust[v[1]][v[2]][2] <= cust[v[1]][v[2]][1]+k.conf.kdb.dz_min_dif){
					cust[v[1]][v[2]] = 'x';
				}
			}
		}
		
		
		for(sid in supplier_tj){
			ups[sid] = ups[sid]||{props:[]};
			cust = k.cache.get(sid);
			for(sd in supplier_tj[sid]){
				cust[sd] = supplier_tj[sid][sd];
				ups[sid]['props'].push(sd);
			}
		}
		for(sid in supplier_q){
			k.cache.get(sid).quotation=supplier_q[sid].quotation;
			//quotation不上传服务器
//			ups[id] = ups[id]||{props:[]}; 
//			ups[sid]['props'].push('quotation');
		}
		//account
		for(aid in account_tj){
			cust = k.cache.get(aid);
			for(sd in account_tj[aid]){ 
				cust[sd] = account_tj[aid][sd];
			}
		}
		//product
		for(pid in product_tj){
			cust = k.cache.get(pid);
			for(sd in product_tj[pid]){ 
				cust[sd] = product_tj[pid][sd];
			}
		}
		//排序
		k.cache.sort();
//		if(!k.cache.sys.save_static_months[sd0] && k.cache.sign.session){
//			k.cache.sys.save_static_months = {};
//			k.cache.sys.save_static_months[sd0]=1;
		if(u.doSomethingMonthly('save_static') && k.cache.sign.session){
			//customer
			for(cid in upc){
				k.dao.save(cid,upc[cid].props); 
			}
			//supplier
			for(sid in ups){ 
				k.dao.save(sid,ups[sid].props); 
			}
			//account
			for(aid in account_tj){ props=[];
				for(sd in account_tj[aid]){ props.push(sd); }
				k.dao.save(aid,props);
			}
			//product
			for(pid in product_tj){ props=[];
				for(sd in product_tj[pid]){ props.push(sd); }
				k.dao.save(pid,props);
			}
			//repository
			for(rid in repository){ props=[];
				for(sd in repository[rid]){ if(sd[0]==='t') props.push(sd); }
				k.dao.save(rid,props);
			}
			
			//8秒钟后upl
			setTimeout(function(){
				k.syn.upl(function(err,r){
					if(r && r.obj.all){
						k.dao.put('sys',{id:'doSomethingMonthly',value:k.cache.sys.doSomethingMonthly});
					}
				});
			}, 8000);
		}
	}
	k.aspect.bill_center={
		save:save,handle:bill_handle
	}
})(window.kaidanbao);
