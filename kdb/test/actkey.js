/**
 * 线下本地分批生成，使用DMS通过命令行输入 每批1400个（A92-700，D366-700）
 * 第一位：（三个月试用产品开头为S，正式产品为一年开头K） 
 * 第二三位：代理商标识（总部通用V[A-Z]，一般为代理人名字简拼首字母）
 * 第四位：批次A,B,C... 
 * 生成算法： double()
 * 完整序列号示例：KVXA-YUJH-LKJM
 * 先生产纯文本，再导入mongodb;
 * 
 */
var fs = require("fs");
var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ';
var agent, batch, total;



function head(type) {
	return type + agent + batch;
}
function double() {
	var num = new Date().getTime() * (Math.random() * 1000 + 1000) + '0', str = '';
	for (var i = 3; i < 11; i++) {
		if ((i - 3) % 4 === 0) str += '-';
		str += abc[parseInt(num.substr(i, 2))];
	}
	return str;
}
function create(type, comp) {
	var k3, i, map = {}, val = '';
	for (i = 0; i < total; i++) {
		k3 = head(type) + double();
		if (!map[k3]) {
			map[k3] = 1;
			val += (i + ',' + k3 + '\r\n');
		}
	}
	console.log(val);
	fs.writeFile(__dirname + '/../../key/' + head(type) + '.txt', val, { encoding : 'utf-8'
	}, function(err, r) {
		if (err) {
		} else {
			comp(type);
		}
	});
}
function getday(time) {// YYYY-MM-DD
	var dt = time ? new Date(time) : new Date();
	var YYYY = dt.getFullYear(), MM = dt.getMonth() + 1, DD = dt.getDate(), hh = dt
			.getHours(), mm = dt.getMinutes(), ss = dt.getSeconds();
	MM = (MM > 9 ? MM : ('0' + MM));
	DD = (DD > 9 ? DD : ('0' + DD));
	return YYYY%100+'' + MM + '' + DD;
}
function parse(type) {
	// {_id,ct,due}
	var ct = getday(new Date().getTime());
	var due = getday(366 * 24 * 3600 * 1000 + new Date().getTime());
	var id = abc.indexOf(batch[0]) * 1000 + 10000;
	fs.readFile(__dirname + '/../../key/' + head(type) + '.txt', 'utf8',
		function(err, data) {
			if (data) {
				var ks = data.split('\r\n');
				var val = '[';
				for ( var i in ks) {
					if (ks[i].split(',')[1]) {
						if (i == 0) val += ('{"_id":' + id++);
						else val += (',{"_id":' + id++);
						val += (',"b":"' + batch);
						val += ('","k":"' + ks[i].split(',')[1] + '"}');
					}
				}
				console.log(val.length);
				fs.writeFile(__dirname + '/../../key/' + head(type)
						+ '.json', val + ']', {
					encoding : 'utf-8'
				}, function(err, r) {
					if (err) {
					} else {
					}
				});
			}
		});
}
function batch_create() {
	// 设置参数，批量生产
//	agent = 'VX';// 代理商简称
//	batch = 'C';// 批次号A-Z
//	total = 900;// 每类生产数量
//	parse('K');
//	create('S', parse);// 创建试用序列号
//	create('K', parse);// 创建正式序列号
//	create('H', parse);// 创建半价促销序列号
	var a = {};
	a[1] = 1;
	var s = '2017-12';
//	console.dir(a.slice(2,4));
	console.log(a[1]);
	
}
batch_create();
