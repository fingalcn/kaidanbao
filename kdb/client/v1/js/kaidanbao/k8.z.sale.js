/**
 * http://usejsdoc.org/
 */
(function(k){
	var u=k.utils;
	var p=k.plugin;
	p.customer={
		release:function(){ $('#layout div.customer table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.customer button.s-btn').click(); },
		init:function(){
			if(k.aspect.role_check('find-customer')){
				k.aspect.manage.init({notice:function(){
					$('#layout div.customer input').attr('placeholder','搜索 '+k.cache.fixed_page.customer_len+' 位客户');
				}});
			}else{
				$('#layout div.lay-main').append('<div hidden class="customer"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		},
	}
	p.supplier={
		release:function(){ $('#layout div.supplier table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.supplier button.s-btn').click(); },
		init:function(){
			if(k.aspect.role_check('find-supplier')){
				k.aspect.manage.init({notice:function(){
					$('#layout div.supplier input').attr('placeholder','搜索 '+k.cache.fixed_page.supplier_len+' 位供应商');
				}});
			}else{
				$('#layout div.lay-main').append('<div hidden class="supplier"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		},
	}
	p.clerk={
		release:function(){ $('#layout div.clerk table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.clerk button.s-btn').click(); },
		init:function(){
			if(k.aspect.role_check('find-clerk')){
				k.aspect.manage.init({notice:function(){
					$('#layout div.clerk input').attr('placeholder','搜索 '+k.cache.fixed_page.clerk_len+' 位员工');
				}});
			}else{
				$('#layout div.lay-main').append('<div hidden class="clerk"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		},
	}
	p.product={
			release:function(){ $('#layout div.product table.kc-manage-list tr.list').remove(); },
			reload:function(){ $('#layout div.product button.s-btn').click(); },
			init:function(){
				if(k.aspect.role_check('find-product')){
					k.aspect.manage.init({notice:function(){
						$('#layout div.product input').attr('placeholder','搜索 '+k.cache.fixed_page.product_len+' 个商品');
					}});
				}else{
					$('#layout div.lay-main').append('<div hidden class="product"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
				}
			},
	}
	p.account={
		release:function(){ $('#layout div.account table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.account button.s-btn').click(); },
		init:function(){
			if(k.aspect.role_check('find-account')){
				k.aspect.manage.init({notice:function(){
					$('#layout div.account input').attr('placeholder','搜索 '+k.cache.fixed_page.account_len+' 个账户');
				}});
			}else{
				$('#layout div.lay-main').append('<div hidden class="account"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		},
	}
	p.repository={
		release:function(){ $('#layout div.repository table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.repository button.s-btn').click(); },
		init:function(){
			if(k.aspect.role_check('find-repository')){
				k.aspect.manage.init({notice:function(){
					$('#layout div.repository input').attr('placeholder','搜索 '+k.cache.fixed_page.repository_len+' 个仓库');
				}});
			}else{
				$('#layout div.lay-main').append('<div hidden class="repository"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		},
	}
	p.salebilling={
		reload:function(){k.aspect.atcp.set_repository(k.cache.get(parseInt($('#layout div.salebilling select.repository').val()))['t'+k.cache.dates.mt[0]]);},
		init:function(){
			if(k.aspect.role_check('add-salebill')){
				k.aspect.billing.init();
			}else{
				$('#layout div.lay-main').append('<div hidden class="salebilling"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		}
	}
	p.salebill={
		release:function(){ $('#layout div.salebill table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.salebill button.s-btn').click(); },
		init:function(){
			if(k.aspect.role_check('find-salebill')){
				k.aspect.bill.init();
			}else{
				$('#layout div.lay-main').append('<div hidden class="salebill"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		}
	}
	p.bringbilling={
		reload:function(){k.aspect.atcp.set_repository(k.cache.get(parseInt($('#layout div.bringbilling select.repository').val()))['t'+k.cache.dates.mt[0]]);},
		init:function(){
			if(k.aspect.role_check('add-bringbill')){
				k.aspect.billing.init();
			}else{
				$('#layout div.lay-main').append('<div hidden class="bringbilling"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		}
	}
	p.bringbill={
		release:function(){ $('#layout div.bringbill table.kc-manage-list tr.list').remove(); },
		reload:function(){ $('#layout div.bringbill button.s-btn').click(); },
		init:function(){
			if(k.aspect.role_check('find-bringbill')){
				k.aspect.bill.init();
			}else{
				$('#layout div.lay-main').append('<div hidden class="bringbill"><h1>'+k.conf.kdb.role_err_msg+'</h1></div>');
			}
		}
	}
})(window.kaidanbao);
