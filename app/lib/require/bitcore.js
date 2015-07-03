module.exports = (function() {
	require('vendor/UintArray');
	var bitcore = require('vendor/bitcore');
	var MnemonicJS = require('vendor/mnemonic');
	var account = null;
	
	this.init = function(passphrase){
		if( passphrase == null ) return null;
		
		var words = passphrase.split(' ');
		var seed = new MnemonicJS(words).toHex();
		
		var bitcore = require('vendor/bitcore');
		var master = bitcore.HDPrivateKey.fromSeed(seed);
		
		account = master.derive("m/0'/0/0");
	};
	
	this.getpassphrase = function( passphrase ){
		var words = null;
		if( passphrase != null ) words = passphrase.split(' ');
		var m;
		try{
			m = new MnemonicJS(words);
		}
		catch(e){ throw e; }
		
		return m.toWords().toString().replace(/,/gi, ' ');
	};
	
	this.getAddress = function(){
		if( account == null ) return null;
		return account.privateKey.toAddress().toString();
	};
	
	this.getPrivKey = function(){
		if( account == null ) return null;
		return account.privateKey;
	};
	
	this.sign = function( raw_tx, callback ){
		if( account == null ) return null;
		bitcore.signrawtransaction(raw_tx, account.privateKey, callback);
	};
	
	this.getPublicKey = function( passphrase, bool ){
		if( bool ) this.init(passphrase);
		if( account == null ) return null;
		return account.publicKey.toString();
	};
	
    return this;
}());