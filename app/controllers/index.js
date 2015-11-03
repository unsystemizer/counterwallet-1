require('init');
require('icons');
var cache = globals.requires['cache'];
cache.load();

var network = globals.requires['network'];
var b = require('crypt/bcrypt');
bcrypt = new b();

globals._parseArguments();
Ti.App.addEventListener('resumed', function() {
	if( OS_IOS ) Ti.UI.iPhone.setAppBadge(0);
	if( globals.isReorg ) globals.backgroundfetch();
	globals._parseArguments();
});

globals.createTab = function(){
	
	var tabGroup = Ti.UI.createTabGroup({
		 title: null,
		 tabsBackgroundColor : '#fff',
	     activeTabIconTint: '#e54353',
	     tabsBackgroundDisabledColor: '#fff',
	     tabsBackgroundFocusedColor: '#fff', 
	     tabsBackgroundSelectedColor : '#fff',
	     tabsTintColor: 'blue',
	     tintColor:'blue',
	     navBarHidden: true
	});
	
	var home_tab = Ti.UI.createTab({
	    window: Ti.API.home_win,
	    title:L('label_tab_home'),
	    icon:'/images/icon_home.png'
	});
	
	var ss_tab = Ti.UI.createTab({
	    window:Ti.API.ss_win,
	    title:L('label_tab_ss'),
	    icon:'/images/icon_ss.png'
	});
	var exchange_tab = Ti.UI.createTab({
	    window: Ti.API.exchange_win,
	    title:L('label_tab_exchange'),
	    icon:'/images/icon_exchange.png'
	});
	 
	var history_tab = Ti.UI.createTab({
	    window: Ti.API.history_win,
	    title:L('label_tab_history'),
	    icon:'/images/icon_history.png'
	});
	
	var settings_tab = Ti.UI.createTab({
	    window: Ti.API.settings_win,
	    title:L('label_tab_settings'),
	    icon:'/images/icon_settings.png'
	});
	tabGroup.addTab(home_tab);
	tabGroup.addTab(ss_tab);
	tabGroup.addTab(exchange_tab);
	tabGroup.addTab(history_tab);
	tabGroup.addTab(settings_tab);
	
	tabGroup.closeAllTab = function(){
		tabGroup.removeTab(home_tab);
		tabGroup.removeTab(ss_tab);
		tabGroup.removeTab(exchange_tab);
		tabGroup.removeTab(history_tab);
		tabGroup.removeTab(settings_tab);
		tabGroup.close();
	};
	tabGroup.open();
	globals.tabGroup = tabGroup;
	
	Ti.API.ssLoad = 'NO';
	Ti.API.dexLoad = 'NO';
	Ti.API.historyLoad = 'NO';
	Ti.API.settingsLoad = 'NO';
	
	globals.currentTabIndex = 0;
	tabGroup.addEventListener('focus', function(e){
		globals.currentTabIndex = e.index;
		if(e.index == 1) {
	    	if(Ti.API.ssLoad == 'NO'){
	        	if( !globals.isReorg ) globals.windows['shapeshift'].run();
	    	}
	    }
	     if(e.index == 2) {
	    	if(Ti.API.dexLoad == 'NO'){
	        	if( !globals.isReorg ) globals.windows['dex'].run();
	    	}
	        if( globals.change_box2_asset_balance != null ) globals.change_box2_asset_balance();
	    }
	    if(e.index == 3) { 
	        if(Ti.API.historyLoad == 'NO'){
	        	if( !globals.isReorg ) globals.windows['history'].run();
	        }
	    }
	    if(e.index == 4) {
	    	if(Ti.API.settingsLoad == 'NO'){
	        	globals.windows['settings'].run();
	       }
	    }
	    
	});
	Ti.API.home_tab = home_tab;
	globals.open = true;
};

if( cache.data.id != null ){
	if( cache.data.id === 'TestAccountID' ) globals.DEMO = true;
	
	if( cache.data.pass_hash == null ){
		bcrypt.hashpw(cache.data.password, bcrypt.gensalt(10), function(pass_hash) {
			network.connect({
				'method': 'dbUpdate',
				'post': {
					id: cache.data.id,
					data: JSON.stringify( [
						{ column: 'code', value: pass_hash }
					])
				},
				'callback': function( result ){
					cache.data.pass_hash = pass_hash;
					cache.save();
				},
				'onError': function(error){
					alert(error);
				}
			});
		});
	}
	
	if( cache.data.passphrase == null ){
		network.connect({
			'method': 'temp/to',
			'post': {
				id: cache.data.id,
				code: hash_pass
			},
			'callback': function( result ){
				if( globals.useRSA ){
					var crypt = require('crypt/api');
					
					var rsa_info = cache.load_rsa();
					var RSAkey = (globals.Crypt_key == null)? (globals.Crypt_key = crypt.loadRSAkey(rsa_info.a)): globals.Crypt_key;
					var DecryptionResult = crypt.decrypt(result.passphrase, RSAkey);
					cache.data.passphrase = DecryptionResult.plaintext;
					cache.data.address = result.address;
					
					var pubkey = globals.requires['bitcore'].getPublicKey(cache.data.passphrase, true);
					network.connect({
						'method': 'dbUpdate',
						'post': {
							id: cache.data.id,
							data: JSON.stringify( [
								{ column: 'pubkey', value: pubkey }
							])
						},
						'callback': function( result ){
							cache.save();
							globals.windows['home'].run();
						},
						'onError': function(error){
							alert(error);
						}
					});
				}
			},
			'onError': function(error){
				alert(error);
			}
		});
	}
	else if( cache.data.pass_hash != null ){
		globals.createTab();
		globals.windows['home'].run();
	}
}
else{
	globals.windows['login'].run();
}