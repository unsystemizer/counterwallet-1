// Initiallize
globals = Alloy.Globals;
globals.windows = new Array();
globals.requires = new Array();

/*
On iOS, all relative paths are currently interpreted as relative to the Resources directory,
not to the current context. This is a known issue that will be addressed in a future release.
http://docs.appcelerator.com/titanium/3.0/#!/api/Ti.Filesystem
*/
/*
var w = Ti.Filesystem.getFile('window').getDirectoryListing();
for( var i = 0; i < w.length; i++ ){
	var file = w[i].substr(0, w[i].indexOf('.'));
	globals.windows[file] = require('window/' + file);
}

var r = Ti.Filesystem.getFile('require').getDirectoryListing();
for( var i = 0; i < r.length; i++ ){
	var file = r[i].substr(0, r[i].indexOf('.'));
	globals.requires[file] = require('require/' + file);
}
*/

Ti.API.fin = "no";
var w = new Array(
	'assetholders.js',
	'assetinfo.js',
	'createtoken.js',
	'history.js',
	'login.js',
	'newwallet.js',
	'dex.js',
	'home.js',
	'settings.js',
	'send.js',
	'webview.js'
);

for( var i = 0; i < w.length; i++ ){
	var file = w[i].substr(0, w[i].indexOf('.'));
	globals.windows[file] = require('window/' + file);
}
var r = new Array(
	'acs.js',
	'auth.js',
	'bitcore.js',
	'cache.js',
	'inputverify.js',
	'layer.js',
	'network.js',
	'tiker.js',
	'util.js',
	'webview.js'
);
for( var i = 0; i < r.length; i++ ){
	var file = r[i].substr(0, r[i].indexOf('.'));
	globals.requires[file] = require('require/' + file);
}

var_dump = function(_var, _level) {
	var dumped_text = "";
	if(!_level) _level = 0;
	var level_padding = "";
	for(var j=0; j<_level+1; j++) level_padding += "    ";
	if(typeof(_var) == 'object'){
	    for(var item in _var){
			var value = _var[item];
			if(typeof(value) == 'object') {
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += var_dump(value, _level+1);
			} else {
				dumped_text += level_padding +"'"+ item +"' => \""+ value +"\"\n";
			}
		}
  	}
  	else dumped_text = "===>"+ _var +"<===("+ typeof(_var) +")";
	return dumped_text;
};

String.prototype.format = function(arg){
    var rep_fn = null;
    if( typeof arg == 'object' ) rep_fn = function(m, k) { return arg[k]; }; else { var args = arguments; rep_fn = function(m, k) { return args[ parseInt(k) ]; }; }
    return this.replace( /\{(\w+)\}/g, rep_fn );
};

Number.prototype.toFixed2 = function(digit){
	if( digit == null ) digit = 8;
	return this.toFixed(digit).replace(/0+$/, '').replace(/\.$/, '');
};

var image_url =  'https://counterpartychain.io/content/images/icons/-.png';
var default_image = Ti.UI.createImageView({image: image_url});
globals.coindaddy_default = Ti.Utils.base64encode(default_image.toBlob()).toString();

Math._getDecimalLength = function(value) {
    var list = (value.toString()).split('.'), result = 0;
    if (list[1] !== undefined && list[1].length > 0) result = list[1].length;
    return result;
};

Math.multiply = function(value1, value2) {
    var intValue1 = parseInt( (value1.toString()).replace('.', ''), 10);
    var intValue2 = parseInt( (value2.toString()).replace('.', ''), 10);
    var decimalLength = Math._getDecimalLength(value1) + Math._getDecimalLength(value2); 
    return (intValue1 * intValue2) / Math.pow(10, decimalLength);
};

Math.divide = function(value1, value2) {
    var intValue1 = parseInt( (value1.toString()).replace('.', ''), 10);
    var intValue2 = parseInt( (value2.toString()).replace('.', ''), 10);
    var len1 = Math._getDecimalLength(value1);
    var len2 = Math._getDecimalLength(value2); 
    
    if( len1 > len2 ) intValue2 *= Math.pow(10, len1 - len2);
	else if( len1 < len2 ) intValue1 *= Math.pow(10, len2 - len1);
    
    if( len1 > 0 && len2 > 0 ) decimalLength = 0;
    else decimalLength = len1 + len2;
    if( len1 == 0 || len2 == 0 ) decimalLength = 0;
    
    return (intValue1 / intValue2) * Math.pow(10, decimalLength);
};

Math.subtract = function(value1, value2) {
    var max = Math.max(Math._getDecimalLength(value1), Math._getDecimalLength(value2)),
        k = Math.pow(10, max);
    return (Math.multiply(value1, k) - Math.multiply(value2, k)) / k;
};

var lastUrl = null;
globals._parseArguments = function( str, is_fromQR ) {
	var url = str;
	if( url == null ){
		if( OS_IOS ) url = Ti.App.getArguments()['url'];
		else{
			var launchIntent = Ti.App.Android.launchIntent;
		    if( launchIntent.hasExtra('source') ) url = 'indiewallet://' + launchIntent.getStringExtra('source');
		}
	}
	if (url && lastUrl !== url) {
		lastUrl = url;
		if( url.match(/^indiewallet:\/\//) ){
	    	var scheme = url.replace(/^indiewallet:\/\//, '').split('?');
	    	
	    	var func = scheme[0];
	    	var params = JSON.parse(decodeURIComponent(scheme[1].split('=')[1]));
	    	
	    	Ti.include('require/pubnub.js');
			var pubnub = PUBNUB({
			    publish_key       : Alloy.CFG.pubnub_pub,
			    subscribe_key     : Alloy.CFG.pubnub_sub,
			    ssl               : true,
			    native_tcp_socket : true,
			    origin            : 'pubsub.pubnub.com'
			});
	    	function authorization(){
		    	globals.requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
					if( e.success ){
						function publish( data ){
							if( data != null ){
								pubnub.publish({
								    channel : params.channel,
								    message : JSON.stringify(data),
									callback: function(m){}
								});
							}
							if( !is_fromQR && params.scheme != null ){
								if( params.scheme === 'http' ){
									if( OS_ANDROID ){
										var activity = Ti.Android.currentActivity;
										activity.finish();
									}
								}
								else Ti.Platform.openURL(params.scheme+'://');
							}
						}
						if( func === 'signin' ){
							var data = {
								'id': globals.requires['cache'].data.id,
								'cs': params.cs
							};
							publish( data );
						}
						else if( func === 'sign' ){
							pubnub.subscribe({
							    channel  : params.channel + 'receive',
							    callback : function(message) {
							    	globals.requires['bitcore'].sign(message,
										function(signed_tx){
											var data = {
												'signed_tx': signed_tx
											};
											publish( data );
										},
										function(){
											globals.requires['util'].createDialog({
												message: L('text_signerror'),
												buttonNames: [L('label_close')]
											}).show();
										}
									);
							    }
							});
							pubnub.publish({
							    channel : params.channel,
							    message : JSON.stringify({
							    	'connect': true
							    }),
								callback: function(m){}
							});
						}
					}
				}});
			}
			var s = setInterval(function(){
				if( globals.open ){
		            clearInterval(s);
		            authorization();
		        }
			}, 100);
		}
    }
};