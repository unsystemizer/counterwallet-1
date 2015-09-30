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
	
	var tab1 = Ti.UI.createTab({
	    window: Ti.API.win1,
	    title:L('label_tab_1'),
	    icon:'/images/icon_home.png'
	});
	
	var tab2 = Ti.UI.createTab({
	    window: Ti.API.win2,
	    title:L('label_tab_2'),
	    icon:'/images/icon_exchange.png'
	});
	 
	var tab3 = Ti.UI.createTab({
	    window: Ti.API.win3,
	    title:L('label_tab_3'),
	    icon:'/images/icon_history.png'
	});
	
	var tab4 = Ti.UI.createTab({
	    window: Ti.API.win4,
	    title:L('label_tab_4'),
	    icon:'/images/icon_settings.png'
	});
	tabGroup.addTab(tab1);
	tabGroup.addTab(tab2);
	tabGroup.addTab(tab3);
	tabGroup.addTab(tab4);
	
	tabGroup.closeAllTab = function(){
		tabGroup.removeTab(tab1);
		tabGroup.removeTab(tab2);
		tabGroup.removeTab(tab3);
		tabGroup.removeTab(tab4);
		tabGroup.close();
	};
	tabGroup.open();
	globals.tabGroup = tabGroup;
	
	Ti.API.dexLoad = 'NO';
	Ti.API.historyLoad = 'NO';
	Ti.API.settingsLoad = 'NO';
	tabGroup.addEventListener('focus', function(e){
	    if(e.index == 1) {
	    	if(Ti.API.dexLoad == 'NO'){
	        	globals.windows['dex'].run();
	        }
	        if( globals.change_box2_asset_balance != null ) globals.change_box2_asset_balance();
	    }
	    if(e.index == 2) {
	        if(Ti.API.historyLoad == 'NO'){
	        	globals.windows['history'].run();
	        }
	    }
	    if(e.index == 3) {
	    	if(Ti.API.settingsLoad == 'NO'){
	        	globals.windows['settings'].run();
	       }
	    }
	    
	});
	Ti.API.tab1 = tab1;
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