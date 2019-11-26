/** http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var clodop;
	var default_ff = "微软雅黑,Tahoma,'Microsoft YaHei','Helvetica Neue',Helvetica,'PingFang SC','Hiragino Sans GB',Arial,sans-serif";
	//初始化C-LODOP
	if(window.getCLodop && typeof window.getCLodop == 'function'){ 
		if(window.location.host === 'kaidanbao.cn'){//kaidanbao.cn
			clodop = window.getCLodop();
			clodop.SET_LICENSES("","74A38B4E525F7B4F72F7AAC816C77A87","C94CEE276DB2187AE6B65D56B3FC2848","");
			k.cache.clodop=clodop;
		}else if(window.location.host === 'kaidan.me'){//kaidan.me
			clodop = window.getCLodop();
			clodop.SET_LICENSES("","BFEED6994BBE99CEEC3AEFCA727BD890","C94CEE276DB2187AE6B65D56B3FC2848","");
			k.cache.clodop=clodop;
		}else{//ip:114.55.175.184
			clodop = window.getCLodop();
			clodop.SET_LICENSES("","4238F68FB8E637EDCBB7AD6B042D5BAC","C94CEE276DB2187AE6B65D56B3FC2848","");
			k.cache.clodop=clodop;
		}
	}
	var ad=function(){//暂时取消广告
//		$('#print td.color').html($('#print td.color').html()+'（开单宝：www.kaidan.me）');
	}
	var print=function(select,must_clodop){
		$('#print .style0[hidden]').remove();
		if(clodop){
			clodop.PRINT_INIT("kdb_print_style1");
			clodop.SET_PRINT_PAGESIZE (1,2100,1400,"");
			clodop.ADD_PRINT_HTM('1mm','5mm','100%','100%',document.getElementById("print").innerHTML);
			if(select) clodop.PRINTA();
			else clodop.PRINT();
			return true;
		}else if(!must_clodop) window.print();
	}
	var change=function(printStyle,box,box1){
		if(printStyle == '1'){
			if(box){
				$(box+' table').css('height','88mm');
				$(box+' .print').css('font-family',default_ff);
				$(box+' td.dx').attr('colspan','4');
				$(box+' td.notice').attr('colspan','8');
				$(box+' td.name').css('width','49mm').css('text-align','left');
			}
			if(box1){
				$(box1+' th.mingchen').css('width','29%');
				$(box1+' .bianhao').attr('hidden','hidden');
				$(box1+' td.dx').attr('colspan','3');
			}
		}else{
			if(box){
				$(box+' table').css('height','75mm');
				$(box+' .print').css('font-family','宋体,'+default_ff);
				$(box+' td.dx').attr('colspan','5');
				$(box+' td.notice').attr('colspan','9');
				$(box+' td.name').css('width','31mm').css('text-align','center');;
			}
			if(box1){
				$(box1+' th.mingchen').css('width','20%');
				$(box1+' .bianhao').removeAttr('hidden');
				$(box1+' td.dx').attr('colspan','4');
			}
		}
	}
	var prepare=function(bill,msg){//打印之前执行
		if(bill && bill.payamount) msg = '定金：'+bill.payamount+' 元';
		var pn  = (bill||{}).tn || k.frame.current_plugin,box = '#layout div.'+pn;
		var setting,
		printStyle = '1',
		title = '深圳市开单宝软件科技有限公司',
		tips = '官网：kaidan.me 淘宝店：kaidan.taobao.com 微信公众号：kaidanme QQ：869214342<br />专业研发、销售开单软件，财务软件，进销存。深耕五年，功能齐全，稳定第一。';
		notice = '注：以上货物当面点清，签字即视为结算凭证；对质量有意见请在7天内提出书面异议，过期视为默认。',
		color = '白单存根，红单客户，蓝单回单，黄单结款';
		
		var cs;
		var cs_name = $(box+' input.customer').val()||$(box+' input.supplier').val()||'';
		var sb_name = $(box+' input.saler').val()||$(box+' input.buyer').val()||'';
		var top='';
		var cs_title = '客户名称';
		if(pn==='bringbilling' || pn==='bringbill') cs_title = '供应商';
		if(bill) {
			cs = k.cache.get(bill.customer_id||bill.supplier_id);
			cs_name = cs.name;
			sb_name = k.cache.get(bill.saler_id||bill.buyer_id).name;
			//TODO 向上兼容
			setting=k.cache.setup('setting')[bill.tn+'-print'] || k.cache.setup(bill.tn+'-print');
		}else{
			if(pn === 'salebilling') setting=k.cache.setup('setting')['salebill-print'] || k.cache.setup('salebill-print');
			else if(pn === 'bringbilling') setting=k.cache.setup('setting')['bringbill-print'] || k.cache.setup('bringbill-print');
		}
		if(setting){
			printStyle = setting.printStyle || '1';
			title = setting.title;
			tips = setting.tips;
			notice = setting.notice;
			color = setting.color;
		}
		//含logo和title,tips
		var topall='<div class="topall style0 style2" hidden> \
			<img class="printlogo" onclick="$(\'#uploadprintlogo input\').click();" style="width:22mm;height:22mm;float:left;cursor:pointer;margin-right:5mm;margin-left:3mm;" \
			src="http://'+window.location.host+(k.cache.sign.user.printlogo||'/res/kdb/upload/printlogo/logo.jpg')+'" title="点击更换图片" /><div style="float:left;width:145mm;"><div class="style0 style2 tit">'+title+'</div> \
			<div style="text-align:left;" class="style0 style2 tips" spellcheck="false">'+tips+'</div></div></div>';
		//含客户名称，单号等信息
		var top = '<div class="topd1">'+cs_title+'：'+cs_name+'</div>'+
				  '<div class="style0 style1 topd2" hidden>业务：'+sb_name+'</div>'+
				  '<div class="style0 style2 topd2" hidden>联系方式：'+(cs?(cs.mobile||''):'')+'</div>'+
				  '<div class="topd3">单号：'+(bill?bill.number:$(box+' input.number').val())+'</div>'+
				  '<div class="style0 style2 topd1" hidden>送货地址：'+(cs?(cs.address||''):'')+'</div>'+
				  '<div class="style0 style2 topd2" hidden>结算方式：'+(cs?(cs.settletype||''):'')+'</div>'+
				  '<div class="style0 style2 topd3" hidden>打印日期：'+u.date.getDay()+'</div>';
		var table_th = '<tr><th> </th><th class="style0 style2" hidden>编号</th><th>产品名称</th><th>规格</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th><th>备注</th></tr>';
		var table_list='',prod;
		for(var i=0;i<9;i++){
			if(!bill || (bill && bill.detail[i])){
				table_list+='<tr> \
					<td class="num">'+(i+1)+ '</td> \
					<td class="number style0 style2" hidden>'+(bill?(k.cache.get(bill.detail[i][0]).number||''):$(box+' td.number').eq(i).html())+'</td> \
					<td class="name"><div style="white-space:nowrap;">'+(bill?(k.cache.get(bill.detail[i][0]).name||''):$(box+' td.p_name input').eq(i).val())+'</div></td> \
					<td class="spec"><div style="white-space:nowrap;">'+(bill?bill.detail[i][1]:$(box+' td.p_spec').eq(i).html())+'</div></td> \
					<td class="unit"><div style="white-space:nowrap;">'+(bill?(k.cache.get(bill.detail[i][0]).unit || ''):$(box+' td.p_unit').eq(i).html())+'</div></td> \
					<td class="count"><div style="white-space:nowrap;">'+(bill?bill.detail[i][2]:$(box+' td.count').eq(i).html())+'</div></td> \
					<td class="price"><div style="white-space:nowrap;">'+(bill?bill.detail[i][3]:$(box+' td.p_price').eq(i).html())+'</div></td> \
					<td class="amount"><div style="white-space:nowrap;">'+(bill?bill.detail[i][4].toFixed(2):$(box+' td.amount').eq(i).html())+'</div></td> \
					<td class="remark">'+(bill?bill.detail[i][5]:$(box+' td.remark').eq(i).html())+'</div></td></tr>';
			}else{
				table_list+='<tr><td class="num"><td class="number style0 style2" hidden></td></td><td class="name"></td><td class="spec"></td> \
					<td class="unit"></td><td class="count"></td><td class="price"></td> \
					<td class="amount"></td><td class="remark"></td></tr>';
			}
		}
		var table_bottom = '<tr><td colspan="5" class="dx">'+(bill?('合计：'+u.DX(bill.amount)):$(box+' td.dx').html())+'</td> \
							<td class="count">'+(bill?bill.count:$(box+' td.count-sum').html())+ '</td> \
							<td></td><td class="amount">'+(bill?bill.amount.toFixed(2):$(box+' td.amount-sum').html())+'</td><td class="remark">'+(msg || '')+'</td></tr>';
		var page_bottom='<div style="text-align:left;" class="man style1 style0" hidden> \
					<div>开单员：'+(bill?(k.cache.get(bill.order_id).name || ''):$(box+' input.order').val())+'</div> \
					<div>出纳员：'+(bill?(k.cache.get(bill.cashier_id).name || ''):$(box+' input.cashier').val())+'</div> \
					<div>送货经手人：</div> \
					<div>收货经手人：</div> \
					</div><div style="text-align:left;" class="man style2 style0" hidden> \
					<div>制单：'+(bill?(k.cache.get(bill.order_id).name || ''):$(box+' input.order').val())+'</div> \
					<div>业务：'+(bill?(k.cache.get(bill.saler_id||bill.buyer_id).name || ''):($(box+' input.saler').val()||$(box+' input.buyer').val()))+'</div> \
					<div>送货人：</div> \
					<div>审核：</div> \
					<div>收货单位：</div> \
					</div>';
		var page='<div class="tit style0 style1" hidden>'+title+'</div><div class="tips style0 style1" hidden spellcheck="false">'+tips+'</div>'+
				 topall+'<div class="style0 style2 top" hidden>'+top+'</div>'+
				 '<table><tr class="style0 style1" hidden><td class="top" colspan="8">'+top+'</td></tr>'+
				 table_th+table_list+table_bottom+
				 '<tr><td colspan="9" class="notice">'+notice+'</td></tr>'+
				 '<tr class="style0 style1" hidden><td class="style0 style1 color" colspan="8">'+color+'</td></tr></table>'+
				 '<div class="style0 style2 color" hidden>'+color+'</div>'+
				 page_bottom;
		
		$('#print div.print').html(page);
		$('#print .style'+printStyle).removeAttr('hidden').addClass('show');
		
		//设置打印页面css
		var boxWidth='193mm';
		$('#print table').css('width',boxWidth).css('height','88mm').css('border-collapse','collapse');
		$('#print .print').css('font-size','3.8mm').css('font-family',default_ff);
		
		$('#print td,#print th').css('height','5.5mm').css('text-align','center').css('border','1px solid #000').css('padding','0.3mm 1mm').css('white-space','nowrap').css('line-height','1').css('letter-spacing','-0.2mm');
//		$('#print th').css('font-weight','normal');
//		$('#print b,#print .notice').css('font-weight','bold');
		$('#print .top div').css('float','left');
		$('#print .top div.topd1').css('width','39%');
		$('#print .top div.topd2').css('width','30%');
		$('#print .top div.topd3').css('width','30%');
		$('#print .top,#print .color,#print .notice').css('text-align','left');
		
		$('#print td.number').css('width','18mm');
		$('#print td.name').css('width','31mm').css('text-align','left');
		$('#print td.spec').css('width','14mm');
		$('#print td.unit').css('width','11mm');
		$('#print td.count').css('width','14mm');
		$('#print td.price').css('width','14mm');
		$('#print td.amount').css('width','18mm').css('text-align','right');
		$('#print td.remark').css('width','72mm').css('text-align','left').css('white-space','normal');
		$('#print td.dx').css('text-align','left');
		
		$('#print .print > div').css('width',boxWidth).css('float','left');
		$('#print div.tit').css('font-size','7.5mm').css('line-height','1.1').css('text-align','center').css('letter-spacing','1mm').css('font-weight','bold');
		$('#print div.tips').css('line-height','1.2').css('margin-bottom','2mm');
		$('#print div.topall,#print div.tit').css('margin-bottom','3mm');
		$('#print div.man').css('margin-top','3mm');
		
		$('#print div.man.style1 div').css('width','23%').css('float','left');
		$('#print div.man.style2 div').css('width','19%').css('float','left');
		
		change(printStyle,'#print');
	}
	var upload_logo=function(file){
		if(!file) return;
		var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e){
        	if(file.size > 1000000) {
        		k.aspect.noty.message('文件不能超过1M！');
        		return;
        	}
        	var imageType = file.name.substr(file.name.lastIndexOf('.'));
        	if(imageType!='.jpg' && imageType!='.png') {
        		k.aspect.noty.message('只支持.jpg或.png的图片文件！');
        		return;
        	}
        	//文件重命名：uid+'d'+new Date().getTime();
        	var fullPath = '/res/kdb/upload/printlogo/';
        	var fileName = k.cache.sign.user_id+'d'+new Date().getTime()+imageType;
            // ajax 上传图片  
        	k.aspect.noty.progress('上传中。。。');
        	var fileData = e.target.result;
        	var start = fileData.indexOf(',');
			if(start > 0) fileData = fileData.substr(start);//去掉前缀
			fileData = (k.cache.sign.user.printlogo||'')+fileData;
            k.net.ajax({url:'/upload/printlogo/'+fileName,data:fileData},function(err){
            	if (err) {
            		k.aspect.noty.close_progress();
            		k.aspect.noty.message('上传失败！');
	            } else {
	            	k.net.api('/manage/upduser',{_id:k.cache.sign.user._id,printlogo:fullPath+fileName},function(err,r){
	            		$('#facebox img.printlogo').attr('src','http://'+window.location.host+fullPath+fileName);
	            	});
	            	k.cache.sign.user.printlogo = fullPath+fileName;
	            	k.aspect.noty.close_progress();
	            	k.aspect.noty.message('上传成功！');
	            }
            });
        } 
	}
	k.aspect.print={ad:ad,prepare:prepare,act:print,change:change,
			upload_logo:upload_logo,
		facebox:function(select,must_clodop){
			$.facebox.close();
			setTimeout(function() {
				ad();
				print(select,must_clodop);
			}, 800);
		},
		
	}
})(window.kaidanbao);
