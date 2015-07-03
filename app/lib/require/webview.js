module.exports = (function() {
	this.create = function( params ){
		var webview = Ti.UI.createWebView({
	        width: Ti.UI.FILL,
	        height: Ti.UI.FILL,
	    });
	    
	    var xhr = Ti.Network.createHTTPClient();
        xhr.onload = function(){
        	var html = this.responseText;
            webview.html = html;
        };
        xhr.onerror = function(e){
			Ti.API.error('Error: '+e.error);
		};
        xhr.open('POST', params.url);
        xhr.send( params.post );
        
        return webview;
	};
	
	return this;
}());