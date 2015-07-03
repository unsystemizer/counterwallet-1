exports.run = function( params ){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: true });
	
	var head = Alloy.CFG.web_uri;
	
	var webView, loading = null;
	if( OS_ANDROID ) loading = _requires['util'].showLoading(frame.view, { width: Ti.UI.FILL, height: Ti.UI.FILL});
	
	webView = Ti.UI.createWebView({url: head + params.path + '&language=' + L('language')});
	if( Alloy.CFG.isDevelopment && OS_ANDROID ) webView.setBasicAuthentication('xcp', 'Arsu-3690');
	
	webView.addEventListener('load', function(e) {
		if( loading != null ) loading.removeSelf();
	});
	webView.addEventListener('error', function(e) {
		if( loading != null ) loading.removeSelf();
		webView.hide();
		
		var text_notransactions = _requires['util'].makeLabel({
			text: L('text_webfailed'),
			font: { fontSize: 12 },
			color: '#2b4771'
		});
		frame.view.add(text_notransactions);
	});
	frame.view.add(webView);
	
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	
	return win.origin;
};