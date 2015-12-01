module.exports = (function() {
	var self = {};
	
	function onerror(params, e){
		Ti.API.error('Error: '+e.error+':'+e.code);
		if( params.onError ) params.onError('Error: '+e.error);
	};
	
	function onworm(params, json){
		Ti.API.warn( json.errorMessage );
		if( params.onError ) params.onError( json.errorMessage );
	};
	
	function reorg(params){
		Ti.API.warn('Reorg occured...');
		if( params.onReorg ) params.onReorg();
	};
	
	self.connect = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		Ti.API.info('invoke: '+Alloy.CFG.api_uri + 'wallet/v1/' + params.method);
		Ti.API.info('post  : '+JSON.stringify(params.post));
		xhr.open('POST', Alloy.CFG.api_uri + 'wallet/v1/' + params.method);
		xhr.onload = function(){
			if( params.binary ) params.callback( this.responseData );
			else{
				Ti.API.info('result:' + params.method + '='+this.responseText);
				var json = JSON.parse( this.responseText );
				if( json.status ) params.callback( json.result );
				else{
					if( json.errorMessage === 'reorg' ){
						globals.reorg_occured();
						reorg( params );
					}
					else onworm(params, json);
				}
				if( params.always != null ) params.always();
			}
		},
		xhr.onerror = function(e){
			Ti.API.info(params.method + '=error');
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send( params.post );
	};
	
	self.getjson = function( params ){
		var xhr = Ti.Network.createHTTPClient();
		
		if( !params.uri.match(/^https?:\/\//) ) params.uri = 'http://' + params.uri;
		
		xhr.open('GET', params.uri);
		xhr.onload = function(){
			var json_data = '';
			try{
				json_data = JSON.parse( this.responseText );
			}
			catch(e){}
			params.callback( json_data );
		},
		xhr.onerror = function(e){
			onerror(params, e);
			if( params.always != null ) params.always();
		};
		xhr.send();
	};
	
	return self;
}());