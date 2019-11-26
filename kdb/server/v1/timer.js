/**
 * timer 定时任务
 */
var c;
var log = require('./log');
var cache =require('./cache');
var u = require('./utils');
var timer_count=0;//计数器，每99秒加一，隔天归零
var tap = 99000;//基础事件间隔
var date = new Date().getDate();
var tasks={};
var later = {};

//设置任务
function set_task(name,action){
	if(name){
		if(typeof action === 'function') tasks[name] = action; 
		else delete tasks[name];
	}
}
function get_count(){
	return timer_count;
}
function reset_date(){
	date = new Date().getDate();
	cache.day_cache('date-day',u.getDay());
	cache.day_cache('date-month',u.getDay().substr(0,7));
}
/**定时完成
 * after : 整数，timer_count
 */
function set_later(name,action,after){
	if(name){
		if(typeof action === 'function') later[name] = [timer_count+after,action]; 
		else delete later[name];
	}
}
function excute(){
	try {
		for(var name in tasks){
			tasks[name](timer_count);
		}
		for(var key in later){
			if(timer_count > later[key][0]){
				later[key][1](key,cache);
				delete later[key];
			}
		}
	} catch (e) {
		// TODO: handle exception : write after end
	}
	if(timer_count++ > 864 && new Date().getDate() != date) {
		reset_date();
		later={};
		timer_count = 0;
	}
}
function init(config){
	if(c) return;
	c = config;
	reset_date();
	timer_count = Math.ceil((new Date().getTime() - new Date(u.getDay().replace('-','/')).getTime())/tap);
	setInterval(excute, tap);
}
exports.init = init;
exports.set_task = set_task;
exports.get_count = get_count;
exports.set_later = set_later;
