exports.run = function( params ){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var main_view = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	main_view.top = 15;
	win.origin.add(main_view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 25 });
	top_bar.top = 0;
	win.origin.add(top_bar);
	
	var head = Alloy.CFG.web_uri;
	
	var webView, loading = null;
	if( OS_ANDROID ) loading = _requires['util'].showLoading(main_view, { width: Ti.UI.FILL, height: Ti.UI.FILL});
	
	webView = Ti.UI.createWebView({url: head + params.path});
	if( Alloy.CFG.isDevelopment && OS_ANDROID ) webView.setBasicAuthentication(globals.webview_id, globals.webview_pass);
	
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
		main_view.add(text_notransactions);
	});
	main_view.add(webView);
	
	var button_holders = Ti.UI.createButton({
	    backgroundColor : '#e54353',
  	 	title : L('label_close'),
    	color:'white',
    	bottom : 10,
   		width : '90%',	
    	height : 32,
    	font:{fontFamily:'Helvetica Neue', fontSize:15, fontWeight:'normal'},
   		borderRadius:5
	});
	button_holders.addEventListener('click', function() {
   		win.close();
	});
	main_view.add(button_holders);
	
	win.open();
	
	return win.origin;
};