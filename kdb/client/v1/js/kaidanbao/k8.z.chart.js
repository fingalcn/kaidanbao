/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	
	p.salebyvolume={
		release:function(){ $('#layout div.lay-main div.salebyvolume').remove(); },
		reload:function(){ 
			p.salebyvolume.init();
			setTimeout(function(){
				$('#layout div.lay-main div.salebyvolume').removeAttr('hidden');
			}, 200);
		},
		init:function(){
			if(!k.aspect.role_check('find-salebyvolume')){
				$('#layout div.lay-main').append('<div hidden class="salebyvolume"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
			$('#layout div.lay-main').append('<div hidden class="salebyvolume"><div id="sbv-chart1"></div><div id="sbv-chart2"></div><div id="sbv-chart3"></div></div>');
			var width = $('#layout div.lay-main div.salebyvolume').width();
			var height = $('#layout div.lay-main div.salebyvolume').height();
			var fs = parseInt($('div').eq(0).css('font-size'));
			
			document.getElementById('sbv-chart1').style.width = (width*0.95 + 'px');
			document.getElementById('sbv-chart1').style.height = (height*0.31)+'px';
			
			document.getElementById('sbv-chart2').style.width = (width*0.95 +'px');
			document.getElementById('sbv-chart2').style.height = (height*0.31)+'px';

			document.getElementById('sbv-chart3').style.width = (width*0.95 +'px');
			document.getElementById('sbv-chart3').style.height = (height*0.31)+'px';
			// 基于准备好的dom，初始化echarts实例
	        var myChart1 = echarts.init(document.getElementById('sbv-chart1'),'wonderland');
			var myChart2 = echarts.init(document.getElementById('sbv-chart2'),'wonderland');
			var myChart3 = echarts.init(document.getElementById('sbv-chart3'),'wonderland');

			//t1601~9912  : 统计{p1:[销售额,利润],p2...}
			var c_arr = k.cache.fixed_by_table.customer;
			var m_arr = k.utils.date.get_before_yms(60).reverse();
			var mon_arr=[],quar_arr=[],year_arr=[],mon_sum=0,quar_sum=0,year_sum=0;
			var mon,cust,mon_data=[],quar_data=[],year_data=[],ym,year;
			for(var ima in m_arr){
				mon_sum=0;
				ym = m_arr[ima].substr(2).replace('-','');
				year = parseInt(m_arr[ima].substr(0,4));
				mon = parseInt(m_arr[ima].substr(5));
				for(var ica in c_arr){
					cust = k.cache.get(c_arr[ica]);
					if(cust['t'+ym]){
						for(var pid in cust['t'+ym]){
							mon_sum += cust['t'+ym][pid][0];
						}
					}
				}
				mon_arr.push(m_arr[ima]);
				mon_data.push(parseInt(mon_sum));
				if(ima == 59){
					if(mon == 1){//年度
						year_arr.push(year-1);
						year_data.push(parseInt(year_sum));
						year_sum = 0;
					}
					year_arr.push(year);
					year_data.push(parseInt(year_sum + mon_sum));
				}else{
					if(mon == 1){//年度
						year_arr.push(year-1);
						year_data.push(parseInt(year_sum));
						year_sum = mon_sum;
					}else{
						year_sum += mon_sum;
					}
				}
				if(mon < 4){//一季度
					quar_sum += mon_sum;
					if(mon==3 || ima == 59){
						quar_arr.push(year+'一季度');
						quar_data.push(parseInt(quar_sum));
						quar_sum = 0;
					}
				}else if(mon < 7){//二季度
					quar_sum += mon_sum;
					if(mon==6 || ima == 59){
						quar_arr.push(year+'二季度');
						quar_data.push(parseInt(quar_sum));
						quar_sum = 0;
					}
				}else if(mon < 10){//三季度
					quar_sum += mon_sum;
					if(mon==9 || ima == 59){
						quar_arr.push(year+'三季度');
						quar_data.push(parseInt(quar_sum));
						quar_sum = 0;
					}
				}else{//四季度
					quar_sum += mon_sum;
					if(mon==12 || ima == 59){
						quar_arr.push(year+'四季度');
						quar_data.push(parseInt(quar_sum));
						quar_sum = 0;
					}
				}
			}
	        // 指定图表的配置项和数据
			var grid={ left:'6%', right:'5%', bottom:'13%', top:'18%' };
			var tooltip={ trigger: 'axis',axisPointer : {type : 'shadow'} };
			// 使用刚指定的配置项和数据显示图表。
	        myChart1.setOption({
	        	title: { text: '月度销量',textStyle:{fontSize:fs+2}},grid:grid,tooltip:tooltip,
	        	xAxis: { data: mon_arr.slice(35) },yAxis: {},
	        	series: [{name: '销售额',type: 'line',data: mon_data.slice(35),
	        		label:{normal:{show:true}},
	                markLine : {data : [{type : 'average', name: '平均值'}]}
	            }]
	        });
	        myChart2.setOption({
	        	title: { text: '季度销量',textStyle:{fontSize:fs+2}},grid:grid,tooltip:tooltip,
	        	xAxis: { data: quar_arr.slice(11) },yAxis: {},
	        	series: [{name: '销售额',type: 'bar',data: quar_data.slice(11),
	        		label:{normal:{show:true,position:'top'}},
	        		markLine : {data : [{type : 'average', name: '平均值'}]}
	        	}]
	        });
	        myChart3.setOption({
	        	title: { text: '年度销量',textStyle:{fontSize:fs+2}},grid:grid,tooltip:tooltip,
	        	xAxis: { data: year_arr.slice(1) },yAxis: {},
	        	series: [{name: '销售额',type: 'bar',data: year_data.slice(1),
	        		label:{normal:{show:true,position:'top'}},
	        		markLine : {data : [{type : 'average', name: '平均值'}]}	
	        	}]
	        });
			
		},
	}
	
	p.salebycustomer={
		release:function(){ $('#layout div.lay-main div.salebycustomer').remove(); k.aspect.atcp.white_black();},
		reload:function(){ 
			p.salebycustomer.init();
			setTimeout(function(){
				$('#layout div.lay-main div.salebycustomer').removeAttr('hidden');
			}, 100);
		},
		init:function(){
			if(!k.aspect.role_check('find-salebycustomer')){
				$('#layout div.lay-main').append('<div hidden class="salebycustomer"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
			var box = "#layout div.lay-main div.salebycustomer";
			$('#layout div.lay-main').append('<div hidden class="salebycustomer"> \
					<div class="kc-manage-box"> \
					<input class="s-input" placeholder="客户名称" /><select class="s1"></select> \
					<select class="s2"> \
						<option value="f1"><活跃度></option> \
						<option value="f2">新客户</option> \
						<option value="f7">次新客户</option> \
						<option value="f3">活跃客户</option> \
						<option value="f4">留存客户</option> \
						<option value="f5">流失客户</option> \
						<option value="f6">回留客户</option> \
					</select><button class="s-btn">统计</button> \
					<div><section class="summary-box">综合统计</section></div></div> \
					<div style="float:left;margin-top:43px;" id="sbc-pie21"></div><div style="float:left;margin-top:43px;" id="sbc-pie22"></div><div style="float:left;margin-top:43px;" id="sbc-pie23"></div> \
					<div style="float:left;" id="sbc-chart1"></div> \
					<div style="float:left;" id="sbc-pie31"></div><div style="float:left;" id="sbc-pie32"></div><div style="float:left;" id="sbc-pie33"></div> \
				</div>');
			var width = $(box).width();
			var height = $(box).height();
			var fs = parseInt($('div').eq(0).css('font-size'));
			
			document.getElementById('sbc-chart1').style.width = (width*0.95 + 'px');
			document.getElementById('sbc-chart1').style.height = (height*0.29)+'px';
			// 基于准备好的dom，初始化echarts实例
			var myChart1 = echarts.init(document.getElementById('sbc-chart1'),'wonderland');
			var myPie={};
			['pie21','pie22','pie23','pie31','pie32','pie33'].forEach(function(e){
				document.getElementById('sbc-'+e).style.width = (width*0.31 +'px');
				document.getElementById('sbc-'+e).style.height = (height*0.30)+'px';
				myPie[e] = echarts.init(document.getElementById('sbc-'+e),'wonderland');
			});

			//t1601~9912  : 统计{p1:[销售额,利润],p2...}
			var c_arr = k.cache.fixed_by_table.customer;
			var m_arr = k.utils.date.get_before_yms(60).reverse();
			var mon_arr=[],quar_arr=[],year_arr=[];
			var mon,cust,sum,ym,year;
			
			var cust_arrs={};//cid:{t:总额,y2017:年度额,m201701:月度额,yp2017:{pid:商品年度额}}
			var year33=parseInt(m_arr[59].substr(0,4));
			var my_pie={'pie21':m_arr[57],'pie22':m_arr[58],'pie23':m_arr[59],
					'pie31':year33-2,'pie32':year33-1,'pie33':year33};
			for(var ica in c_arr){
				cust = k.cache.get(c_arr[ica]);
				if(!cust_arrs[cust._id]) cust_arrs[cust._id]={'t':0};
				for(var ima in m_arr){
					sum = 0;
					ym = m_arr[ima].substr(2).replace('-','');
					year = parseInt(m_arr[ima].substr(0,4));
					mon = parseInt(m_arr[ima].substr(5));
					if(cust['t'+ym]){
						for(var pid in cust['t'+ym]){
							sum += cust['t'+ym][pid][0];
							if(!cust_arrs[cust._id]['yp'+year]) cust_arrs[cust._id]['yp'+year]={};
							if(!cust_arrs[cust._id]['yp'+year][pid]) cust_arrs[cust._id]['yp'+year][pid]=0;
							cust_arrs[cust._id]['yp'+year][pid] += cust['t'+ym][pid][0];
						}
					}
					cust_arrs[c_arr[ica]]['t'] += sum;
					if(!cust_arrs[c_arr[ica]]['y'+year]) cust_arrs[c_arr[ica]]['y'+year]=0;
					cust_arrs[c_arr[ica]]['y'+year] += sum;
					if(!cust_arrs[c_arr[ica]]['m20'+ym]) cust_arrs[c_arr[ica]]['m20'+ym]=0;
					cust_arrs[c_arr[ica]]['m20'+ym] += sum;
				}
			}
			var show = function(pie_paris,pie_datas,cust_names,cust_sales,csft){
				// 指定图表的配置项和数据
				var grid={ left:'6%', right:'5%', bottom:'13%', top:'18%' };
				var tooltip={ trigger: 'axis',axisPointer : {type : 'shadow'} };
				['pie21','pie22','pie23','pie31','pie32','pie33'].forEach(function(e){
					pie_paris[e].sort(function(a,b){
						if(csft){
							if(csft[a[0]] && !csft[b[0]]){
								return -1;
							}else if(!csft[a[0]] && csft[b[0]]){
								return 1;
							}else return a[1]<b[1]?1:-1;
						}else return a[1]<b[1]?1:-1; 
					});
					if(!pie_datas[e]) pie_datas[e]=[];
					var tmp_other = 0,count_other = 0;
					var tmp_other2 = 0,count_other2 = 0;
					pie_paris[e].forEach(function(e1,j){ 
						if(e1[1]){
							if(csft){
								if(j>8 || !csft[e1[0]]) {
									if(csft[e1[0]]){
										tmp_other2 += e1[1];count_other2 +=1;
									}else{
										tmp_other += e1[1];count_other +=1;
									}
								}else pie_datas[e].push({name:k.cache.get(e1[0]).name,value:parseInt(e1[1])});
							}else{
								if(j>8) {tmp_other += e1[1];count_other +=1;}
								else pie_datas[e].push({name:k.cache.get(e1[0]).name,value:parseInt(e1[1])});
							}
						}
					});
					if(tmp_other2 > 0) pie_datas[e].push({name:'其余('+count_other2+')',value:parseInt(tmp_other2)});
					if(tmp_other > 0) pie_datas[e].push({name:'其他('+count_other+')',value:parseInt(tmp_other)});

					myPie[e].setOption({
						title: { text: my_pie[e],textStyle:{fontSize:fs+2},x:'left'},
						tooltip : {trigger: 'item',formatter: "{b} <br/>{a} : {c} ({d}%)"},
						series: [{name: '销售额',type: 'pie',
							radius : ['50%','70%'],
							center: ['50%', '60%'],
							data: pie_datas[e]}]
					});
				});
				// 使用刚指定的配置项和数据显示图表。
				myChart1.setOption({
					title: { text: '总销量',textStyle:{fontSize:fs+2}},grid:grid,tooltip:tooltip,
					xAxis: { data: cust_names },yAxis: {},
					series: [{name: '销售额',type: 'bar',data: cust_sales,
						label:{normal:{show:true,position:'top'}}
					}]
				});
			}
			var f1 = function(csft){
				var cs_paris=[],cust_names=[],cust_sales=[];
				var pie_paris={},pie_datas={};
				
				for(var caid in cust_arrs){
					cs_paris.push([caid,cust_arrs[caid]['t']]);
					['pie21','pie22','pie23'].forEach(function(e){
						if(!pie_paris[e]) pie_paris[e]=[];
						pie_paris[e].push([caid,cust_arrs[caid]['m'+my_pie[e].replace('-','')]]);
					});
					['pie31','pie32','pie33'].forEach(function(e){
						if(!pie_paris[e]) pie_paris[e]=[];
						pie_paris[e].push([caid,cust_arrs[caid]['y'+my_pie[e]]]);
					});
				}
				cs_paris.sort(function(a,b){ 
					if(csft){
						if(csft[a[0]] && !csft[b[0]]){
							return -1;
						}else if(!csft[a[0]] && csft[b[0]]){
							return 1;
						}else return a[1]<b[1]?1:-1;
					}else return a[1]<b[1]?1:-1; 
				});
				for(var i=0;i<16;i++){
					if(cs_paris[i] ){
						if(csft){
							if(csft[cs_paris[i][0]]){
								cust_names.push(k.cache.get(cs_paris[i][0]).name);
								cust_sales.push(parseInt(cs_paris[i][1]));
							}
						}else{
							cust_names.push(k.cache.get(cs_paris[i][0]).name);
							cust_sales.push(parseInt(cs_paris[i][1]));
						}
					}
				}
				show(pie_paris,pie_datas,cust_names,cust_sales,csft);
			}
			var f2 = function(page_cid){//月度商品排行，月度总销量，年度商品排行
				var cus = k.cache.get(page_cid);
				var cust_names=[],cust_sales=[];
				var pie_paris={},pie_datas={};
				
				['pie21','pie22','pie23'].forEach(function(e){
					if(!pie_paris[e]) pie_paris[e]=[];
					var tj = cus['t'+my_pie[e].substr(2).replace('-','')];
					for(var pid in tj){
						pie_paris[e].push([pid,tj[pid][0]]);
					}
				});
				
				for(var i=0;i<15;i++){
					cust_names.push(m_arr[45+i]);
					cust_sales.push(parseInt(cust_arrs[page_cid]['m'+m_arr[45+i].replace('-','')] || 0));
				}
				
				['pie31','pie32','pie33'].forEach(function(e){
					if(!pie_paris[e]) pie_paris[e]=[];
					var tj = cust_arrs[page_cid]['yp'+my_pie[e]];
					for(var pid in tj){
						pie_paris[e].push([pid,tj[pid]]);
					}
				});
				show(pie_paris,pie_datas,cust_names,cust_sales);
			}
			var f3 = function(){
				//给客户分类
				var cust,mts = k.cache.dates.mts,mt = k.cache.dates.mt;
				//f1所有，f2新客户，f3活跃客户，f4留存客户，f5流失客户，f6回留客户
				var cs_name={
						f2:'新客户：近三个月内的新增客户',
						f7:'次新：三个月前半年内的新增客户',
						f3:'活跃：连续三个月购货的客户',
						f4:'留存：近三个月有购货的老客户',
						f5:'流失：近三个月未购货的老客户',
						f6:'回留：近三个月有购货的流失客户'}
				var cs_ft = {f2:{},f7:{},f3:{},f4:{},f5:{},f6:{}};
				var cs_ftc = {f2:0,f7:0,f3:0,f4:0,f5:0,f6:0};
				for(var ica in c_arr){
					cust = k.cache.get(c_arr[ica]);
					if(cust.ct > mts[2]) {
						cs_ft['f2'][c_arr[ica]] = 1;
						cs_ftc['f2'] += 1;
					}
					if(cust.ct < mts[2] && cust.ct > mts[5]) {
						cs_ft['f7'][c_arr[ica]] = 1;
						cs_ftc['f7'] += 1;
					}
					if(cust['t'+mt[1]] && cust['t'+mt[2]] && cust['t'+mt[3]]){
						cs_ft['f3'][c_arr[ica]]=1;
						cs_ftc['f3'] += 1;
					}
					if(cust.ct <= mts[2] && (cust['t'+mt[0]] || cust['t'+mt[1]] || cust['t'+mt[2]])){
						cs_ft['f4'][c_arr[ica]]=1;
						cs_ftc['f4'] += 1;
					}
					if(!(cust['t'+mt[0]] || cust['t'+mt[1]] || cust['t'+mt[2]])){
						cs_ft['f5'][c_arr[ica]]=1;
						cs_ftc['f5'] += 1;
					}
					if(cust.ct <= mts[2]  && (cust['t'+mt[0]] || cust['t'+mt[1]] || cust['t'+mt[2]]) &&
						(!(cust['t'+mt[1]] || cust['t'+mt[2]] || cust['t'+mt[3]]) ||
						 !(cust['t'+mt[2]] || cust['t'+mt[3]] || cust['t'+mt[4]]) ||
						 !(cust['t'+mt[3]] || cust['t'+mt[4]] || cust['t'+mt[5]]))){
						cs_ft['f6'][c_arr[ica]]=1;
						cs_ftc['f6'] += 1;
					}
				}
				var cid = $(box+' input.s-input').attr('data-cid');
				var cs_s1 = $(box+' select.s1').val();
				var cs_s2 = $(box+' select.s2').val();
				if(cid) {
					$(box+' section.summary-box').html('客户名称：'+k.cache.get(cid).name);
					f2(cid);
				}else{
					if(cs_s2 == 'f5'){
						my_pie={'pie21':m_arr[54],'pie22':m_arr[55],'pie23':m_arr[56],
								'pie31':year33-2,'pie32':year33-1,'pie33':year33};
					}else{
						my_pie={'pie21':m_arr[57],'pie22':m_arr[58],'pie23':m_arr[59],
								'pie31':year33-2,'pie32':year33-1,'pie33':year33};
					}
					var cust,map = {a:'mold',b:'classify'};
					if(cs_s2 == 'f1'){
						if(cs_s1 != 'all'){
							cs_ft['f1']  ={};
							cs_ftc['f1'] = 0;
							for(var ica in c_arr){
								cust = k.cache.get(c_arr[ica]);
								if(cs_s1[1] == 'n' && !cust[map[cs_s1[0]]]) {
									cs_ft['f1'][c_arr[ica]] = 1;
									cs_ftc['f1'] += 1;
								}
								if(cs_s1[1] != 'n' && cust[map[cs_s1[0]]] == cs_s1) {
									cs_ft['f1'][c_arr[ica]] = 1;
									cs_ftc['f1'] += 1;
								}
							}
						}else cs_ftc['f1'] = c_arr.length;
						
						$(box+' section.summary-box').html('综合统计');
						$(box+' input.s-input').attr('placeholder',$(box+' select.s1 option:selected').html().replace('&lt;','').replace('&gt;','')+'：'+cs_ftc[cs_s2]+'位客户');
					}else{
						if(cs_s1 != 'all'){
							for(var key in cs_ft[cs_s2]){
								cust = k.cache.get(key);
								if(cs_s1[1] == 'n' && cust[map[cs_s1[0]]]) {
									cs_ft[cs_s2][key] = 0;
									cs_ftc[cs_s2] -= 1;
								}
								if(cs_s1[1] != 'n' && cust[map[cs_s1[0]]] != cs_s1) {
									cs_ft[cs_s2][key] = 0;
									cs_ftc[cs_s2] -= 1;
								}
							}
						}
						
						$(box+' section.summary-box').html(cs_name[cs_s2]);
						$(box+' input.s-input').attr('placeholder',$(box+' select.s1 option:selected').html().replace('&lt;','').replace('&gt;','')+'：'+cs_ftc[cs_s2]+'位'+$(box+' select.s2 option:selected').html());
					}
					k.aspect.atcp.white_black(cs_ft[cs_s2]);
					f1(cs_ft[cs_s2]);
				}
			}
			$(box+' .s-btn').click(function(){
				$(box+' input.s-input').removeAttr('data-cid');
				$(box+' input.s-input').val('');
				$(box+' select.s1').val('all');
				$(box+' select.s2').val('f1');
				f3();
			});
			$(box+' select').change(function(){
				$(box+' input.s-input').removeAttr('data-cid');
				$(box+' input.s-input').val('');
				f3();
			});
	        k.aspect.atcp.bind($(box+' input.s-input'),'customer',{
				onSelect:function(s){
					$(this).val(k.cache.get(s.data.id).name);
					$(this).attr('data-cid',s.data.id);
					f3();
				},
				onSearchComplete:function(){
					$(box+' input.s-input').removeAttr('data-cid');
					if(!$(box+' input.s-input').val()) f3();
				}
			});
	        k.aspect.manage.classic($(box+' select.s1'),'customer');
	        f3();
		},
	}
})(window.kaidanbao);
