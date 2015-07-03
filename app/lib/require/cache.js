module.exports = (function() {
	var crypt = require('crypt/api');
	
	function getPath(){
		if( OS_ANDROID ){
			var newDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'save');
			if( !newDir.exists() ) newDir.createDirectory();
			
			var file = Ti.Filesystem.getFile(newDir.nativePath, 'save_file.json');
			if( !file.exists() ) file.write('');
			
			return file.nativePath;
		}
		else return globals.SAVE_FILE_PATH;
	}
	
	function getRSAPath(){
		if( OS_ANDROID ){
			var newDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'jithd');
			if( !newDir.exists() ) newDir.createDirectory();
			
			var file = Ti.Filesystem.getFile(newDir.nativePath, 'jithd.json');
			if( !file.exists() ) file.write('');
			
			return file.nativePath;
		}
		else return globals.CRYPT_FILE_PATH;
	}
	
	function getData(){
		var f = Ti.Filesystem.getFile( getPath() );
		var data = f.read();
		
		if ( !data || data.length <= 0 ) data = '{}';
		else{
			if( globals.useRSA ){
				var rsa_info = this.load_rsa();
				var RSAkey = (globals.Crypt_key == null)? (globals.Crypt_key = crypt.loadRSAkey(rsa_info.a)): globals.Crypt_key;
				var DecryptionResult = crypt.decrypt(data.toString(), RSAkey);
				data = DecryptionResult.plaintext;
			}
		}
		return JSON.parse(data);
	}
	
	this.data = null;
	
	this.init = function(){
		var f = Ti.Filesystem.getFile( getPath() );
	    f.write('');
	    
	    var f2 = Ti.Filesystem.getFile( getRSAPath() );
	    f2.write('');
	};
	
	this.load_rsa = function(){
		var f  = Ti.Filesystem.getFile( getRSAPath() );
			
		var json = f.read();
		if ( !json || json.length <= 0 ) json = '{}';
		
		return JSON.parse(json);
	};
	
	this.save_rsa = function( data ){
		var f  = Ti.Filesystem.getFile( getRSAPath() );
	    f.write(JSON.stringify( data ));
	};
	
	this.load = function(){
		globals.datas = getData();
		this.data = globals.datas;
	};
	
	this.save = function(){
		var f = Ti.Filesystem.getFile( getPath() );
	    
	    var str_data = JSON.stringify(this.data);
	    if( globals.useRSA ){
		    var rsa_info = this.load_rsa();
		    
		    var RSAkey = (globals.Crypt_key == null)? (globals.Crypt_key = crypt.loadRSAkey(rsa_info.a)): globals.Crypt_key;
		    var PubKey = crypt.publicKeyString(RSAkey);
		    
		    var EncryptionResult = crypt.encrypt(str_data, PubKey);
		    str_data = EncryptionResult.cipher;
	    }
	    f.write(str_data);
	};
	
	return this;
}());