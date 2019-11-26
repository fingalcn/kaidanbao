/**
 * http://usejsdoc.org/
 */
(function(k){
	var pinyin_already_init=false;
	var detector;
	k.utils={
		doSomethingMonthly:function(key,save){//key:save_static,clear_statement
			var sd0='s'+k.cache.dates.mt[0];
			//确保名称为key的事件每月仅执行一次
			if(!k.cache.sys.doSomethingMonthly[key+sd0]){
				k.cache.sys.doSomethingMonthly[key+sd0] = 1;
				if(save) k.dao.put('sys',{id:'doSomethingMonthly',value:k.cache.sys.doSomethingMonthly});
				return true;
			}
		},
		escapeRegExChars: function (value) {//搜索时对特殊字符进行转义
            return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
        },
		valid_loginname:function(val){
			//校验用户名
			if(/^[0-9a-zA-Z]{2,16}$/.test(val)){
				return true;
			}else k.aspect.noty.message('用户名由字母和数字组成');
		},
		valid_smscode:function(val){
			//校验短信验证码
			if(/^[0-9]{4}$/.test(val)){
				return true;
			}else k.aspect.noty.message('短信验证码格式错误');
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
//			picker:function(clazz,conf){
//				conf = k.utils.extend(conf,{
//					format: "yyyy-mm-dd",
//				    weekStart: 0,
//				    todayBtn: 'linked',
//				    clearBtn: true,
//				    language: "zh-CN",
//				    todayHighlight: true,
//				    autoclose: true
//				});
//				$(clazz).datepicker(conf);
//			},
			getDayTimestamp:function(date){
				//YYYY-MM-DD,获取指定日期时间戳
				return new Date(date.replace(/-/g,'/')).getTime();
			},
			getNow:function(){
				//获取当前毫秒数
				return new Date().getTime();
			},
			getDayTimes:function(n,start){
				var first = start?new Date(start).getTime():new Date().getTime();
				//日期YYYY-MM-DD，n为相对于今天的偏离天数，可以为实数
				if(n) return first+(n*86400000);
				else return first;
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
		get_device:function(box_id){
			if(!detector){
				detector = (function(){
					"use strict";
					var win = typeof window === "undefined" ? global : window;
					var external = win.external;
					var re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;
					var re_blackberry_10 = /\bbb10\b.+?\bversion\/([\d.]+)/;
					var re_blackberry_6_7 = /\bblackberry\b.+\bversion\/([\d.]+)/;
					var re_blackberry_4_5 = /\bblackberry\d+\/([\d.]+)/;
					
					var NA_VERSION = "-1";
					
					// 硬件设备信息识别表达式。
					// 使用数组可以按优先级排序。
					var DEVICES = [["nokia", function (ua) {
					  // 不能将两个表达式合并，因为可能出现 "nokia; nokia 960"
					  // 这种情况下会优先识别出 nokia/-1
					  if (ua.indexOf("nokia ") !== -1) {
					    return (/\bnokia ([0-9]+)?/
					    );
					  } else {
					    return (/\bnokia([a-z0-9]+)?/
					    );
					  }
					}],
					// 三星有 Android 和 WP 设备。
					["samsung", function (ua) {
					  if (ua.indexOf("samsung") !== -1) {
					    return (/\bsamsung(?:[ \-](?:sgh|gt|sm))?-([a-z0-9]+)/
					    );
					  } else {
					    return (/\b(?:sgh|sch|gt|sm)-([a-z0-9]+)/
					    );
					  }
					}], ["wp", function (ua) {
					  return ua.indexOf("windows phone ") !== -1 || ua.indexOf("xblwp") !== -1 || ua.indexOf("zunewp") !== -1 || ua.indexOf("windows ce") !== -1;
					}], ["pc", "windows"], ["ipad", "ipad"],
					// ipod 规则应置于 iphone 之前。
					["ipod", "ipod"], ["iphone", /\biphone\b|\biph(\d)/], ["mac", "macintosh"],
					// 小米
					["mi", /\bmi[ \-]?([a-z0-9 ]+(?= build|\)))/],
					// 红米
					["hongmi", /\bhm[ \-]?([a-z0-9]+)/], ["aliyun", /\baliyunos\b(?:[\-](\d+))?/], ["meizu", function (ua) {
					  return ua.indexOf("meizu") >= 0 ? /\bmeizu[\/ ]([a-z0-9]+)\b/ : /\bm([0-9cx]{1,4})\b/;
					}], ["nexus", /\bnexus ([0-9s.]+)/], ["huawei", function (ua) {
					  var re_mediapad = /\bmediapad (.+?)(?= build\/huaweimediapad\b)/;
					  if (ua.indexOf("huawei-huawei") !== -1) {
					    return (/\bhuawei\-huawei\-([a-z0-9\-]+)/
					    );
					  } else if (re_mediapad.test(ua)) {
					    return re_mediapad;
					  } else {
					    return (/\bhuawei[ _\-]?([a-z0-9]+)/
					    );
					  }
					}], ["lenovo", function (ua) {
					  if (ua.indexOf("lenovo-lenovo") !== -1) {
					    return (/\blenovo\-lenovo[ \-]([a-z0-9]+)/
					    );
					  } else {
					    return (/\blenovo[ \-]?([a-z0-9]+)/
					    );
					  }
					}],
					// 中兴
					["zte", function (ua) {
					  if (/\bzte\-[tu]/.test(ua)) {
					    return (/\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/
					    );
					  } else {
					    return (/\bzte[ _\-]?([a-su-z0-9\+]+)/
					    );
					  }
					}],
					// 步步高
					["vivo", /\bvivo(?: ([a-z0-9]+))?/], ["htc", function (ua) {
					  if (/\bhtc[a-z0-9 _\-]+(?= build\b)/.test(ua)) {
					    return (/\bhtc[ _\-]?([a-z0-9 ]+(?= build))/
					    );
					  } else {
					    return (/\bhtc[ _\-]?([a-z0-9 ]+)/
					    );
					  }
					}], ["oppo", /\boppo[_]([a-z0-9]+)/], ["konka", /\bkonka[_\-]([a-z0-9]+)/], ["sonyericsson", /\bmt([a-z0-9]+)/], ["coolpad", /\bcoolpad[_ ]?([a-z0-9]+)/], ["lg", /\blg[\-]([a-z0-9]+)/], ["android", /\bandroid\b|\badr\b/], ["blackberry", function (ua) {
					  if (ua.indexOf("blackberry") >= 0) {
					    return (/\bblackberry\s?(\d+)/
					    );
					  }
					  return "bb10";
					}]];
					
					// 操作系统信息识别表达式
					var OS = [["wp", function (ua) {
					  if (ua.indexOf("windows phone ") !== -1) {
					    return (/\bwindows phone (?:os )?([0-9.]+)/
					    );
					  } else if (ua.indexOf("xblwp") !== -1) {
					    return (/\bxblwp([0-9.]+)/
					    );
					  } else if (ua.indexOf("zunewp") !== -1) {
					    return (/\bzunewp([0-9.]+)/
					    );
					  }
					  return "windows phone";
					}], ["windows", /\bwindows nt ([0-9.]+)/], ["macosx", /\bmac os x ([0-9._]+)/], ["ios", function (ua) {
					  if (/\bcpu(?: iphone)? os /.test(ua)) {
					    return (/\bcpu(?: iphone)? os ([0-9._]+)/
					    );
					  } else if (ua.indexOf("iph os ") !== -1) {
					    return (/\biph os ([0-9_]+)/
					    );
					  } else {
					    return (/\bios\b/
					    );
					  }
					}], ["yunos", /\baliyunos ([0-9.]+)/], ["android", function (ua) {
					  if (ua.indexOf("android") >= 0) {
					    return (/\bandroid[ \/-]?([0-9.x]+)?/
					    );
					  } else if (ua.indexOf("adr") >= 0) {
					    if (ua.indexOf("mqqbrowser") >= 0) {
					      return (/\badr[ ]\(linux; u; ([0-9.]+)?/
					      );
					    } else {
					      return (/\badr(?:[ ]([0-9.]+))?/
					      );
					    }
					  }
					  return "android";
					  //return /\b(?:android|\badr)(?:[\/\- ](?:\(linux; u; )?)?([0-9.x]+)?/;
					}], ["chromeos", /\bcros i686 ([0-9.]+)/], ["linux", "linux"], ["windowsce", /\bwindows ce(?: ([0-9.]+))?/], ["symbian", /\bsymbian(?:os)?\/([0-9.]+)/], ["blackberry", function (ua) {
					  var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
					  return m ? { version: m[1] } : "blackberry";
					}]];
					
					// 针对同源的 TheWorld 和 360 的 external 对象进行检测。
					// @param {String} key, 关键字，用于检测浏览器的安装路径中出现的关键字。
					// @return {Undefined,Boolean,Object} 返回 undefined 或 false 表示检测未命中。
					function checkTW360External(key) {
					  if (!external) {
					    return;
					  } // return undefined.
					  try {
					    //        360安装路径：
					    //        C:%5CPROGRA~1%5C360%5C360se3%5C360SE.exe
					    var runpath = external.twGetRunPath.toLowerCase();
					    // 360SE 3.x ~ 5.x support.
					    // 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
					    // 因此只能用 try/catch 而无法使用特性判断。
					    var security = external.twGetSecurityID(win);
					    var version = external.twGetVersion(security);
					
					    if (runpath && runpath.indexOf(key) === -1) {
					      return false;
					    }
					    if (version) {
					      return { version: version };
					    }
					  } catch (ex) {/* */}
					}
					
					var ENGINE = [["edgehtml", /edge\/([0-9.]+)/], ["trident", re_msie], ["blink", function () {
					  return "chrome" in win && "CSS" in win && /\bapplewebkit[\/]?([0-9.+]+)/;
					}], ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/], ["gecko", function (ua) {
					  var match = ua.match(/\brv:([\d\w.]+).*\bgecko\/(\d+)/);
					  if (match) {
					    return {
					      version: match[1] + "." + match[2]
					    };
					  }
					}], ["presto", /\bpresto\/([0-9.]+)/], ["androidwebkit", /\bandroidwebkit\/([0-9.]+)/], ["coolpadwebkit", /\bcoolpadwebkit\/([0-9.]+)/], ["u2", /\bu2\/([0-9.]+)/], ["u3", /\bu3\/([0-9.]+)/]];
					var BROWSER = [
					// Microsoft Edge Browser, Default browser in Windows 10.
					["edge", /edge\/([0-9.]+)/],
					// Sogou.
					["sogou", function (ua) {
					  if (ua.indexOf("sogoumobilebrowser") >= 0) {
					    return (/sogoumobilebrowser\/([0-9.]+)/
					    );
					  } else if (ua.indexOf("sogoumse") >= 0) {
					    return true;
					  }
					  return (/ se ([0-9.x]+)/
					  );
					}],
					// TheWorld (世界之窗)
					// 由于裙带关系，TheWorld API 与 360 高度重合。
					// 只能通过 UA 和程序安装路径中的应用程序名来区分。
					// TheWorld 的 UA 比 360 更靠谱，所有将 TheWorld 的规则放置到 360 之前。
					["theworld", function () {
					  var x = checkTW360External("theworld");
					  if (typeof x !== "undefined") {
					    return x;
					  }
					  return (/theworld(?: ([\d.])+)?/
					  );
					}],
					// 360SE, 360EE.
					["360", function (ua) {
					  var x = checkTW360External("360se");
					  if (typeof x !== "undefined") {
					    return x;
					  }
					  if (ua.indexOf("360 aphone browser") !== -1) {
					    return (/\b360 aphone browser \(([^\)]+)\)/
					    );
					  }
					  return (/\b360(?:se|ee|chrome|browser)\b/
					  );
					}],
					// Maxthon
					["maxthon", function () {
					  try {
					    if (external && (external.mxVersion || external.max_version)) {
					      return {
					        version: external.mxVersion || external.max_version
					      };
					    }
					  } catch (ex) {/* */}
					  return (/\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/
					  );
					}], ["micromessenger", /\bmicromessenger\/([\d.]+)/], ["qq", /\bm?qqbrowser\/([0-9.]+)/], ["green", "greenbrowser"], ["tt", /\btencenttraveler ([0-9.]+)/], ["liebao", function (ua) {
					  if (ua.indexOf("liebaofast") >= 0) {
					    return (/\bliebaofast\/([0-9.]+)/
					    );
					  }
					  if (ua.indexOf("lbbrowser") === -1) {
					    return false;
					  }
					  var version = void 0;
					  try {
					    if (external && external.LiebaoGetVersion) {
					      version = external.LiebaoGetVersion();
					    }
					  } catch (ex) {/* */}
					  return {
					    version: version || NA_VERSION
					  };
					}], ["tao", /\btaobrowser\/([0-9.]+)/], ["coolnovo", /\bcoolnovo\/([0-9.]+)/], ["saayaa", "saayaa"],
					// 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
					["baidu", /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
					// 后面会做修复版本号，这里只要能识别是 IE 即可。
					["ie", re_msie], ["mi", /\bmiuibrowser\/([0-9.]+)/],
					// Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
					["opera", function (ua) {
					  var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
					  var re_opera_new = /\bopr\/([0-9.]+)/;
					  return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
					}], ["oupeng", /\boupeng\/([0-9.]+)/], ["yandex", /yabrowser\/([0-9.]+)/],
					// 支付宝手机客户端
					["ali-ap", function (ua) {
					  if (ua.indexOf("aliapp") > 0) {
					    return (/\baliapp\(ap\/([0-9.]+)\)/
					    );
					  } else {
					    return (/\balipayclient\/([0-9.]+)\b/
					    );
					  }
					}],
					// 支付宝平板客户端
					["ali-ap-pd", /\baliapp\(ap-pd\/([0-9.]+)\)/],
					// 支付宝商户客户端
					["ali-am", /\baliapp\(am\/([0-9.]+)\)/],
					// 淘宝手机客户端
					["ali-tb", /\baliapp\(tb\/([0-9.]+)\)/],
					// 淘宝平板客户端
					["ali-tb-pd", /\baliapp\(tb-pd\/([0-9.]+)\)/],
					// 天猫手机客户端
					["ali-tm", /\baliapp\(tm\/([0-9.]+)\)/],
					// 天猫平板客户端
					["ali-tm-pd", /\baliapp\(tm-pd\/([0-9.]+)\)/],
					// UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
					// UC 桌面版浏览器携带 Chrome 信息，需要放在 Chrome 之前。
					["uc", function (ua) {
					  if (ua.indexOf("ucbrowser/") >= 0) {
					    return (/\bucbrowser\/([0-9.]+)/
					    );
					  } else if (ua.indexOf("ubrowser/") >= 0) {
					    return (/\bubrowser\/([0-9.]+)/
					    );
					  } else if (/\buc\/[0-9]/.test(ua)) {
					    return (/\buc\/([0-9.]+)/
					    );
					  } else if (ua.indexOf("ucweb") >= 0) {
					    // `ucweb/2.0` is compony info.
					    // `UCWEB8.7.2.214/145/800` is browser info.
					    return (/\bucweb([0-9.]+)?/
					    );
					  } else {
					    return (/\b(?:ucbrowser|uc)\b/
					    );
					  }
					}], ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
					// Android 默认浏览器。该规则需要在 safari 之前。
					["android", function (ua) {
					  if (ua.indexOf("android") === -1) {
					    return;
					  }
					  return (/\bversion\/([0-9.]+(?: beta)?)/
					  );
					}], ["blackberry", function (ua) {
					  var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
					  return m ? { version: m[1] } : "blackberry";
					}], ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
					// 如果不能被识别为 Safari，则猜测是 WebView。
					["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/], ["firefox", /\bfirefox\/([0-9.ab]+)/], ["nokia", /\bnokiabrowser\/([0-9.]+)/]];
					
					
					
					var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
					
					function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
					
					var NA_VERSION = "-1";
					var NA = {
					  name: "na",
					  version: NA_VERSION
					};
					
					function typeOf(type) {
					  return function (object) {
					    return Object.prototype.toString.call(object) === "[object " + type + "]";
					  };
					}
					var isString = typeOf("String");
					var isRegExp = typeOf("RegExp");
					var isObject = typeOf("Object");
					var isFunction = typeOf("Function");
					
					function each(object, factory) {
					  for (var i = 0, l = object.length; i < l; i++) {
					    if (factory.call(object, object[i], i) === false) {
					      break;
					    }
					  }
					}
					
					// UserAgent Detector.
					// @param {String} ua, userAgent.
					// @param {Object} expression
					// @return {Object}
					//    返回 null 表示当前表达式未匹配成功。
					function detect(name, expression, ua) {
					  var expr = isFunction(expression) ? expression.call(null, ua) : expression;
					  if (!expr) {
					    return null;
					  }
					  var info = {
					    name: name,
					    version: NA_VERSION,
					    codename: ""
					  };
					  if (expr === true) {
					    return info;
					  } else if (isString(expr)) {
					    if (ua.indexOf(expr) !== -1) {
					      return info;
					    }
					  } else if (isObject(expr)) {
					    if (expr.hasOwnProperty("version")) {
					      info.version = expr.version;
					    }
					    return info;
					  } else if (isRegExp(expr)) {
					    var m = expr.exec(ua);
					    if (m) {
					      if (m.length >= 2 && m[1]) {
					        info.version = m[1].replace(/_/g, ".");
					      } else {
					        info.version = NA_VERSION;
					      }
					      return info;
					    }
					  }
					}
					
					// 初始化识别。
					function init(ua, patterns, factory, detector) {
					  var detected = NA;
					  each(patterns, function (pattern) {
					    var d = detect(pattern[0], pattern[1], ua);
					    if (d) {
					      detected = d;
					      return false;
					    }
					  });
					  factory.call(detector, detected.name, detected.version);
					}
					
					var Detector = function () {
					  function Detector(rules) {
					    _classCallCheck(this, Detector);
					
					    this._rules = rules;
					  }
					
					  // 解析 UserAgent 字符串
					  // @param {String} ua, userAgent string.
					  // @return {Object}
					
					
					  _createClass(Detector, [{
					    key: "parse",
					    value: function parse(ua) {
					      ua = (ua || "").toLowerCase();
					      var d = {};
					
					      init(ua, this._rules.device, function (name, version) {
					        var v = parseFloat(version);
					        d.device = {
					          name: name,
					          version: v,
					          fullVersion: version
					        };
					        d.device[name] = v;
					      }, d);
					
					      init(ua, this._rules.os, function (name, version) {
					        var v = parseFloat(version);
					        d.os = {
					          name: name,
					          version: v,
					          fullVersion: version
					        };
					        d.os[name] = v;
					      }, d);
					
					      var ieCore = this.IEMode(ua);
					
					      init(ua, this._rules.engine, function (name, version) {
					        var mode = version;
					        // IE 内核的浏览器，修复版本号及兼容模式。
					        if (ieCore) {
					          version = ieCore.engineVersion || ieCore.engineMode;
					          mode = ieCore.engineMode;
					        }
					        var v = parseFloat(version);
					        d.engine = {
					          name: name,
					          version: v,
					          fullVersion: version,
					          mode: parseFloat(mode),
					          fullMode: mode,
					          compatible: ieCore ? ieCore.compatible : false
					        };
					        d.engine[name] = v;
					      }, d);
					
					      init(ua, this._rules.browser, function (name, version) {
					        var mode = version;
					        // IE 内核的浏览器，修复浏览器版本及兼容模式。
					        if (ieCore) {
					          // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
					          if (name === "ie") {
					            version = ieCore.browserVersion;
					          }
					          mode = ieCore.browserMode;
					        }
					        var v = parseFloat(version);
					        d.browser = {
					          name: name,
					          version: v,
					          fullVersion: version,
					          mode: parseFloat(mode),
					          fullMode: mode,
					          compatible: ieCore ? ieCore.compatible : false
					        };
					        d.browser[name] = v;
					      }, d);
					      return d;
					    }
					
					    // 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
					    // @param {String} ua, userAgent string.
					    // @return {Object}
					
					  }, {
					    key: "IEMode",
					    value: function IEMode(ua) {
					      if (!this._rules.re_msie.test(ua)) {
					        return null;
					      }
					
					      var m = void 0;
					      var engineMode = void 0;
					      var engineVersion = void 0;
					      var browserMode = void 0;
					      var browserVersion = void 0;
					
					      // IE8 及其以上提供有 Trident 信息，
					      // 默认的兼容模式，UA 中 Trident 版本不发生变化。
					      if (ua.indexOf("trident/") !== -1) {
					        m = /\btrident\/([0-9.]+)/.exec(ua);
					        if (m && m.length >= 2) {
					          // 真实引擎版本。
					          engineVersion = m[1];
					          var v_version = m[1].split(".");
					          v_version[0] = parseInt(v_version[0], 10) + 4;
					          browserVersion = v_version.join(".");
					        }
					      }
					
					      m = this._rules.re_msie.exec(ua);
					      browserMode = m[1];
					      var v_mode = m[1].split(".");
					      if (typeof browserVersion === "undefined") {
					        browserVersion = browserMode;
					      }
					      v_mode[0] = parseInt(v_mode[0], 10) - 4;
					      engineMode = v_mode.join(".");
					      if (typeof engineVersion === "undefined") {
					        engineVersion = engineMode;
					      }
					
					      return {
					        browserVersion: browserVersion,
					        browserMode: browserMode,
					        engineVersion: engineVersion,
					        engineMode: engineMode,
					        compatible: engineVersion !== engineMode
					      };
					    }
					  }]);
					
					  return Detector;
					}();
					
					var WebRules = {
					  device: DEVICES,
					  os: OS,
					  browser: BROWSER,
					  engine: ENGINE,
					  re_msie: re_msie
					};
					
					var userAgent = navigator.userAgent || "";
					//const platform = navigator.platform || "";
					var appVersion = navigator.appVersion || "";
					var vendor = navigator.vendor || "";
					var ua = userAgent + " " + appVersion + " " + vendor;
					
					var detector = new Detector(WebRules);
					
					// 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
					// @param {String} ua, userAgent string.
					// @return {Object}
					function IEMode(ua) {
					  if (!WebRules.re_msie.test(ua)) {
					    return null;
					  }
					
					  var m = void 0;
					  var engineMode = void 0;
					  var engineVersion = void 0;
					  var browserMode = void 0;
					  var browserVersion = void 0;
					
					  // IE8 及其以上提供有 Trident 信息，
					  // 默认的兼容模式，UA 中 Trident 版本不发生变化。
					  if (ua.indexOf("trident/") !== -1) {
					    m = /\btrident\/([0-9.]+)/.exec(ua);
					    if (m && m.length >= 2) {
					      // 真实引擎版本。
					      engineVersion = m[1];
					      var v_version = m[1].split(".");
					      v_version[0] = parseInt(v_version[0], 10) + 4;
					      browserVersion = v_version.join(".");
					    }
					  }
					
					  m = WebRules.re_msie.exec(ua);
					  browserMode = m[1];
					  var v_mode = m[1].split(".");
					  if (typeof browserVersion === "undefined") {
					    browserVersion = browserMode;
					  }
					  v_mode[0] = parseInt(v_mode[0], 10) - 4;
					  engineMode = v_mode.join(".");
					  if (typeof engineVersion === "undefined") {
					    engineVersion = engineMode;
					  }
					
					  return {
					    browserVersion: browserVersion,
					    browserMode: browserMode,
					    engineVersion: engineVersion,
					    engineMode: engineMode,
					    compatible: engineVersion !== engineMode
					  };
					}
					
					function WebParse(ua) {
					  var d = detector.parse(ua);
					
					  var ieCore = IEMode(ua);
					
					  // IE 内核的浏览器，修复版本号及兼容模式。
					  if (ieCore) {
					    var engineName = d.engine.name;
					    var engineVersion = ieCore.engineVersion || ieCore.engineMode;
					    var ve = parseFloat(engineVersion);
					    var engineMode = ieCore.engineMode;
					
					    d.engine = {
					      name: engineName,
					      version: ve,
					      fullVersion: engineVersion,
					      mode: parseFloat(engineMode),
					      fullMode: engineMode,
					      compatible: ieCore ? ieCore.compatible : false
					    };
					    d.engine[d.engine.name] = ve;
					
					    var browserName = d.browser.name;
					    // IE 内核的浏览器，修复浏览器版本及兼容模式。
					    // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
					    var browserVersion = d.browser.fullVersion;
					    if (browserName === "ie") {
					      browserVersion = ieCore.browserVersion;
					    }
					    var browserMode = ieCore.browserMode;
					    var vb = parseFloat(browserVersion);
					    d.browser = {
					      name: browserName,
					      version: vb,
					      fullVersion: browserVersion,
					      mode: parseFloat(browserMode),
					      fullMode: browserMode,
					      compatible: ieCore ? ieCore.compatible : false
					    };
					    d.browser[browserName] = vb;
					  }
					  return d;
					}
					
					var Tan = WebParse(ua);
					Tan.parse = WebParse;
					
					return Tan;
				})();
			}
			return {bi:box_id,bw:detector.browser.name,hw:detector.device.name,os:detector.os.name,clodop:(window.getCLodop?1:0),ct:new Date().getTime(),lm:new Date().getTime()};
		},
	}
})(window.kaidanbao);
