module.exports = (function() {
	var self = {};
	
	require('vendor/UintArray');
	var bitcore = require('vendor/bitcore');
	var MnemonicJS = require('vendor/mnemonic');
	var account = null;
	
	self.init = function(passphrase){
		if( passphrase == null ) return null;
		
		var words = passphrase.split(' ');
		var seed = new MnemonicJS(words).toHex();
		
		var bitcore = require('vendor/bitcore');
		var master = bitcore.HDPrivateKey.fromSeed(seed);
		
		account = master.derive("m/0'/0/0");
	};
	
	self.getpassphrase = function( passphrase ){
		var words = null;
		if( passphrase != null ) words = passphrase.split(' ');
		var m;
		try{
			m = new MnemonicJS(words);
		}
		catch(e){ throw e; }
		
		return m.toWords().toString().replace(/,/gi, ' ');
	};
	
	self.getAddress = function(){
		if( account == null ) return null;
		return account.privateKey.toAddress().toString();
	};
	
	self.getPrivKey = function(){
		if( account == null ) return null;
		return account.privateKey;
	};
	
	self.sign = function( raw_tx, callback ){
		if( globals.DEMO ) callback('signed_tx');
		if( account == null ) return null;
		bitcore.signrawtransaction(raw_tx, account.privateKey, callback);
	};
	
	self.getPublicKey = function( passphrase, bool ){
		if( bool ) self.init(passphrase);
		if( account == null ) return null;
		return account.publicKey.toString();
	};
	
    return self;
}());