/** http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	//自动完成特殊存储
	var repository;
	var product_auto=[],auto={ customer:[],supplier:[],clerk:[] };
	var headLen=0,cidCache;
	var pushHead=function(cid){
		var customer=k.cache.get(cid),len=0,v;
		if(!customer || !customer.quotation) return;
		product_auto.reverse(); 
		for(var pid in customer.quotation){
			v = k.cache.fixed[pid];
			if(v && v.st !=='d'){ len++;
				product_auto.push({value:v.name+' ['+(v.number ||'')+' ￥'+customer.quotation[pid][0]+'/'+(v.unit ||'')+'] '+(customer.quotation[pid][1]||'')
					,data:{id:v._id,price:customer.quotation[pid][0],spec:customer.quotation[pid][1],c:'fixed-sug'}});
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
	var fill_auto = function(table_name){
		var v1=k.cache.fixed_by_table[table_name],v;
		if(table_name=='product'){
			product_auto.length = 0;
		    for(var j in v1){ v = k.cache.get(v1[j]);
				if(v && v.st !== 'd'){
					product_auto.push({value:v.name+' ['+(v.number ||'')+' ￥'+(v.price||'')+'/'+(v.unit ||'')+'] '+(v.spec||'')
						,data:{id:v._id}});
				}
			}
//		    product_auto.reverse();
		}else{
			var has_rit = (table_name==='clerk')||k.aspect.role_check('findall-'+table_name);
			auto[table_name].length = 0;
			for(var j in v1){ v = k.cache.get(v1[j]);
				if(!has_rit&&(k.cache.get(v._id).staff_clerk != k.cache.sign.staff.bind_clerk)) continue; 
				if(v && v.st !== 'd') auto[table_name].push({value:v.name+' '+(v.name_py ||''),data:{id:v._id}});
			};
//			auto[table_name].reverse();
		}
	}
	var auto_result_count=0;
	var auto_id_cache={};
	var white_ids,black_ids;//限定白名单，禁止黑名单{id:1,...};
	k.aspect.atcp={
		white_black:function(w,b){
			white_ids = w;
			black_ids = b;
		},
		set_repository:function(repos){
			repository = repos;
		},
		bind:function(jq_target,table_name,option,limit_ids){
			option = option || {};
			u.extend(option,{
				minChars: 0,
				tabDisabled: true,
				showNoSuggestionNotice: false,
				lookup:(table_name=='product'?product_auto:auto[table_name]),
				onSearchStart:function(){
					auto_id_cache={};
					auto_result_count=0;
				},
				lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
					if(option.has_store_check){//检查库存是否为正
						if(!repository[suggestion.data.id] || repository[suggestion.data.id][0]<=0) return false;
					}
					if(option.skip_fixed && suggestion.data.c){//跳过固定列表
						return false;
					}
                	if(auto_result_count > 50) return false;
                	if(auto_id_cache[suggestion.data.id]) return false;
                	else auto_id_cache[suggestion.data.id]=1;
                	
                	if(white_ids && !white_ids[suggestion.data.id]) return false;
                	if(black_ids && black_ids[suggestion.data.id]) return false;
                	
                	var qs = queryLowerCase.split(' ');
		        	for(var i in qs){
		        		if(qs[i] && suggestion.value.toLowerCase().indexOf(qs[i]) === -1) return false; 
		        	}
		        	
		        	auto_result_count++;
		        	return true;
                },
                formatResult: function (suggestion, currentValue) {
                    var ps = currentValue.split(' '),pattern,safe = suggestion.value;
                    for(var i in ps){
                    	if(ps[i]){
                    		pattern = '(' + u.escapeRegExChars(ps[i]) + ')';
                    		safe = safe.replace(new RegExp(pattern, 'gi'), '<b>$1<\/b>');
                    	}
                    }
//                    return ((repository&&repository[suggestion.data.id])?('<div style="float:right">'+repository[suggestion.data.id][0]+'</div>'):'')+
                    return safe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/&lt;(\/?b)&gt;/g, '<$1>');
                }
			});
			if(option.lookup.length == 0) fill_auto(table_name);
			jq_target.autocomplete(option);
		},
		product_auto:function(pd,cid){
			if(product_auto.length==0){
			    fill_auto('product');
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
				var v1 = k.cache.get(pd);
				popHead();
				if(v1.st === 'd'){
					$('input.product').autocomplete('clear');
					fill_auto('product');
				}else{
					if(v1){
						product_auto.unshift({value:v1.name+' ['+(v1.number ||'')+' ￥'+v1.price+'/'+(v1.unit ||'')+']'
							,data:{id:v1._id}});
					}
				}
				pushHead(cidCache);
			}
			return product_auto;
		},
		auto:function(ct,table){
			if(table==='customer' || table==='supplier' || table==='clerk'){
				if(auto[table].length == 0){
					fill_auto(table);
				}
				if(ct){
					var v1 = k.cache.get(ct);
					if(v1.st === 'd'){
						$('input.'+table).autocomplete('clear');
						fill_auto(table);
					}else{
						var has_rit = (table==='clerk')||k.aspect.role_check('findall-'+table);
						if(v1&&(has_rit||(k.cache.get(v1._id).staff_clerk == k.cache.sign.staff.bind_clerk))){
							auto[table].unshift({value:(v1.name ||'')+' '+(v1.name_py ||''),data:{id:v1._id}});
						}
					}
				}
				return auto[table];
			}
		},
	}
})(window.kaidanbao);
