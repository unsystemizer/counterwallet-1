require('init');

var cache = globals.requires['cache'];
cache.load();

if( cache.data.id != null ){
	if( cache.data.passphrase == null ){
		var md5 = require('crypt/md5');
		var network = globals.requires['network'];
		network.connect({
			'method': 'temp/to',
			'post': {
				id: cache.data.id,
				code: md5.MD5_hexhash(cache.data.password)
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
							type: 'pubkey',
							value: pubkey
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
	else globals.windows['top'].run();
}
else{
	globals.windows['login'].run();
}