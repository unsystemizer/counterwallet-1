require('init');

var cache = globals.requires['cache'];
//cache.init();
cache.load();

var network = globals.requires['network'];
var b = require('crypt/bcrypt');
bcrypt = new b();

var _resume = function() {
	if( OS_IOS ) Ti.UI.iPhone.setAppBadge(0);
};

_resume();
Ti.App.addEventListener('resumed', function() {
    _resume();
});

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
							globals.windows['top'].run();
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
	else if( cache.data.pass_hash != null ) globals.windows['top'].run();
}
else{
	globals.windows['login'].run();
}