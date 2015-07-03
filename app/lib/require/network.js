module.exports = (function() {
	
	function onerror(params, e){
		Ti.API.error('Error: '+e.error);
		if( params.onError ) params.onError('Error: '+e.error);
	};
	
	function onworm(params, json){
		Ti.API.warn( json.errorMessage );
		if( params.onError ) params.onError( json.errorMessage );
	};
	
	this.connect = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		if( OS_ANDROID ){
			xhr.validatesSecureCertificate = false;
			xhr.tlsVersion = Ti.Network.TLS_VERSION_1_2;
		}
		xhr.open('POST', Alloy.CFG.api_uri + 'counterparty/' + globals.api_ver + '/' + params.method + '.php');
		xhr.onload = function(){
			if( params.binary ) params.callback( this.responseData );
			else{
				var json = JSON.parse( this.responseText );
				if( json.status ) params.callback( json.result );
				else onworm(params, json);
				
				if( params.always != null ) params.always();
			}
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send( params.post );
	};
	
	this.getjson = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		if( OS_ANDROID ){
			xhr.validatesSecureCertificate = false;
			xhr.tlsVersion = Ti.Network.TLS_VERSION_1_2;
		}
		xhr.open('GET', params.uri);
		xhr.onload = function(){
			params.callback( JSON.parse( this.responseText ) );
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	
	return this;
}());