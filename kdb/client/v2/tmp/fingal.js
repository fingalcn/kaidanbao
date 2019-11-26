/**
 * 所有客户端js写在这一个文件中，后续文件大了，采用node模块化拆分，保证核心过程和工具不依赖第三方库
 * 文件加载顺序：
 * 页面跳转依赖url hash
 */
;(function(a,b){
	//文档顺序加载，定义参数
	a.kaidanbao = {};
	window.addEventListener('DOMContentLoaded', function(){
		//require(k.utils)
		b(a.kaidanbao);
		//标签可见性切换
		document.addEventListener('visibilitychange', function(){
//			console.log(document['visibilityState']);//visible or hidden
		});
		//屏幕旋转监听
		window.addEventListener('orientationchange', function(){
//			console.log(document.body.clientWidth);
//			console.log(document.body.clientHeight);
		});
    });
	//捕获全局错误
//	window.onerror=function(msg,url,l){
//		console.log("Error: " + msg);
//		console.log("URL: " + url);
//		console.log("Line: " + l);
//	}
})(window,function(k){
	k.frame.init();
	window.addEventListener('hashchange',k.frame.hashchangeHandle);
	//有更新，准备下载
	window.applicationCache.ondownloading = function(){
		//仅当用户登录过开单宝才提示更新
		if(window.localStorage['k']) k.aspect.noty.progress('更新中。。。');
	}
	//首次缓存成功
	window.applicationCache.oncached = function(){
		if(window.localStorage['k']) window.location.href = './';
	}
	//再次缓存更新成功
	window.applicationCache.onupdateready = function(){
		if(window.localStorage['k']) window.location.href = './';
	}
	//存储事件，同一浏览器只能登录一个开单宝账号
	window.addEventListener('storage',function(event){
		if(k.cache.sign.loaded) {//已登录触发事件
			window.location.href = '/';
		}
	});
});

/**
 * http://usejsdoc.org/
 */
(function(k){
	var pinyin_already_init=false;
	k.utils={
		valid_loginname:function(val){
			//校验用户名
			if(/^[0-9a-zA-Z]{2,16}$/.test(val)){
				return true;
			}else k.aspect.noty.message('用户名由字母和数字组成');
			
		},
		valid_mobile:function(val){
			//校验手机号
			if(/^1[3-8][0-9]{9}$/.test(val)){
				return true;
			}else k.aspect.noty.message('手机号码不对');
		},
		valid_password:function(val){
			//校验密码
			if(val.length < 5){
				k.aspect.noty.message('密码太短！');
			}else return true;
		},
		valid_hanname:function(val){
			//校验商户简称、昵称
			if(/^[^\s]{2,8}$/.test(val)){
				return true;
			}else k.aspect.noty.message('名称由2到8个文字组成！');
		},
		is_float: function(input){  
		     var re = /^(-?\d+)(\.\d+)?$/;         
		     if (re.test(input)) return true;
		     else false; 
		},
		file:(function(){
//		    var uri = {excel: 'data:application/vnd.ms-excel;base64,', csv: 'data:application/csv;base64,'};
		    var template = {excel: '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{table}</body></html>'};
		    var csvDelimiter = ",";
		    var csvNewLine = "\r\n";
		    var format = function(s, c) {
		        return s.replace(new RegExp("{(\\w+)}", "g"), function(m, p) {
		            return c[p];
		        });
		    };
			var saveAs=function(blob, filename) {
			    var type = blob.type;
			    var force_saveable_type = 'application/octet-stream';
			    if (type && type != force_saveable_type) { // 强制下载，而非在浏览器中打开
			        var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
			        blob = slice.call(blob, 0, blob.size, force_saveable_type);
			    }

			    var url = URL.createObjectURL(blob);
			    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
			    save_link.href = url;
			    save_link.download = filename;

			    var event = document.createEvent('MouseEvents');
			    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			    save_link.dispatchEvent(event);
			    URL.revokeObjectURL(url);
			};
			var readAsText=function(file,comp){
				var reader=new FileReader();
				reader.readAsText(file);
				reader.onload = function() {
					comp(this.result);
				}
			};
			return {
				tableToExcel: function(table_html,filename) {
					var excelValue = format(template.excel,{worksheet: filename,table: table_html});
		            saveAs(new Blob([excelValue],{'type':'text/plain;charset=utf-8'}),filename+'.xls');
		        },
		        excelToTable:function(file,comp){
		        	if(file){
		        		readAsText(file,function(r){
		        			comp(r.substring(r.indexOf('<table'),r.indexOf('</table')+8));
		        		});
		        	}else comp();
		        }
			};
		})(),
		DX:function (num) {  
			  var strOutput = "";  
			  var strUnit = '仟佰拾亿仟佰拾万仟佰拾元角分';  
			      num += "00";  
			  var intPos = num.indexOf('.');  
			  if (intPos >= 0) num = num.substring(0, intPos) + num.substr(intPos + 1, 2);  
			  strUnit = strUnit.substr(strUnit.length - num.length);  
			  for (var i=0; i < num.length; i++)  
			    strOutput += '零壹贰叁肆伍陆柒捌玖'.substr(num.substr(i,1),1) + strUnit.substr(i,1);  
			  return strOutput.replace(/零角零分$/, '整').replace(/零[仟佰拾]/g, '零').replace(/零{2,}/g, '零').replace(/零([亿|万])/g, '$1').replace(/零+元/, '元').replace(/亿零{0,3}万/, '亿').replace(/^元/, "零元");
		},
		date:{
			picker:function(clazz,conf){
				conf = k.utils.extend(conf,{
					format: "yyyy-mm-dd",
				    weekStart: 0,
				    todayBtn: 'linked',
				    clearBtn: true,
				    language: "zh-CN",
				    todayHighlight: true,
				    autoclose: true
				});
				$(clazz).datepicker(conf);
			},
			getDayTimestamp:function(date){
				//YYYY-MM-DD,获取指定日期时间戳
				return new Date(date.replace(/-/g,'/')).getTime();
			},
			getNow:function(){
				//获取当前毫秒数
				return new Date().getTime();
			},
			getDay:function(n,start){
				var first = start?new Date(start).getTime():new Date().getTime();
				//日期YYYY-MM-DD，n为相对于今天的偏离天数，可以为实数
				if(n) return k.utils.date.getTimeFormat(first+(n*86400000),'d');
				else return k.utils.date.getTimeFormat(0,'d');
			},
			getTimeFormat:function(time,mode){
				//统一为格式：YYYY-MM-DD hh-mm-ss.SSS，
				//@time : 时间戳毫秒数，
				//@mode : 'd' YYYY-MM-DD;'t'hh-mm-ss;'dt' YYYY-MM-DD hh-mm-ss;
				var dt = time?new Date(time):new Date();
				var YYYY = dt.getFullYear(),
				    MM   = dt.getMonth()+1,
				    DD   = dt.getDate(),
				    hh   = dt.getHours(),
				    mm   = dt.getMinutes(),
				    ss   = dt.getSeconds();
				if(mode === 'd'){
					MM = (MM>9?MM:('0'+MM));
					DD = (DD>9?DD:('0'+DD));
					return YYYY+'-'+MM+'-'+DD;
				}else if(mode === 't'){ 
					hh = (hh>9?hh:('0'+hh));
					mm = (mm>9?mm:('0'+mm));
					ss = (ss>9?ss:('0'+ss));
					return hh+':'+mm+':'+ss;
				}else{ 
					MM = (MM>9?MM:('0'+MM));
					DD = (DD>9?DD:('0'+DD));
					hh = (hh>9?hh:('0'+hh));
					mm = (mm>9?mm:('0'+mm));
					ss = (ss>9?ss:('0'+ss));
					return YYYY+'-'+MM+'-'+DD+' '+hh+':'+mm+':'+ss;
				}
			},
			get_before_yms:function(n){
				var day = new Date().getDate();
				var yms =[];
				yms.push(k.utils.date.getDay().substr(0, 7));
				for(var i=0;i<n-1;i++){
					yms.push(k.utils.date.getDay(-1-day-(31*i)).substr(0, 7));
				}
				return yms;
			},
		},
		pinyin:{
			dict:{},
			yinbiao:{"ā": "a1","á": "a2","ǎ": "a3","à": "a4","ē": "e1","é": "e2","ě": "e3","è": "e4","ō": "o1","ó": "o2","ǒ": "o3","ò": "o4","ī": "i1","í": "i2","ǐ": "i3","ì": "i4","ū": "u1","ú": "u2","ǔ": "u3","ù": "u4","ü": "v0","ǘ": "v2","ǚ": "v3","ǜ": "v4","ń": "n2","ň": "n3","": "m2"},
			init:function(){
				if(pinyin_already_init === false){
					pinyin_already_init=true;
					var pmap={"èr":"二贰","shí":"十时实蚀","yǐ":"乙已以蚁倚","yī":"一衣医依伊揖壹","chǎng,ān,hàn":"厂","dīng,zhēng":"丁","qī":"七戚欺漆柒凄嘁","bǔ,bo":"卜","rén":"人仁","rù":"入褥","jiǔ":"九久酒玖灸韭","ér":"儿而","bā":"八巴疤叭芭捌笆","jǐ,jī":"几","le,liǎo":"了","lì":"力历厉立励利例栗粒吏枥沥荔俐莉砾雳痢","dāo":"刀","nǎi":"乃奶","sān":"三叁","yòu":"又右幼诱佑","yú":"于余鱼娱渔榆愚隅逾舆","shì":"士示世市式势事侍饰试视柿是适室逝释誓拭恃嗜","gān,gàn":"干","gōng":"工弓公功攻宫恭躬","kuī":"亏盔窥","tǔ":"土","cùn":"寸","dà,dài,tài":"大","cái":"才材财裁","xià":"下夏","zhàng":"丈仗帐胀障杖账","yǔ,yù,yú":"与","shàng,shǎng":"上","wàn,mò":"万","kǒu":"口","xiǎo":"小晓","jīn":"巾斤今金津筋襟","shān":"山删衫珊","qiān":"千迁牵谦签","qǐ":"乞企启起","chuān":"川穿","gè,gě":"个各","sháo":"勺芍","yì":"亿义艺忆议亦异役译易疫益谊意毅翼屹抑邑绎奕逸肄溢","jí":"及吉级极即急疾集籍棘辑嫉","fán":"凡烦矾樊","xī":"夕西吸希析牺息悉惜稀锡溪熄膝昔晰犀熙嬉蟋","wán":"丸完玩顽","me,mó,ma,yāo":"么","guǎng,ān":"广","wáng,wú":"亡","mén":"门们","shī":"尸失师诗狮施湿虱","zhī":"之支汁芝肢脂蜘","jǐ":"己挤脊","zǐ":"子紫姊籽滓","wèi":"卫未位味畏胃喂慰谓猬蔚魏","yě":"也冶野","nǚ,rǔ":"女","rèn":"刃认韧纫","fēi":"飞非啡","xí":"习席袭媳","mǎ":"马码玛","chā,chá,chǎ":"叉","fēng":"丰封疯峰锋蜂枫","xiāng":"乡香箱厢湘镶","jǐng":"井警阱","wáng,wàng":"王","kāi":"开揩","tiān":"天添","wú":"无吴芜梧蜈","fū,fú":"夫","zhuān":"专砖","yuán":"元园原圆援缘源袁猿辕","yún":"云匀耘","zhā,zā,zhá":"扎","mù":"木目牧墓幕暮慕沐募睦穆","wǔ":"五午伍武侮舞捂鹉","tīng":"厅听","bù,fǒu":"不","qū,ōu":"区","quǎn":"犬","tài":"太态泰汰","yǒu":"友","chē,jū":"车","pǐ":"匹","yóu":"尤由邮犹油游","jù":"巨拒具俱剧距惧锯聚炬","yá":"牙芽崖蚜涯衙","bǐ":"比彼笔鄙匕秕","jiē":"皆阶接街秸","hù":"互户护沪","qiè,qiē":"切","wǎ,wà":"瓦","zhǐ":"止旨址纸指趾","tún,zhūn":"屯","shǎo,shào":"少","rì":"日","zhōng,zhòng":"中","gāng":"冈刚纲缸肛","nèi,nà":"内","bèi":"贝备倍辈狈惫焙","shuǐ":"水","jiàn,xiàn":"见","niú":"牛","shǒu":"手守首","máo":"毛矛茅锚","qì":"气弃汽器迄泣","shēng":"升生声牲笙甥","cháng,zhǎng":"长","shén,shí":"什","piàn,piān":"片","pú,pū":"仆","huà,huā":"化","bì":"币必毕闭毙碧蔽弊避壁庇蓖痹璧","chóu,qiú":"仇","zhuǎ,zhǎo":"爪","jǐn,jìn":"仅","réng":"仍","fù,fǔ":"父","cóng,zòng":"从","fǎn":"反返","jiè":"介戒届界借诫","xiōng":"凶兄胸匈汹","fēn,fèn":"分","fá":"乏伐罚阀筏","cāng":"仓苍舱沧","yuè":"月阅悦跃越岳粤","shì,zhī":"氏","wù":"勿务物误悟雾坞晤","qiàn":"欠歉","fēng,fěng":"风","dān":"丹耽","wū":"乌污呜屋巫诬","fèng":"凤奉","gōu,gòu":"勾","wén":"文闻蚊","liù,lù":"六","huǒ":"火伙","fāng":"方芳","dǒu,dòu":"斗","wèi,wéi":"为","dìng":"订定锭","jì":"计记技忌际季剂迹既继寄绩妓荠寂鲫冀","xīn":"心辛欣新薪锌","chǐ,chě":"尺","yǐn":"引饮蚓瘾","chǒu":"丑","kǒng":"孔恐","duì":"队对","bàn":"办半扮伴瓣绊","yǔ,yú":"予","yǔn":"允陨","quàn":"劝","shū":"书叔殊梳舒疏输蔬抒枢淑","shuāng":"双霜","yù":"玉育狱浴预域欲遇御裕愈誉芋郁喻寓豫","huàn":"幻换唤患宦涣焕痪","kān":"刊堪勘","mò":"末沫漠墨默茉陌寞","jī":"击饥圾机肌鸡积基激讥叽唧畸箕","dǎ,dá":"打","qiǎo":"巧","zhèng,zhēng":"正症挣","pū":"扑","bā,pá":"扒","gān":"甘肝竿柑","qù":"去","rēng":"扔","gǔ":"古谷股鼓","běn":"本","jié,jiē":"节结","shù,shú,zhú":"术","bǐng":"丙柄饼秉禀","kě,kè":"可","zuǒ":"左","bù":"布步怖部埠","shí,dàn":"石","lóng":"龙聋隆咙胧窿","yà":"轧亚讶","miè":"灭蔑","píng":"平评凭瓶萍坪","dōng":"东冬","kǎ,qiǎ":"卡","běi,bèi":"北","yè":"业页夜液谒腋","jiù":"旧救就舅臼疚","shuài":"帅蟀","guī":"归规闺硅瑰","zhàn,zhān":"占","dàn":"旦但诞淡蛋氮","qiě,jū":"且","yè,xié":"叶","jiǎ":"甲钾","dīng":"叮盯","shēn":"申伸身深呻绅","hào,háo":"号","diàn":"电店垫殿玷淀惦奠","tián":"田甜恬","shǐ":"史使始驶矢屎","zhī,zhǐ":"只","yāng":"央殃秧鸯","diāo":"叼雕刁碉","jiào":"叫轿较窖酵","lìng":"另","dāo,tāo":"叨","sì":"四寺饲肆","tàn":"叹炭探碳","qiū":"丘秋蚯","hé":"禾河荷盒","fù":"付负妇附咐赴复傅富腹覆赋缚","dài":"代带贷怠袋逮戴","xiān":"仙先掀锨","yí":"仪宜姨移遗夷胰","bái":"白","zǎi,zǐ,zī":"仔","chì":"斥赤翅","tā":"他它塌","guā":"瓜刮","hū":"乎呼忽","cóng":"丛","lìng,líng,lǐng":"令","yòng":"用","shuǎi":"甩","yìn":"印","lè,yuè":"乐","jù,gōu":"句","cōng":"匆葱聪囱","fàn":"犯饭泛范贩","cè":"册厕测策","wài":"外","chù,chǔ":"处","niǎo":"鸟","bāo":"包胞苞褒","zhǔ":"主煮嘱拄","shǎn":"闪陕","lán":"兰拦栏蓝篮澜","tóu,tou":"头","huì":"汇绘贿惠慧讳诲晦秽","hàn":"汉旱捍悍焊撼翰憾","tǎo":"讨","xué":"穴学","xiě":"写","níng,nìng,zhù":"宁","ràng":"让","lǐ":"礼李里理鲤","xùn":"训讯迅汛驯逊殉","yǒng":"永咏泳勇蛹踊","mín":"民","chū":"出初","ní":"尼","sī":"司丝私斯撕嘶","liáo":"辽疗僚聊寥嘹缭","jiā":"加佳嘉枷","nú":"奴","zhào,shào":"召","biān":"边编鞭蝙","pí":"皮疲脾啤","yùn":"孕运韵酝蕴","fā,fà":"发","shèng":"圣胜剩","tái,tāi":"台苔","jiū":"纠究揪鸠","mǔ":"母亩牡拇姆","káng,gāng":"扛","xíng":"刑形型邢","dòng":"动冻栋洞","kǎo":"考烤拷","kòu":"扣寇","tuō":"托拖脱","lǎo":"老","gǒng":"巩汞拱","zhí":"执直侄值职植","kuò":"扩阔廓","yáng":"扬阳杨洋","dì,de":"地","sǎo,sào":"扫","chǎng,cháng":"场","ěr":"耳尔饵","máng":"芒忙盲茫","xiǔ":"朽","pǔ,pò,pō,piáo":"朴","quán":"权全泉拳痊","guò,guo,guō":"过","chén":"臣尘辰沉陈晨忱","zài":"再在","xié":"协胁斜携鞋谐","yā,yà":"压","yàn":"厌艳宴验雁焰砚唁谚堰","yǒu,yòu":"有","cún":"存","bǎi":"百摆","kuā,kuà":"夸","jiàng":"匠酱","duó":"夺踱","huī":"灰挥恢辉徽","dá":"达","sǐ":"死","liè":"列劣烈猎","guǐ":"轨鬼诡","xié,yá,yé,yú,xú":"邪","jiá,jiā,gā,xiá":"夹","chéng":"成呈诚承城程惩橙","mài":"迈麦卖","huà,huá":"划","zhì":"至志帜制质治致秩智置挚掷窒滞稚","cǐ":"此","zhēn":"贞针侦珍真斟榛","jiān":"尖奸歼坚肩艰兼煎","guāng":"光","dāng,dàng":"当","zǎo":"早枣澡蚤藻","tù,tǔ":"吐","xià,hè":"吓","chóng":"虫崇","tuán":"团","tóng,tòng":"同","qū,qǔ":"曲","diào":"吊钓掉","yīn":"因阴音姻茵","chī":"吃嗤痴","ma,má,mǎ":"吗","yǔ":"屿宇羽","fān":"帆翻","huí":"回茴蛔","qǐ,kǎi":"岂","zé":"则责","suì":"岁碎穗祟遂隧","ròu":"肉","zhū,shú":"朱","wǎng":"网往枉","nián":"年","diū":"丢","shé":"舌","zhú":"竹逐烛","qiáo":"乔侨桥瞧荞憔","wěi":"伟伪苇纬萎","chuán,zhuàn":"传","pāng":"乓","pīng":"乒","xiū,xǔ":"休","fú":"伏扶俘浮符幅福凫芙袱辐蝠","yōu":"优忧悠幽","yán":"延严言岩炎沿盐颜阎蜒檐","jiàn":"件建荐贱剑健舰践鉴键箭涧","rèn,rén":"任","huá,huà,huā":"华","jià,jiè,jie":"价","shāng":"伤商","fèn,bīn":"份","fǎng":"仿访纺","yǎng,áng":"仰","zì":"自字","xiě,xuè":"血","xiàng":"向项象像橡","sì,shì":"似","hòu":"后厚候","zhōu":"舟州周洲","háng,xíng":"行","huì,kuài":"会","shā":"杀纱杉砂","hé,gě":"合","zhào":"兆赵照罩","zhòng":"众仲","yé":"爷","sǎn":"伞","chuàng,chuāng":"创","duǒ":"朵躲","wēi":"危威微偎薇巍","xún":"旬寻巡询循","zá":"杂砸","míng":"名明鸣铭螟","duō":"多哆","zhēng":"争征睁筝蒸怔狰","sè":"色涩瑟","zhuàng":"壮状撞","chōng,chòng":"冲","bīng":"冰兵","zhuāng":"庄装妆桩","qìng":"庆","liú":"刘留流榴琉硫瘤","qí,jì,zī,zhāi":"齐","cì":"次赐","jiāo":"交郊浇娇骄胶椒焦蕉礁","chǎn":"产铲阐","wàng":"妄忘旺望","chōng":"充","wèn":"问","chuǎng":"闯","yáng,xiáng":"羊","bìng,bīng":"并","dēng":"灯登蹬","mǐ":"米","guān":"关官棺","hàn,hán":"汗","jué":"决绝掘诀爵","jiāng":"江姜僵缰","tāng,shāng":"汤","chí":"池驰迟持弛","xīng,xìng":"兴","zhái":"宅","ān":"安氨庵鞍","jiǎng":"讲奖桨蒋","jūn":"军均君钧","xǔ,hǔ":"许","fěng":"讽","lùn,lún":"论","nóng":"农浓脓","shè":"设社舍涉赦","nà,nǎ,nèi,nā":"那","jìn,jǐn":"尽","dǎo":"导岛蹈捣祷","sūn,xùn":"孙","zhèn":"朕圳阵振震镇","shōu":"收","fáng":"防妨房肪","rú":"如儒蠕","mā":"妈","xì,hū":"戏","hǎo,hào":"好","tā,jiě":"她","guān,guàn":"观冠","huān":"欢","hóng,gōng":"红","mǎi":"买","xiān,qiàn":"纤","jì,jǐ":"纪济","yuē,yāo":"约","shòu":"寿受授售兽瘦","nòng,lòng":"弄","jìn":"进近晋浸","wéi":"违围唯维桅","yuǎn,yuàn":"远","tūn":"吞","tán":"坛谈痰昙谭潭檀","fǔ":"抚斧府俯辅腐甫脯","huài,pēi,pī,péi":"坏","rǎo":"扰","pī":"批披坯霹","zhǎo":"找沼","chě":"扯","zǒu":"走","chāo":"抄钞超","bà":"坝爸霸","gòng":"贡","zhé,shé,zhē":"折","qiǎng,qiāng,chēng":"抢","zhuā":"抓","xiào":"孝笑效哮啸","pāo":"抛","tóu":"投","kàng":"抗炕","fén":"坟焚","kēng":"坑","dǒu":"抖陡蚪","ké,qiào":"壳","fāng,fáng":"坊","niǔ":"扭纽钮","kuài":"块快筷","bǎ,bà":"把","bào":"报抱爆豹","jié":"劫杰洁捷截竭","què":"却确鹊","huā":"花","fēn":"芬吩纷氛","qín":"芹琴禽勤秦擒","láo":"劳牢","lú":"芦炉卢庐颅","gān,gǎn":"杆","kè":"克刻客课","sū,sù":"苏","dù":"杜渡妒镀","gàng,gāng":"杠","cūn":"村","qiú":"求球囚","xìng":"杏幸性姓","gèng,gēng":"更","liǎng":"两","lì,lí":"丽","shù":"束述树竖恕庶墅漱","dòu":"豆逗痘","hái,huán":"还","fǒu,pǐ":"否","lái":"来莱","lián":"连怜帘莲联廉镰","xiàn,xuán":"县","zhù,chú":"助","dāi":"呆","kuàng":"旷况矿框眶","ya,yā":"呀","zú":"足族","dūn":"吨蹲墩","kùn":"困","nán":"男","chǎo,chāo":"吵","yuán,yún,yùn":"员","chuàn":"串","chuī":"吹炊","ba,bā":"吧","hǒu":"吼","gǎng":"岗","bié,biè":"别","dīng,dìng":"钉","gào":"告","wǒ":"我","luàn":"乱","tū":"秃突凸","xiù":"秀袖绣锈嗅","gū,gù":"估","měi":"每美","hé,hē,hè":"何","tǐ,tī,bèn":"体","bó,bǎi,bà":"伯","zuò":"作坐座做","líng":"伶灵铃陵零龄玲凌菱蛉翎","dī":"低堤滴","yòng,yōng":"佣","nǐ":"你拟","zhù":"住注驻柱祝铸贮蛀","zào":"皂灶造燥躁噪","fó,fú,bì,bó":"佛","chè":"彻撤澈","tuǒ":"妥椭","lín":"邻林临琳磷鳞","hán":"含寒函涵韩","chà":"岔衩","cháng":"肠尝常偿","dù,dǔ":"肚","guī,jūn,qiū":"龟","miǎn":"免勉娩冕缅","jiǎo,jué":"角","kuáng":"狂","tiáo,tiāo":"条","luǎn":"卵","yíng":"迎盈营蝇赢荧莹萤","xì,jì":"系","chuáng":"床","kù":"库裤酷","yìng,yīng":"应","lěng":"冷","zhè,zhèi":"这","xù":"序叙绪续絮蓄旭恤酗婿","xián":"闲贤弦咸衔嫌涎舷","jiān,jiàn":"间监","pàn":"判盼叛畔","mēn,mèn":"闷","wāng":"汪","dì,tì,tuí":"弟","shā,shà":"沙","shà,shā":"煞","càn":"灿璨","wò":"沃卧握","méi,mò":"没","gōu":"沟钩","shěn,chén":"沈","huái":"怀槐徊淮","sòng":"宋送诵颂讼","hóng":"弘泓宏虹洪鸿","qióng":"穷琼","zāi":"灾栽","liáng":"良梁粮粱","zhèng":"证郑政","bǔ":"补捕哺","sù":"诉肃素速塑粟溯","shí,zhì":"识","cí":"词辞慈磁祠瓷雌","zhěn":"诊枕疹","niào,suī":"尿","céng":"层","jú":"局菊橘","wěi,yǐ":"尾","zhāng":"张章彰樟","gǎi":"改","lù":"陆录鹿路赂","ē,ā":"阿","zǔ":"阻组祖诅","miào":"妙庙","yāo":"妖腰邀夭吆","nǔ":"努","jìn,jìng":"劲","rěn":"忍","qū":"驱屈岖蛆躯","chún":"纯唇醇","nà":"纳钠捺","bó":"驳脖博搏膊舶渤","zòng,zǒng":"纵","wén,wèn":"纹","lǘ":"驴","huán":"环","qīng":"青轻倾清蜻氢卿","xiàn":"现限线宪陷馅羡献腺","biǎo":"表","mǒ,mò,mā":"抹","lǒng":"拢垄","dān,dàn,dǎn":"担","bá":"拔跋","jiǎn":"拣茧俭捡检减剪简柬碱","tǎn":"坦毯袒","chōu":"抽","yā":"押鸦鸭","guǎi":"拐","pāi":"拍","zhě":"者","dǐng":"顶鼎","yōng":"拥庸","chāi,cā":"拆","dǐ":"抵","jū,gōu":"拘","lā":"垃","lā,lá":"拉","bàn,pàn":"拌","zhāo":"招昭","pō":"坡泼颇","bō":"拨波玻菠播","zé,zhái":"择","tái":"抬","qí,jī":"其奇","qǔ":"取娶","kǔ":"苦","mào":"茂贸帽貌","ruò,rě":"若","miáo":"苗描瞄","píng,pēng":"苹","yīng":"英樱鹰莺婴缨鹦","qié":"茄","jīng":"茎京经惊晶睛精荆兢鲸","zhī,qí":"枝","bēi":"杯悲碑卑","guì,jǔ":"柜","bǎn":"板版","sōng":"松","qiāng":"枪腔","gòu":"构购够垢","sàng,sāng":"丧","huà":"画话桦","huò":"或货获祸惑霍","cì,cī":"刺","yǔ,yù":"雨语","bēn,bèn":"奔","fèn":"奋粪愤忿","hōng":"轰烘","qī,qì":"妻","ōu":"欧殴鸥","qǐng":"顷请","zhuǎn,zhuàn,zhuǎi":"转","zhǎn":"斩盏展","ruǎn":"软","lún":"轮仑伦沦","dào":"到盗悼道稻","chǐ":"齿耻侈","kěn":"肯垦恳啃","hǔ":"虎","xiē,suò":"些","lǔ":"虏鲁卤","shèn":"肾渗慎","shàng":"尚","guǒ":"果裹","kūn":"昆坤","guó":"国","chāng":"昌猖","chàng":"畅唱","diǎn":"典点碘","gù":"固故顾雇","áng":"昂","zhōng":"忠终钟盅衷","ne,ní":"呢","àn":"岸按案暗","tiě,tiē,tiè,":"帖","luó":"罗萝锣箩骡螺逻","kǎi":"凯慨","lǐng,líng":"岭","bài":"败拜","tú":"图徒途涂屠","chuí":"垂锤捶","zhī,zhì":"知织","guāi":"乖","gǎn":"秆赶敢感橄","hé,hè,huó,huò,hú":"和","gòng,gōng":"供共","wěi,wēi":"委","cè,zè,zhāi":"侧","pèi":"佩配沛","pò,pǎi":"迫","de,dì,dí":"的","pá":"爬","suǒ":"所索锁琐","jìng":"径竞竟敬静境镜靖","mìng":"命","cǎi,cài":"采","niàn":"念","tān":"贪摊滩瘫","rǔ":"乳辱","pín":"贫","fū":"肤麸孵敷","fèi":"肺废沸费吠","zhǒng":"肿","péng":"朋棚蓬膨硼鹏澎篷","fú,fù":"服","féi":"肥","hūn":"昏婚荤","tù":"兔","hú":"狐胡壶湖蝴弧葫","gǒu":"狗苟","bǎo":"饱宝保","xiǎng":"享响想","biàn":"变遍辨辩辫","dǐ,de":"底","jìng,chēng":"净","fàng":"放","nào":"闹","zhá":"闸铡","juàn,juǎn":"卷","quàn,xuàn":"券","dān,shàn,chán":"单","chǎo":"炒","qiǎn,jiān":"浅","fǎ":"法","xiè,yì":"泄","lèi":"泪类","zhān":"沾粘毡瞻","pō,bó":"泊","pào,pāo":"泡","xiè":"泻卸屑械谢懈蟹","ní,nì":"泥","zé,shì":"泽","pà":"怕帕","guài":"怪","zōng":"宗棕踪","shěn":"审婶","zhòu":"宙昼皱骤咒","kōng,kòng,kǒng":"空","láng,làng":"郎","chèn":"衬趁","gāi":"该","xiáng,yáng":"详","lì,dài":"隶","jū":"居鞠驹","shuā,shuà":"刷","mèng":"孟梦","gū":"孤姑辜咕沽菇箍","jiàng,xiáng":"降","mèi":"妹昧媚","jiě":"姐","jià":"驾架嫁稼","cān,shēn,cēn,sān":"参","liàn":"练炼恋链","xì":"细隙","shào":"绍哨","tuó":"驼驮鸵","guàn":"贯惯灌罐","zòu":"奏揍","chūn":"春椿","bāng":"帮邦梆","dú,dài":"毒","guà":"挂卦褂","kuǎ":"垮","kuà,kū":"挎","náo":"挠","dǎng,dàng":"挡","shuān":"拴栓","tǐng":"挺艇","kuò,guā":"括","shí,shè":"拾","tiāo,tiǎo":"挑","wā":"挖蛙洼","pīn":"拼","shèn,shén":"甚","mǒu":"某","nuó":"挪","gé":"革阁格隔","xiàng,hàng":"巷","cǎo":"草","chá":"茶察茬","dàng":"荡档","huāng":"荒慌","róng":"荣绒容熔融茸蓉溶榕","nán,nā":"南","biāo":"标彪膘","yào":"药耀","kū":"枯哭窟","xiāng,xiàng":"相","chá,zhā":"查","liǔ":"柳","bǎi,bó,bò":"柏","yào,yāo":"要","wāi":"歪","yán,yàn":"研","lí":"厘狸离犁梨璃黎漓篱","qì,qiè":"砌","miàn":"面","kǎn":"砍坎","shuǎ":"耍","nài":"耐奈","cán":"残蚕惭","zhàn":"战站栈绽蘸","bèi,bēi":"背","lǎn":"览懒揽缆榄","shěng,xǐng":"省","xiāo,xuē":"削","zhǎ":"眨","hǒng,hōng,hòng":"哄","xiǎn":"显险","mào,mò":"冒","yǎ,yā":"哑","yìng":"映硬","zuó":"昨","xīng":"星腥猩","pā":"趴","guì":"贵桂跪刽","sī,sāi":"思","xiā":"虾瞎","mǎ,mā,mà":"蚂","suī":"虽","pǐn":"品","mà":"骂","huá,huā":"哗","yè,yàn,yān":"咽","zán,zǎ":"咱","hā,hǎ,hà":"哈","yǎo":"咬舀","nǎ,něi,na,né":"哪","hāi,ké":"咳","xiá":"峡狭霞匣侠暇辖","gǔ,gū":"骨","gāng,gàng":"钢","tiē":"贴","yào,yuè":"钥","kàn,kān":"看","jǔ":"矩举","zěn":"怎","xuǎn":"选癣","zhòng,zhǒng,chóng":"种","miǎo":"秒渺藐","kē":"科棵颗磕蝌","biàn,pián":"便","zhòng,chóng":"重","liǎ":"俩","duàn":"段断缎锻","cù":"促醋簇","shùn":"顺瞬","xiū":"修羞","sú":"俗","qīn":"侵钦","xìn,shēn":"信","huáng":"皇黄煌凰惶蝗蟥","zhuī,duī":"追","jùn":"俊峻骏竣","dài,dāi":"待","xū":"须虚需","hěn":"很狠","dùn":"盾顿钝","lǜ":"律虑滤氯","pén":"盆","shí,sì,yì":"食","dǎn":"胆","táo":"逃桃陶萄淘","pàng":"胖","mài,mò":"脉","dú":"独牍","jiǎo":"狡饺绞脚搅","yuàn":"怨院愿","ráo":"饶","wān":"弯湾豌","āi":"哀哎埃","jiāng,jiàng":"将浆","tíng":"亭庭停蜓廷","liàng":"亮谅辆晾","dù,duó":"度","chuāng":"疮窗","qīn,qìng":"亲","zī":"姿资滋咨","dì":"帝递第蒂缔","chà,chā,chāi,cī":"差","yǎng":"养氧痒","qián":"前钱钳潜黔","mí":"迷谜靡","nì":"逆昵匿腻","zhà,zhá":"炸","zǒng":"总","làn":"烂滥","pào,páo,bāo":"炮","tì":"剃惕替屉涕","sǎ,xǐ":"洒","zhuó":"浊啄灼茁卓酌","xǐ,xiǎn":"洗","qià":"洽恰","pài":"派湃","huó":"活","rǎn":"染","héng":"恒衡","hún":"浑魂","nǎo":"恼脑","jué,jiào":"觉","hèn":"恨","xuān":"宣轩喧","qiè":"窃怯","biǎn,piān":"扁","ǎo":"袄","shén":"神","shuō,shuì,yuè":"说","tuì":"退蜕","chú":"除厨锄雏橱","méi":"眉梅煤霉玫枚媒楣","hái":"孩","wá":"娃","lǎo,mǔ":"姥","nù":"怒","hè":"贺赫褐鹤","róu":"柔揉蹂","bǎng":"绑膀","lěi":"垒蕾儡","rào":"绕","gěi,jǐ":"给","luò":"骆洛","luò,lào":"络","tǒng":"统桶筒捅","gēng":"耕羹","hào":"耗浩","bān":"班般斑搬扳颁","zhū":"珠株诸猪蛛","lāo":"捞","fěi":"匪诽","zǎi,zài":"载","mái,mán":"埋","shāo,shào":"捎稍","zhuō":"捉桌拙","niē":"捏","kǔn":"捆","dū,dōu":"都","sǔn":"损笋","juān":"捐鹃","zhé":"哲辙","rè":"热","wǎn":"挽晚碗惋婉","ái,āi":"挨","mò,mù":"莫","è,wù,ě,wū":"恶","tóng":"桐铜童彤瞳","xiào,jiào":"校","hé,hú":"核","yàng":"样漾","gēn":"根跟","gē":"哥鸽割歌戈","chǔ":"础储楚","pò":"破魄","tào":"套","chái":"柴豺","dǎng":"党","mián":"眠绵棉","shài":"晒","jǐn":"紧锦谨","yūn,yùn":"晕","huàng,huǎng":"晃","shǎng":"晌赏","ēn":"恩","ài,āi":"唉","ā,á,ǎ,à,a":"啊","bà,ba,pí":"罢","zéi":"贼","tiě":"铁","zuàn,zuān":"钻","qiān,yán":"铅","quē":"缺","tè":"特","chéng,shèng":"乘","dí":"迪敌笛涤嘀嫡","zū":"租","chèng":"秤","mì,bì":"秘泌","chēng,chèn,chèng":"称","tòu":"透","zhài":"债寨","dào,dǎo":"倒","tǎng,cháng":"倘","chàng,chāng":"倡","juàn":"倦绢眷","chòu,xiù":"臭","shè,yè,yì":"射","xú":"徐","háng":"航杭","ná":"拿","wēng":"翁嗡","diē":"爹跌","ài":"爱碍艾隘","gē,gé":"胳搁","cuì":"脆翠悴粹","zàng":"脏葬","láng":"狼廊琅榔","féng":"逢","è":"饿扼遏愕噩鳄","shuāi,cuī":"衰","gāo":"高糕羔篙","zhǔn":"准","bìng":"病","téng":"疼腾誊藤","liáng,liàng":"凉量","táng":"唐堂塘膛糖棠搪","pōu":"剖","chù,xù":"畜","páng,bàng":"旁磅","lǚ":"旅屡吕侣铝缕履","fěn":"粉","liào":"料镣","shāo":"烧","yān":"烟淹","tāo":"涛掏滔","lào":"涝酪","zhè":"浙蔗","xiāo":"消宵销萧硝箫嚣","hǎi":"海","zhǎng,zhàng":"涨","làng":"浪","rùn":"润闰","tàng":"烫","yǒng,chōng":"涌","huǐ":"悔毁","qiāo,qiǎo":"悄","hài":"害亥骇","jiā,jia,jie":"家","kuān":"宽","bīn":"宾滨彬缤濒","zhǎi":"窄","lǎng":"朗","dú,dòu":"读","zǎi":"宰","shàn,shān":"扇","shān,shàn":"苫","wà":"袜","xiáng":"祥翔","shuí":"谁","páo":"袍咆","bèi,pī":"被","tiáo,diào,zhōu":"调","yuān":"冤鸳渊","bō,bāo":"剥","ruò":"弱","péi":"陪培赔","niáng":"娘","tōng":"通","néng,nài":"能","nán,nàn,nuó":"难","sāng":"桑","pěng":"捧","dǔ":"堵赌睹","yǎn":"掩眼演衍","duī":"堆","pái,pǎi":"排","tuī":"推","jiào,jiāo":"教","lüè":"掠略","jù,jū":"据","kòng":"控","zhù,zhuó,zhe":"著","jūn,jùn":"菌","lè,lēi":"勒","méng":"萌盟檬朦","cài":"菜","tī":"梯踢剔","shāo,sào":"梢","fù,pì":"副","piào,piāo":"票","shuǎng":"爽","shèng,chéng":"盛","què,qiāo,qiǎo":"雀","xuě":"雪","chí,shi":"匙","xuán":"悬玄漩","mī,mí":"眯","la,lā":"啦","shé,yí":"蛇","lèi,léi,lěi":"累","zhǎn,chán":"崭","quān,juàn,juān":"圈","yín":"银吟淫","bèn":"笨","lóng,lǒng":"笼","mǐn":"敏皿闽悯","nín":"您","ǒu":"偶藕","tōu":"偷","piān":"偏篇翩","dé,děi,de":"得","jiǎ,jià":"假","pán":"盘","chuán":"船","cǎi":"彩睬踩","lǐng":"领","liǎn":"脸敛","māo,máo":"猫","měng":"猛锰","cāi":"猜","háo":"毫豪壕嚎","má":"麻","guǎn":"莞馆管","còu":"凑","hén":"痕","kāng":"康糠慷","xuán,xuàn":"旋","zhe,zhuó,zháo,zhāo":"着","lǜ,shuài":"率","gài,gě,hé":"盖","cū":"粗","lín,lìn":"淋","qú,jù":"渠","jiàn,jiān":"渐溅","hùn,hún":"混","pó":"婆","qíng":"情晴擎","cǎn":"惨","sù,xiǔ,xiù":"宿","yáo":"窑谣摇遥肴姚","móu":"谋","mì":"密蜜觅","huǎng":"谎恍幌","tán,dàn":"弹","suí":"随","yǐn,yìn":"隐","jǐng,gěng":"颈","shéng":"绳","qí":"骑棋旗歧祈脐畦崎鳍","chóu":"绸酬筹稠愁畴","lǜ,lù":"绿","dā":"搭","kuǎn":"款","tǎ":"塔","qū,cù":"趋","tí,dī,dǐ":"提","jiē,qì":"揭","xǐ":"喜徙","sōu":"搜艘","chā":"插","lǒu,lōu":"搂","qī,jī":"期","rě":"惹","sàn,sǎn":"散","dǒng":"董懂","gě,gé":"葛","pú":"葡菩蒲","zhāo,cháo":"朝","luò,là,lào":"落","kuí":"葵魁","bàng":"棒傍谤","yǐ,yī":"椅","sēn":"森","gùn,hùn":"棍","bī":"逼","zhí,shi":"殖","xià,shà":"厦","liè,liě":"裂","xióng":"雄熊","zàn":"暂赞","yǎ":"雅","chǎng":"敞","zhǎng":"掌","shǔ":"暑鼠薯黍蜀署曙","zuì":"最罪醉","hǎn":"喊罕","jǐng,yǐng":"景","lǎ":"喇","pēn,pèn":"喷","pǎo,páo":"跑","chuǎn":"喘","hē,hè,yè":"喝","hóu":"喉猴","pù,pū":"铺","hēi":"黑","guō":"锅郭","ruì":"锐瑞","duǎn":"短","é":"鹅额讹俄","děng":"等","kuāng":"匡筐","shuì":"税睡","zhù,zhú":"筑","shāi":"筛","dá,dā":"答","ào":"傲澳懊","pái":"牌徘","bǎo,bǔ,pù":"堡","ào,yù":"奥","fān,pān":"番","là,xī":"腊","huá":"猾滑","rán":"然燃","chán":"馋缠蝉","mán":"蛮馒","tòng":"痛","shàn":"善擅膳赡","zūn":"尊遵","pǔ":"普谱圃浦","gǎng,jiǎng":"港","céng,zēng":"曾","wēn":"温瘟","kě":"渴","zhā":"渣","duò":"惰舵跺","gài":"溉概丐钙","kuì":"愧","yú,tōu":"愉","wō":"窝蜗","cuàn":"窜篡","qún":"裙群","qiáng,qiǎng,jiàng":"强","shǔ,zhǔ":"属","zhōu,yù":"粥","sǎo":"嫂","huǎn":"缓","piàn":"骗","mō":"摸","shè,niè":"摄","tián,zhèn":"填","gǎo":"搞稿镐","suàn":"蒜算","méng,mēng,měng":"蒙","jìn,jīn":"禁","lóu":"楼娄","lài":"赖癞","lù,liù":"碌","pèng":"碰","léi":"雷","báo":"雹","dū":"督","nuǎn":"暖","xiē":"歇楔蝎","kuà":"跨胯","tiào,táo":"跳","é,yǐ":"蛾","sǎng":"嗓","qiǎn":"遣谴","cuò":"错挫措锉","ǎi":"矮蔼","shǎ":"傻","cuī":"催摧崔","tuǐ":"腿","chù":"触矗","jiě,jiè,xiè":"解","shù,shǔ,shuò":"数","mǎn":"满","liū,liù":"溜","gǔn":"滚","sāi,sài,sè":"塞","pì,bì":"辟","dié":"叠蝶谍碟","fèng,féng":"缝","qiáng":"墙","piě,piē":"撇","zhāi":"摘斋","shuāi":"摔","mó,mú":"模","bǎng,bàng":"榜","zhà":"榨乍诈","niàng":"酿","zāo":"遭糟","suān":"酸","shang,cháng":"裳","sòu":"嗽","là":"蜡辣","qiāo":"锹敲跷","zhuàn":"赚撰","wěn":"稳吻紊","bí":"鼻荸","mó":"膜魔馍摹蘑","xiān,xiǎn":"鲜","yí,nǐ":"疑","gāo,gào":"膏","zhē":"遮","duān":"端","màn":"漫慢曼幔","piāo,piào,piǎo":"漂","lòu":"漏陋","sài":"赛","nèn":"嫩","dèng":"凳邓瞪","suō,sù":"缩","qù,cù":"趣","sā,sǎ":"撒","tàng,tāng":"趟","chēng":"撑","zēng":"增憎","cáo":"槽曹","héng,hèng":"横","piāo":"飘","mán,mén":"瞒","tí":"题蹄啼","yǐng":"影颖","bào,pù":"暴","tà":"踏蹋","kào":"靠铐","pì":"僻屁譬","tǎng":"躺","dé":"德","mó,mā":"摩","shú":"熟秫赎","hú,hū,hù":"糊","pī,pǐ":"劈","cháo":"潮巢","cāo":"操糙","yàn,yān":"燕","diān":"颠掂","báo,bó,bò":"薄","cān":"餐","xǐng":"醒","zhěng":"整拯","zuǐ":"嘴","zèng":"赠","mó,mò":"磨","níng":"凝狞柠","jiǎo,zhuó":"缴","cā":"擦","cáng,zàng":"藏","fán,pó":"繁","bì,bei":"臂","bèng":"蹦泵","pān":"攀潘","chàn,zhàn":"颤","jiāng,qiáng":"疆","rǎng":"壤攘","jiáo,jué,jiào":"嚼","rǎng,rāng":"嚷","chǔn":"蠢","lù,lòu":"露","náng,nāng":"囊","dǎi":"歹","rǒng":"冗","hāng,bèn":"夯","āo,wā":"凹","féng,píng":"冯","yū":"迂淤","xū,yù":"吁","lèi,lē":"肋","kōu":"抠","lūn,lún":"抡","jiè,gài":"芥","xīn,xìn":"芯","chā,chà":"杈","xiāo,xiào":"肖","zhī,zī":"吱","ǒu,ōu,òu":"呕","nà,nè":"呐","qiàng,qiāng":"呛","tún,dùn":"囤","kēng,háng":"吭","shǔn":"吮","diàn,tián":"佃","sì,cì":"伺","zhǒu":"肘帚","diàn,tián,shèng":"甸","páo,bào":"刨","lìn":"吝赁躏","duì,ruì,yuè":"兑","zhuì":"坠缀赘","kē,kě":"坷","tuò,tà,zhí":"拓","fú,bì":"拂","nǐng,níng,nìng":"拧","ào,ǎo,niù":"拗","kē,hē":"苛","yān,yǎn":"奄","hē,a,kē":"呵","gā,kā":"咖","biǎn":"贬匾","jiǎo,yáo":"侥","chà,shā":"刹","āng":"肮","wèng":"瓮","nüè,yào":"疟","páng":"庞螃","máng,méng":"氓","gē,yì":"疙","jǔ,jù":"沮","zú,cù":"卒","nìng":"泞","chǒng":"宠","wǎn,yuān":"宛","mí,mǐ":"弥","qì,qiè,xiè":"契","xié,jiā":"挟","duò,duǒ":"垛","jiá":"荚颊","zhà,shān,shi,cè":"栅","bó,bèi":"勃","zhóu,zhòu":"轴","nüè":"虐","liē,liě,lié,lie":"咧","dǔn":"盹","xūn":"勋","yo,yō":"哟","mī":"咪","qiào,xiào":"俏","hóu,hòu":"侯","pēi":"胚","tāi":"胎","luán":"峦","sà":"飒萨","shuò":"烁","xuàn":"炫","píng,bǐng":"屏","nà,nuó":"娜","pá,bà":"耙","gěng":"埂耿梗","niè":"聂镊孽","mǎng":"莽","qī,xī":"栖","jiǎ,gǔ":"贾","chěng":"逞","pēng":"砰烹","láo,lào":"唠","bàng,bèng":"蚌","gōng,zhōng":"蚣","li,lǐ,lī":"哩","suō":"唆梭嗦","hēng":"哼","zāng":"赃","qiào":"峭窍撬","mǎo":"铆","ǎn":"俺","sǒng":"耸","juè,jué":"倔","yīn,yān,yǐn":"殷","guàng":"逛","něi":"馁","wō,guō":"涡","lào,luò":"烙","nuò":"诺懦糯","zhūn":"谆","niǎn,niē":"捻","qiā":"掐","yè,yē":"掖","chān,xiān,càn,shǎn":"掺","dǎn,shàn":"掸","fēi,fěi":"菲","qián,gān":"乾","shē":"奢赊","shuò,shí":"硕","luō,luó,luo":"啰","shá":"啥","hǔ,xià":"唬","tuò":"唾","bēng":"崩","dāng,chēng":"铛","xiǎn,xǐ":"铣","jiǎo,jiáo":"矫","tiáo":"笤","kuǐ,guī":"傀","xìn":"衅","dōu":"兜","jì,zhài":"祭","xiáo":"淆","tǎng,chǎng":"淌","chún,zhūn":"淳","shuàn":"涮","dāng":"裆","wèi,yù":"尉","duò,huī":"堕","chuò,chāo":"绰","bēng,běng,bèng":"绷","zōng,zèng":"综","zhuó,zuó":"琢","chuǎi,chuài,chuāi,tuán,zhuī":"揣","péng,bāng":"彭","chān":"搀","cuō":"搓","sāo":"搔","yē":"椰","zhuī,chuí":"椎","léng,lēng,líng":"棱","hān":"酣憨","sū":"酥","záo":"凿","qiào,qiáo":"翘","zhā,chā":"喳","bǒ":"跛","há,gé":"蛤","qiàn,kàn":"嵌","bāi":"掰","yān,ā":"腌","wàn":"腕","dūn,duì":"敦","kuì,huì":"溃","jiǒng":"窘","sāo,sǎo":"骚","pìn":"聘","bǎ":"靶","xuē":"靴薛","hāo":"蒿","léng":"楞","kǎi,jiē":"楷","pín,bīn":"频","zhuī":"锥","tuí":"颓","sāi":"腮","liú,liù":"馏","nì,niào":"溺","qǐn":"寝","luǒ":"裸","miù":"谬","jiǎo,chāo":"剿","áo,āo":"熬","niān":"蔫","màn,wàn":"蔓","chá,chā":"碴","xūn,xùn":"熏","tiǎn":"舔","sēng":"僧","da,dá":"瘩","guǎ":"寡","tuì,tùn":"褪","niǎn":"撵碾","liáo,liāo":"撩","cuō,zuǒ":"撮","ruǐ":"蕊","cháo,zhāo":"嘲","biē":"憋鳖","hēi,mò":"嘿","zhuàng,chuáng":"幢","jī,qǐ":"稽","lǒu":"篓","lǐn":"凛檩","biě,biē":"瘪","liáo,lào,lǎo":"潦","chéng,dèng":"澄","lèi,léi":"擂","piáo":"瓢","shà":"霎","mò,má":"蟆","qué":"瘸","liáo,liǎo":"燎","liào,liǎo":"瞭","sào,sāo":"臊","mí,méi":"糜","ái":"癌","tún":"臀","huò,huō,huá":"豁","pù,bào":"瀑","chuō":"戳","zǎn,cuán":"攒","cèng":"蹭","bò,bǒ":"簸","bó,bù":"簿","bìn":"鬓","suǐ":"髓","ráng":"瓤"};
					var hans,py,i=0;
					for(var py in pmap){
						hans = pmap[py];
						for(i=0;i<hans.length;i++){
							k.utils.pinyin.dict[hans[i]]=py;
						}
					}
				}
			},
			getSZM:function(han){
				//获取中文字段拼音首字母，超出3500常用字的用?填充，
				//含不同首字母多音字的，返回值前面加?
				k.utils.pinyin.init();
				var szm = '',zm,y0,zms;
				for(var i=0;i<han.length;i++){
					if(han[i].match(/^\w+$/i)){
						szm += han[i];
					}else if(zm = k.utils.pinyin.dict[han[i]]) {
				    	//暂时忽略多音节
//				    	if(zm.indexOf(',')) {
//				    		zms = zm.split(',');
//				    		for(var j=0;j<zms.length;j++){
//				    			if(zm[0] !== zms[j][0]) {
//				    				szm = '?'+szm;
//				    				break;
//				    			}
//				    		}
//				    	}
				    	y0 = k.utils.pinyin.yinbiao[zm[0]];
				    	szm += (y0?y0[0]:zm[0]);
				    }else{
				    	szm += '?';
				    }
				}
				return szm;
			}
		},
		extend:function(src,dist,cover){
			src = src || {};
			if(dist){
				for(var key in dist){
					if(cover || !src[key]){
						src[key] = dist[key];
					}
				}
			}
			return src;
		},
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var md5 = (function(){
		var rotateLeft = function(lValue, iShiftBits) {
			return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
		}
		var addUnsigned = function(lX, lY) {
			var lX4, lY4, lX8, lY8, lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
			if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			if (lX4 | lY4) {
				if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
		}
		var F = function(x, y, z) {
			return (x & y) | ((~ x) & z);
		}
		var G = function(x, y, z) {
			return (x & z) | (y & (~ z));
		}
		var H = function(x, y, z) {
			return (x ^ y ^ z);
		}
		var I = function(x, y, z) {
			return (y ^ (x | (~ z)));
		}
		var FF = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var GG = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var HH = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var II = function(a, b, c, d, x, s, ac) {
			a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
			return addUnsigned(rotateLeft(a, s), b);
		};
		var convertToWordArray = function(string) {
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWordsTempOne = lMessageLength + 8;
			var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
			var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
			var lWordArray = Array(lNumberOfWords - 1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while (lByteCount < lMessageLength) {
				lWordCount = (lByteCount - (lByteCount % 4)) / 4;
				lBytePosition = (lByteCount % 4) * 8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount - (lByteCount % 4)) / 4;
			lBytePosition = (lByteCount % 4) * 8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
			lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
			lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
			return lWordArray;
		};
		var wordToHex = function(lValue) {
			var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
			for (lCount = 0; lCount <= 3; lCount++) {
				lByte = (lValue >>> (lCount * 8)) & 255;
				WordToHexValueTemp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
			}
			return WordToHexValue;
		};
		var uTF8Encode = function(string) {
			string = string.replace(/\x0d\x0a/g, "\x0a");
			var output = "";
			for (var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);
				if (c < 128) {
					output += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					output += String.fromCharCode((c >> 6) | 192);
					output += String.fromCharCode((c & 63) | 128);
				} else {
					output += String.fromCharCode((c >> 12) | 224);
					output += String.fromCharCode(((c >> 6) & 63) | 128);
					output += String.fromCharCode((c & 63) | 128);
				}
			}
			return output;
		};
		return function(string) {
				var x = Array();
				var k, AA, BB, CC, DD, a, b, c, d;
				var S11=7, S12=12, S13=17, S14=22;
				var S21=5, S22=9 , S23=14, S24=20;
				var S31=4, S32=11, S33=16, S34=23;
				var S41=6, S42=10, S43=15, S44=21;
				string = uTF8Encode(string);
				x = convertToWordArray(string);
				a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
				for (k = 0; k < x.length; k += 16) {
					AA = a; BB = b; CC = c; DD = d;
					a = FF(a, b, c, d, x[k+0],  S11, 0xD76AA478);
					d = FF(d, a, b, c, x[k+1],  S12, 0xE8C7B756);
					c = FF(c, d, a, b, x[k+2],  S13, 0x242070DB);
					b = FF(b, c, d, a, x[k+3],  S14, 0xC1BDCEEE);
					a = FF(a, b, c, d, x[k+4],  S11, 0xF57C0FAF);
					d = FF(d, a, b, c, x[k+5],  S12, 0x4787C62A);
					c = FF(c, d, a, b, x[k+6],  S13, 0xA8304613);
					b = FF(b, c, d, a, x[k+7],  S14, 0xFD469501);
					a = FF(a, b, c, d, x[k+8],  S11, 0x698098D8);
					d = FF(d, a, b, c, x[k+9],  S12, 0x8B44F7AF);
					c = FF(c, d, a, b, x[k+10], S13, 0xFFFF5BB1);
					b = FF(b, c, d, a, x[k+11], S14, 0x895CD7BE);
					a = FF(a, b, c, d, x[k+12], S11, 0x6B901122);
					d = FF(d, a, b, c, x[k+13], S12, 0xFD987193);
					c = FF(c, d, a, b, x[k+14], S13, 0xA679438E);
					b = FF(b, c, d, a, x[k+15], S14, 0x49B40821);
					a = GG(a, b, c, d, x[k+1],  S21, 0xF61E2562);
					d = GG(d, a, b, c, x[k+6],  S22, 0xC040B340);
					c = GG(c, d, a, b, x[k+11], S23, 0x265E5A51);
					b = GG(b, c, d, a, x[k+0],  S24, 0xE9B6C7AA);
					a = GG(a, b, c, d, x[k+5],  S21, 0xD62F105D);
					d = GG(d, a, b, c, x[k+10], S22, 0x2441453);
					c = GG(c, d, a, b, x[k+15], S23, 0xD8A1E681);
					b = GG(b, c, d, a, x[k+4],  S24, 0xE7D3FBC8);
					a = GG(a, b, c, d, x[k+9],  S21, 0x21E1CDE6);
					d = GG(d, a, b, c, x[k+14], S22, 0xC33707D6);
					c = GG(c, d, a, b, x[k+3],  S23, 0xF4D50D87);
					b = GG(b, c, d, a, x[k+8],  S24, 0x455A14ED);
					a = GG(a, b, c, d, x[k+13], S21, 0xA9E3E905);
					d = GG(d, a, b, c, x[k+2],  S22, 0xFCEFA3F8);
					c = GG(c, d, a, b, x[k+7],  S23, 0x676F02D9);
					b = GG(b, c, d, a, x[k+12], S24, 0x8D2A4C8A);
					a = HH(a, b, c, d, x[k+5],  S31, 0xFFFA3942);
					d = HH(d, a, b, c, x[k+8],  S32, 0x8771F681);
					c = HH(c, d, a, b, x[k+11], S33, 0x6D9D6122);
					b = HH(b, c, d, a, x[k+14], S34, 0xFDE5380C);
					a = HH(a, b, c, d, x[k+1],  S31, 0xA4BEEA44);
					d = HH(d, a, b, c, x[k+4],  S32, 0x4BDECFA9);
					c = HH(c, d, a, b, x[k+7],  S33, 0xF6BB4B60);
					b = HH(b, c, d, a, x[k+10], S34, 0xBEBFBC70);
					a = HH(a, b, c, d, x[k+13], S31, 0x289B7EC6);
					d = HH(d, a, b, c, x[k+0],  S32, 0xEAA127FA);
					c = HH(c, d, a, b, x[k+3],  S33, 0xD4EF3085);
					b = HH(b, c, d, a, x[k+6],  S34, 0x4881D05);
					a = HH(a, b, c, d, x[k+9],  S31, 0xD9D4D039);
					d = HH(d, a, b, c, x[k+12], S32, 0xE6DB99E5);
					c = HH(c, d, a, b, x[k+15], S33, 0x1FA27CF8);
					b = HH(b, c, d, a, x[k+2],  S34, 0xC4AC5665);
					a = II(a, b, c, d, x[k+0],  S41, 0xF4292244);
					d = II(d, a, b, c, x[k+7],  S42, 0x432AFF97);
					c = II(c, d, a, b, x[k+14], S43, 0xAB9423A7);
					b = II(b, c, d, a, x[k+5],  S44, 0xFC93A039);
					a = II(a, b, c, d, x[k+12], S41, 0x655B59C3);
					d = II(d, a, b, c, x[k+3],  S42, 0x8F0CCC92);
					c = II(c, d, a, b, x[k+10], S43, 0xFFEFF47D);
					b = II(b, c, d, a, x[k+1],  S44, 0x85845DD1);
					a = II(a, b, c, d, x[k+8],  S41, 0x6FA87E4F);
					d = II(d, a, b, c, x[k+15], S42, 0xFE2CE6E0);
					c = II(c, d, a, b, x[k+6],  S43, 0xA3014314);
					b = II(b, c, d, a, x[k+13], S44, 0x4E0811A1);
					a = II(a, b, c, d, x[k+4],  S41, 0xF7537E82);
					d = II(d, a, b, c, x[k+11], S42, 0xBD3AF235);
					c = II(c, d, a, b, x[k+2],  S43, 0x2AD7D2BB);
					b = II(b, c, d, a, x[k+9],  S44, 0xEB86D391);
					a = addUnsigned(a, AA);
					b = addUnsigned(b, BB);
					c = addUnsigned(c, CC);
					d = addUnsigned(d, DD);
				}
				var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
				return tempValue.toLowerCase();
			}
	})();
	k.safe={
		local_pwd:function(pwd){
			return md5(md5(pwd)+pwd);
		},
		up_pwd:function(local,pwd){
			return md5(local+pwd);
		},
	}
})(window.kaidanbao);
/** http://usejsdoc.org/
 */
(function(k){
	k.conf={appName:'kaidanbao'}//全局变量名称，window.kaidanbao
	k.conf.shuzi_quan=['〇','①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩'];
	k.conf.shuzi_roma=['〇','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ'];
})(window.kaidanbao);/**
 * 静态表数据的完整缓存，可直接使用
 */
(function(k){
	var u=k.utils;
	var fixed={},					//所有 f 记录均缓存
		local,//本地存储
		fixed_by_table={			//分表格存储id
			setup:[],clerk:[],customer:[],supplier:[],account:[],product:[],
		},
		name_cache={
			customer:{},
			product:'', //产品名字可以重复
			supplier:{},
			clerk:{},
			account:{},
			repository:{}
		},
		fixed_page={   //固定表页面缓存
			customer:[],supplier:[],account:[],product:[],clerk:[],
		},
		dynamic_page={},//动态表页面缓存，每个表保存一个月的缓存，k.dao使用
		setup={},//分类{a0:{},a2:{},...,b0:{},b1:{}}
		sign={   //登录参数，
//			user_id   :0,		//当前本地库所属用户id
//			staff_id  :0,	    //当前登录的客户staffid
//			box_id  :0,		    //当前本地数据库序号，用户用户记录id前缀@k.dao.getId()
//			need_create_db  :0, //是否需要新建数据库
//			month_length:0,		//用户从注册到目前的月份数
//			session:{token,usb},//会话信息
//			user:{}  //客户信息，含用户列表
//			loaded:false,//已登录且loading完成
		},
		dates={//相关时间常量
			m_t: [], //['2016-09','2016-08','2016-07',...]
			m_t_map:{},//{'2016-09':0,'2016-08':1,'2016-07':2,...}
			mt : [],//['1609','1608','1607',...]
			mt_map:{},//{'1609':0,'1608':1,'1607':2,...}
			mi : [new Date().getMonth()],//月份序号，Date().getMonth()对应m_t下标
			mts: [], //[1476360544555,1476360546422,...]对应m_t每个月的开始时间戳
			mts_max:2548944000000, //2050/10/10
		},
		sys={   //系统参数,需要持久化到本地库，用于同步控制，离线识别，每次登陆后全部加载
//			index_id:0,		  //当前用户记录id后缀序号@k.dao.getId()
//			syn_fixed_last_time :0, //最后静态表同步时间戳
//			syn_dynamic_last_time :0, //最后动态表同步时间戳
		};
	k.cache={
		fixed:fixed,name_cache:name_cache,dynamic:dynamic_page,fixed_page:fixed_page,
		sign:sign,dates:dates,sys:sys,
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
//			localStorage.clear();
		},
		setup:function(type){
			return fixed['i'+setup[type]] || '';
		},
		get:function(id){return fixed['i'+id] || ''},//防止undefine
		put:function(value,fupd){
			if(value.tp === 'f'){
				if(fupd) u.extend(fixed['i'+value._id],value,true); 
				else fixed['i'+value._id] = value;
				if(name_cache[value.tn] && value.name) name_cache[value.tn][value.name]=value._id;
				if(fixed_by_table[value.tn]) fixed_by_table[value.tn].unshift(value._id);
				if(fixed_page[value.tn]) fixed_page[value.tn].unshift(value._id);
			}
			if(fupd) fupd();
		},
		fixed_by_table:fixed_by_table,
		init:function(comp){
			//初始化时间常量
			dates.m_t = k.utils.date.get_before_yms(15);
			for(var n in dates.m_t){
				n = parseInt(n);
				dates.mt.push(dates.m_t[n].substr(2).replace('-',''));
				dates.m_t_map[dates.m_t[n]] = n;
				dates.mt_map[dates.mt[n]] = n;
				if(dates.mi[n]==0) dates.mi[n+1] = 11;
				else dates.mi[n+1] = dates.mi[n]-1;
				dates.mts.push(new Date(dates.m_t[n].replace('-','/')+'/1').getTime());
			}
			sign.month_length = Math.ceil((new Date().getTime()-sign.user.ct)/2629800000);
			k.dao.queryAllFixed(function(err,r){
				if(r){
					fixed['i'+r._id] = r;
					if(fixed_by_table[r.tn]) fixed_by_table[r.tn].push(r._id);
					if(fixed_page[r.tn]) fixed_page[r.tn].push(r._id);
					if(name_cache[r.tn] && r.name) name_cache[r.tn][r.name]=r._id;
				}else{
					var value,i;
					for(i in fixed_by_table['setup']){
						value = fixed['i'+fixed_by_table['setup'][i]];
						setup[value.type]=value._id;
					}
					if(!setup.roll){//插入角色字段
						k.dao.addOne(k.conf.preinsert.roll,function(err,r){
							setup.roll=r._id;
						});
					}
					if(!setup.classify){//插入分类字段
						k.dao.addOne(k.conf.preinsert.classify,function(err,r){
							setup.classify=r._id;
						});
					}
					if(!setup.setting){//插入设置字段
						k.dao.addOne(k.conf.preinsert.setting,function(err,r){
							setup.setting=r._id;
						});
					}
					if(fixed_by_table.account.length==0){//插入现金账号
						k.dao.addOne(k.conf.preinsert.xianjin);
					}
					comp();
				}
			});
		},
	}
})(window.kaidanbao);/**
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
	var count=function(table,comp,upddb){
		var mydb = upddb?db_upd:db;
		mydb.doTransaction(table,function(e){
			e.count().onsuccess=function(v){
				if(comp) {comp(v.target.result); }
			};
		});
	};
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
	if(k.cache.sign.need_create_db){
		indexedDB.deleteDatabase(k.conf.db.name+k.cache.sign.user_id);//删除旧库
	}
	var openDB = function(comp){
		var cn=indexedDB.open(k.conf.db.name+k.cache.sign.user_id,1);
		cn.onupgradeneeded=function(e){
		  db=e.target.result;
		  db.createObjectStore('fixed_table',{keyPath:'_id'}).createIndex('lm','lm');
		  db.createObjectStore('salebill',{keyPath:'_id'}).createIndex('ct','ct'); //销售单
		  db.createObjectStore('bringbill',{keyPath:'_id'}).createIndex('ct','ct');//采购单
		  db.createObjectStore('checkbill',{keyPath:'_id'}).createIndex('ct','ct');//盘点单
		  db.createObjectStore('productbill',{keyPath:'_id'}).createIndex('ct','ct');//生产单
		  db.createObjectStore('moneyflow',{keyPath:'_id'}).createIndex('ct','ct');//资金流水
		  db.createObjectStore('manuals',{keyPath:'_id'}).createIndex('ct','ct');//使用手册、常见问题、我的提问、单独使用，不在同步体系
		  db.createObjectStore('log',{keyPath:'_id'}).createIndex('ct','ct');//操作日志，存本地不上传
		  db.createObjectStore('sys',{keyPath:'id'});//sys_table
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
	var getId=function(n,comp){
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
	};
// =================================================================
	k.dao = {
		get:get,
		add:add,
		put:put,
		upd:upd,
		count:count,
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
		 */
		addOne:function(value,comp,model){
			k.cache.dynamic[value.tn]=null;
			value.ui=k.cache.sign.user_id;
			value.si=k.cache.sign.staff_id;
			value.ct=u.date.getNow();
			value.lm=value.ct;
			value.tp=k.conf.table[value.tn]._tp;
			getId(1,function(ids){
				value._id=ids[0];
				if(model === 1){
					k.cache.put(value);
					if(comp) comp(false,value);
				}else if(model === 2){
					add(value.tp==='f'?'fixed_table':value.tn,value,function(id){
						if(id) k.cache.put(value);
						if(comp) {comp(!id,value); }
					});
				}else if(model === 3){
					add(value.tp==='f'?'fixed_table':value.tn,value,function(id){
						if(id){
							add('upd',value,function(id2){
								if(id2) k.cache.put(value);
								else del(value.tp==='f'?'fixed_table':value.tn,id);
								if(comp) comp(!id2,value);
							},1);
						}else if(comp) comp(true,value);
					});
				}else {
					add(value.tp==='f'?'fixed_table':value.tn,value,function(id){
						if(id){
							k.cache.put(value);
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
			});
		},
		/**更新一条记录
		 * @value 更新字段集合
		 * @conp 回调函数
		 * @model 1缓存->2本地库->3上传库->4网络云端(默认)
		 */
		updOne:function(value,comp,model){
			if(value.tn) k.cache.dynamic[value.tn]=null;
			value.lm=u.date.getNow();
			value.tp= k.conf.table[value.tn]._tp;
			var table = (value.tp==='f'?'fixed_table':value.tn);
//			delete value.tn;
			//1静态记录缓存更新
			if(model===1) {
				k.cache.put(value,function(v1){if(comp) comp(false,v1);});
			}else if(model === 2){
				upd(table,value,function(v2){
					if(v2) k.cache.put(v2);
					if(comp) {comp(!v2,v2); }
				});
			}else if(model === 3){
				upd(table,value,function(v3){
					if(v3){
						k.cache.put(v3);
						upd('upd',value,function(v){
							if(comp) comp(!v,v3);
						},true,1);
					}else if(comp) {comp(true,v3); }
				});
			}else{
				upd(table,value,function(v4){
					if(v4){
						k.cache.put(v4);
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
		/**添加多条记录（使用addOne再upl）无cache */
//		addMany:function(values,comp){
//			var now=u.date.getNow(),s1=0,s2=0,
//				i,c1=0,c2=0,len=values.length;
//			getId(len,function(ids){
//				for(i in values){
//					values[i]._id=ids[i];
//					values[i].ui=k.conf.sign.user_id;
//					values[i].si=k.conf.sign.staff_id;
//					values[i].ct=now;
//					values[i].lm=now;
//					values[i].tp = k.conf.table[values[i].tn]._tp;
//					add('upddb',values[i],function(id1){
//						if(id1) s1++;
//						if(++c1 === len){ k.syn.upl(); }
//					});
//				    add(values[i].tp==='f'?'fixed_table':values[i].tn,values[i],function(id2){
//				    	if(id2) s2++;
//				    	if(++c2 === len){//complete
//				    		if(comp) comp();
//				    	}
//				    });
//				}
//			});
//		},
		queryAllFixed : function(comp) {
			db.doTransaction('fixed_table', function(e) {
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
			var table_cache=k.cache.dynamic[table];
			if(table_cache && table_cache[month]) {
				comp(true);
			}else{
				k.cache.dynamic[table] = {};
				var m = k.cache.dates.m_t_map[month],arr=[];
				var start = k.cache.dates.mts[m],end = k.cache.dates.mts_max;
				if(m > 0) end = k.cache.dates.mts[m-1];
				var range = IDBKeyRange.bound(start, end, true, false);
				db.doTransaction(table,function(e) {
					e.index('ct').openCursor(range, (sort || 'prev')).onsuccess = function(e){
						var r = e.target.result; // 从存储对象中获取索引对象
						if (r) {
							arr.push(r.value);
							comp(null, r.value);
							r['continue']();
						} else {
							k.cache.dynamic[table][month]=arr;
							comp(true);
						}
					};
				});
			}
		},
		/** @table upddb or sys */
		queryAll : function(table, comp,upddb) {
			var mydb = upddb?db_upd:db;
			mydb.doTransaction(table, function(e) {
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
		del:function(table,id,comp){
			k.dao.updOne({_id:id,tn:table,st:'d'},comp);
		},
		init:function(comp){
			openDB(function(){
				comp();
			});
		}
	};
})(window.kaidanbao);/**
 * http://usejsdoc.org/
 * 为了方便，快捷，仅能保证99.9%的一致性，如下情况可能导致不一致：
 * 1，离线使用后，未通过在线登陆上传数据
{"ln":"13702307103","dbv":20161022,"ll13702307103":1478176819793,"lp13702307103":"0b9033f6122972a588cd2b41e11dedce","ui13702307103":21,"si13702307103":1,"bi13702307103":103}
 */
(function(k){
	var u = k.utils;
	var upl = function(comp){
		var ups = [];
		k.dao.queryAll('upd',function(finish,v){
			if(finish){
				if(ups.length > 0){
					k.net.api('/user/upl',ups,function(err,r){
						if(err){
						}else{
							if(r.obj.all){
								k.dao.clearupddb();
							}else{
								for(var i in r.obj.ids){
									k.dao.delupddb(r.obj.ids[i]);
								}
							}
						}
						if(comp) comp(err,r);
					});
				}else if(comp) comp(true);
			}else{
				ups.push(v);
			}
		},1);
	}
	var down=function(type,after,before,comp){
		k.net.api('/user/down',{ui:k.cache.sign.user_id,tp:type,before:before,after:after},function(err,r){
			if(err){
				comp(err,null);
			}else{
				for(var i in r.obj){
					k.dao.put(type==='f'?'fixed_table':r.obj[i].tn,r.obj[i]);
				}
				comp(null,r);
			}
		});
	}
	k.syn={
		upl:upl,
		down:down,
		init:function(comp){
			if(k.cache.sign.need_create_db){
				/** 本次新建数据库 */
				if(k.cache.sign.user) k.dao.put('sys',{id:'user',value:k.cache.sign.user});
				k.cache.sys.index_id=0;
				k.cache.sys.syn_fixed_last_time=0;
				k.cache.sys.syn_dynamic_last_time=0;
				
				var now = u.date.getNow();
				down('f',0,0,function(err,r){
					if(err){//下载失败f
					}else{
						k.cache.sys.syn_fixed_last_time = now;
						k.dao.put('sys',{id:'syn_fixed_last_time',value:now});
						now = u.date.getNow();
						down('d',k.cache.dates.mts[2],0,function(err1,r1){
							if(err1){//下载失败d
							}else{
								k.cache.sys.syn_dynamic_last_time = now;
								k.dao.put('sys',{id:'syn_dynamic_last_time',value:now});
								comp();
							}
						});
					}
				});
			}else{
				/** 再次登录 */
				k.dao.queryAll('sys',function(err,r){
					if(r){
						k.cache.sys[r.id] = r.value;
					}else{
						if(k.cache.sign.user){
							k.dao.put('sys',{id:'user',value:k.cache.sign.user});
						}else k.cache.sign.user = k.cache.sys.user;
						k.cache.sys.index_id              = k.cache.sys.index_id              || 0;
						k.cache.sys.syn_fixed_last_time   = k.cache.sys.syn_fixed_last_time   || 0;
						k.cache.sys.syn_dynamic_last_time = k.cache.sys.syn_dynamic_last_time || 0;
						if(k.cache.sign.session){  //与服务器同步数据
							upl(function(){  //先上传，再下载
								var now = u.date.getNow();
								down('f',k.cache.sys.syn_fixed_last_time,0,function(err,r){
									if(err){//下载失败f
									}else{
										k.cache.sys.syn_fixed_last_time = now;
										k.dao.put('sys',{id:'syn_fixed_last_time',value:now});
									}
									now = u.date.getNow();
									down('d',k.cache.sys.syn_dynamic_last_time,0,function(err1,r1){
										if(err1){//下载失败d
										}else{
											k.cache.sys.syn_dynamic_last_time = now;
											k.dao.put('sys',{id:'syn_dynamic_last_time',value:now});
										}
										comp();
									});
								});
							});
						}else comp();
					}
				});
			}
		},
		sse:function(){//server send event
			var sse =new EventSource('/event/sse?'+k.cache.sign.session.usb);
			sse.onmessage=function(e){//{t:类型,v:值,end:是否结束}
				console.log('<li>'+ e.data +'</li> - '+u.date.getTimeFormat(0,'dt'));
//				var msg=JSON.parse(e.data);
//				if(msg.t==='logout'){
//					//用户下线
//				}else if(msg.t==='login'){
//					//用户上线
//				}else if(msg.t==='signout'){
//					//退出登录
//				}else if(msg.t==='addOne'){
//					//添加一条记录
//				}else if(msg.t==='updOne'){
//					//更新一条记录
//				}else if(msg.t==='upl'){
//					//上载一条记录
//					if(msg.end){
//						//上载结束
//					}
//				}else if(msg.t==='print'){
//					//远程打印
//				}else{
//					//其他
//				}
			}
			sse.onerror=function(){
				console.log('sse err , close'+u.date.getTimeFormat(0,'dt'));
				sse.close();
			}
		}
	}
})(window.kaidanbao);/**
 * http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var timer;
	k.aspect={
		/** 组件提示，消息，弹框，进度
		 */
		noty:{
			message:function(msg){
				if(timer) clearTimeout(timer);
				$('.noty.message').remove();
				$('body').append('<div class="noty message">'+msg+'</div>');
				timer = setTimeout(function() {
					$('.noty.message').remove();
				}, 2000);
			},
			confirm:function(msg,comp,only_sure,timeout,width){//单位：秒
//				$('div.noty.confirm button.cancel').click();
				$('body').append(' \
						<div id="confirm-mask"><progress style="width:100%;height:3%;"></progress></div> \
						<div class="noty confirm"> \
						  <div>'+(msg || '请确认！')+'<br /><br /> \
							  <button class="ensure">确定</button> \
							  <button class="cancel" style="color:#f08;margin-left:5px;">取消</button> \
						  </div> \
						</div>');
				$('div.noty.confirm>div').css('width',width || '450px');
				var inter;
				if(timeout){//超时关闭的进度条
					var val = timeout * 25;
					$('#confirm-mask progress').attr('max',val).attr('value',val);
					inter = setInterval(function(){
						$('#confirm-mask progress').attr('value',--val);
						if(val < 1) {
							clearInterval(inter);
							$('div.noty.confirm button.cancel').click();
						}
					},40);
				}else $('#confirm-mask progress').remove();
				$('div.noty.confirm button.ensure').click(comp);
				$('div.noty.confirm button.cancel').click(function(){
					if(inter) clearInterval(inter);
					$('div.noty.confirm').remove();
					$('#confirm-mask').remove();
				});
				if(only_sure){
					$('div.noty.confirm button.cancel').attr('hidden','hidden');
				}
			},
			confirm_close:function(){
				$('div.noty.confirm button.cancel').click();
			},
			progress:function(msg){
				$('body').append('<div class="noty progress">'+(msg || '正在处理，请稍候...')+'<br /><br /><progress></progress></div>');
			},
			close_progress:function(){
				$('div.noty.progress').remove();
			}
		},
		pay:function(conf,comp){
			var h1=(conf.title || '微信扫码支付')+' - ￥'+(conf.price || 288);
			k.aspect.noty.confirm('<h1>'+h1+'</h1><br /> \
					<img src="/image/vx.jpg" style="width:301px;"><br /> \
					<input placeholder="序列号 XXXX-XXXX-XXXX" spellcheck="false" class="cdkey" style="width:320px;" />',
			function(){
				var cdkey = $('div.noty.confirm input.cdkey').val().trim();
				if(!/^[A-Z]{4}-[A-Z]{4}-[A-Z]{4}$/.test(cdkey)){
					k.aspect.noty.message('序列号不对，请检查！');
					return;
				}
				conf.param.cdkey=cdkey;
				k.aspect.noty.progress('操作中。。。');
				k.net.api(conf.url,conf.param,function(err,r){
					k.aspect.noty.close_progress();
					if(err) k.aspect.noty.message('操作失败！');
					else comp(r);
				},conf.no_session);
			},false,300);
		},
	}
})(window.kaidanbao);
/**
 * 页面框架
 */
(function(k){
	//文档加载结束，基于url HASH执行函数，保证最终HASH不低于二级
	var oldHash='#/sign/nothing',
		defaultHash = '#/sign/login',
		urlHashMap={'#/sign/login':1,'#/sign/register':1,'#/sign/forget':1,'#/sign/loading':1},
		secondHash={'#/sign':'login'};
	k.frame={
		current_plugin:'',	//当前页面
		init:function(){
			if(!document.getElementById('print')){
				$('body').append('<div id="print"><div class="print"></div></div>');
			}
			if(!document.getElementById('export')){
				$('body').append('<div id="export"></div><input type="file" id="importfile" hidden accept="application/vnd.ms-excel" onchange="kaidanbao.plugin.store.import_check(this.files[0])">');
			}
			if(!document.getElementById('layout')){
				$('body').append('<div hidden id="layout"><div class="lay-main"></div></div>');
			}
			$('#layout').append('<div class="lay-top"><ul></ul></div>');
			if($('#layout  div.lay-main').length===0){
				$('#layout').append('<div class="lay-main"></div>');
			}
			var json = k.conf.frame;
			//json['p'][m]['sol'][n]['plug'][l]
			var p=json['p'],sol,plug,i,j,m,en,cn;
			for(i=0;i<p.length;i++){
				if(p[i]['sol'].length === 0) continue;
				en=p[i]['en'];cn=p[i]['cn'];
				secondHash['#/'+en]=p[i]['sol'][0]['plug'][0]['en'];
				$('#layout').append('<div hidden class="lay-left '+en+'"></div>');
				$('#layout div.lay-top ul').append('<li class="'+en+'"><a href="#/'+en+'">'+cn+'</a></li>');
				sol = p[i]['sol'];
				for(j=0;j<sol.length;j++){
					$('#layout div.'+en).append('<h2>'+sol[j]['cn']+'</h2><ul class="'+sol[j]['en']+'"></ul>');
					plug=sol[j]['plug'];
					for(m=0;m<plug.length;m++){
						$('#layout div.'+en+' ul.'+sol[j]['en']).append(
							'<li class="'+plug[m]['en']+'"><a href="#/'+en+'/'+plug[m]['en']+'">'+plug[m]['cn']+'</a></li>');
						urlHashMap['#/'+en+'/'+plug[m]['en']]=1;
					}
				}
			}
			k.frame.hashchangeHandle();
		},
		hashchangeHandle : function(){
			var newHashArr,oldHashArr;
			var newHash = window.location.hash;
			
			if(oldHash===newHash) return;
			
			//只能通过'#/sign/login'进入'#/sign/loading'
			if(newHash==='#/sign/loading' && oldHash!=='#/sign/login'){
				location.href = './';
				return;
			}
			if(newHash){
				if(secondHash[newHash]){
					location.replace(newHash+'/'+secondHash[newHash])
					return;
				}
				if(urlHashMap[newHash]){
					newHashArr = newHash.split('/');
					oldHashArr = oldHash.split('/');
					secondHash['#/'+newHashArr[1]] = newHashArr[2];
					
					//sign只能通过'#/sign/loading'进入非sign
					if(newHashArr[1] !== 'sign' && oldHashArr[1]==='sign' && oldHashArr[2]!=='loading'){
						location.href = './';
						return;
					}
//					k.conf.sign.plug_name=newHashArr[2];
					k.frame.current_plugin=newHashArr[2];
					k.plugin._change(oldHashArr,newHashArr);
					k.frame._change(oldHashArr,newHashArr);
					
					oldHash = newHash;
				}else{
					location.href = './';
				}
			}else{
				location.replace(defaultHash)
			}
		},
		_change:function(oldHashArr,newHashArr) {
			if(newHashArr[1] === 'sign' && oldHashArr[1] === 'sign'){
				//TODO 样式测试用
//				$('#sign .sign-button-login button').click();
				if(newHashArr[2] === 'loading'){
					$('#sign .sign-main').attr('hidden','hidden');
					$('#sign .sign-loading').removeAttr('hidden');
				}else{
					$('#sign .sign-input-wrapper,#sign .sign-button-wrapper,#sign .sign-a-wrapper div').attr('hidden','hidden');
					$('#sign .sign-input-password,#sign .sign-input-loginname').removeAttr('hidden');
					$('#sign .sign-a-wrapper div').css('float','left');
					if(newHashArr[2] === 'login'){
						$('#sign .sign-button-login,#sign .sign-a-wrapper div.register,#sign .sign-a-wrapper div.forget').removeAttr('hidden');
						$('#sign .sign-a-wrapper div.forget').css('float','right');
					}else if(newHashArr[2] === 'register'){
						$('#sign .sign-input-inc,#sign .sign-button-register,#sign .sign-a-wrapper div.login,#sign .sign-a-wrapper div.forget').removeAttr('hidden');
						$('#sign .sign-a-wrapper div.forget').css('float','right');
					}else if(newHashArr[2] === 'forget'){
						$('#sign .sign-input-captcha,#sign .sign-button-forget,#sign .sign-a-wrapper div.login,#sign .sign-a-wrapper div.register').removeAttr('hidden');
						$('#sign .sign-a-wrapper div.register').css('float','right');
					}
				}
			}else{
				if(oldHashArr[1] === 'sign'){
					$('#sign').attr('hidden','hidden');
					$('#layout').removeAttr('hidden');
					$('#layout div.'+newHashArr[1]).removeAttr('hidden');
					$('#layout div.'+newHashArr[1]+' li.'+newHashArr[2]).addClass('selected');
					$('#layout div.lay-top li.'+newHashArr[1]).addClass('selected');
					$('#layout div.lay-main div.'+newHashArr[2]).removeAttr('hidden');
				}else{
					if(oldHashArr[1] === newHashArr[1]){
						$('#layout div.'+oldHashArr[1]+' li.'+oldHashArr[2]).removeClass('selected');
					}else{
						$('#layout div.'+oldHashArr[1]).attr('hidden','hidden');
						$('#layout div.'+newHashArr[1]).removeAttr('hidden');
						$('#layout div.lay-top li.'+oldHashArr[1]).removeClass('selected');
						$('#layout div.lay-top li.'+newHashArr[1]).addClass('selected');
					}
					$('#layout div.'+newHashArr[1]+' li.'+newHashArr[2]).addClass('selected');
					$('#layout div.lay-main div.'+oldHashArr[2]).attr('hidden','hidden');
					$('#layout div.lay-main div.'+newHashArr[2]).removeAttr('hidden');
				}
			}
		},	
	}
})(window.kaidanbao);/**
 * http://usejsdoc.org/
 */
(function(k){
	k.plugin={
		_initedCache:{},
		_change:function(oldHashArr,newHashArr) {
			var oldname = oldHashArr[2];//释放旧页面
			if(k.plugin[oldname] && k.plugin[oldname].release)  k.plugin[oldname].release();
			
			var newname = newHashArr[2];
			if(k.plugin._initedCache[newname]){
				k.plugin._initedCache[newname] += 1;
				//重新加载新页面
				if(k.plugin[newname] && k.plugin[newname].reload)  k.plugin[newname].reload();
			}else{
				k.plugin._initedCache[newname]=1;
//				console.log(oldHashArr,newHashArr);
				//初始化新页面
				if(k.plugin[newname] && k.plugin[newname].init) k.plugin[newname].init();
			}
		}
	}
})(window.kaidanbao);
/**
 * http://usejsdoc.org/
 */
(function(k){
	var u = k.utils;
	var ajax = function(conf, comp, prgr) {
	    // 默认配置
		u.extend(conf, {
	        url :'/default/path',
	        method : 'POST',
	        timeout : 30000,
	    });
		$.ajax({ 
			url: conf.url+'?'+new Date().getTime(),
			type : conf.method,
			timeout:conf.timeout,
			data:conf.data?JSON.stringify(conf.data):null,
			complete:function(xhr,ts){
				if (xhr.status === 200) {
	            	comp(null,JSON.parse(xhr.responseText));
	            } else {
	                comp(xhr);
	            }
			},
		});
	}
	k.net={
		api:function(api_path,param,comp,do_not_need_session){
			if(do_not_need_session || k.cache.sign.session){
				ajax({url:api_path,data:{s:k.cache.sign.session || {},p:param}},function(err,r){
					if(err){
						comp(err);
					}else if(r.code === 200){
						comp(null,r);
					}else{
						comp(r);
						if(r.msg) k.aspect.noty.message(r.msg);
					}
				});
			}else comp({msg:'no session'});
		},
	}
})(window.kaidanbao);
