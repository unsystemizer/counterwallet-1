var theWindow =  Ti.UI.createWindow({
	title: L('label_tab_home'),
	backgroundColor:'#ececec',
	orientationModes: [Ti.UI.PORTRAIT],
	navBarHidden: true
});
if( OS_IOS ) theWindow.statusBarStyle = Ti.UI.iPhone.StatusBar.LIGHT_CONTENT;
exports.run = function(){
	var _windows = globals.windows;
    var _requires = globals.requires;
    
    var view = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	theWindow.add(view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 80 });
	top_bar.top = 0;
	theWindow.add(top_bar);
	
	var address = _requires['cache'].data.address;
	var text_title = _requires['util'].group({
		title: _requires['util'].makeLabel({
			text: L('label_bitcoinaddress'),
			top: 40,
			font:{ fontSize: 12 }
		}),
		address: _requires['util'].makeLabel({
			text: address,
			top: 60,
			font:{ fontSize: 13 }
		})
	});
	text_title.top = 20;
	
	var win = {};
	win.origin = theWindow;
	
	if( !globals.DEMO ) _requires['bitcore'].init(_requires['cache'].data.passphrase);
	
	_requires['acs'].login({
		id: _requires['cache'].data.id,
		password: _requires['cache'].data.password
	});
	
	_requires['network'].connect({
		'method': 'dbGet',
		'post': {
			id: _requires['cache'].data.id,
			type: 'user_name'
		},
		'callback': function( result ){
			globals.user_name = result.value;
		},
		'onError': function(error){
			globals.user_name = '';
		}
	});
	
	home_title_center = _requires['util'].makeLabel({
		text:L('label_tab_home'),
		color:"white",
		font:{ fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 25, center: 0
	});
	top_bar.add( home_title_center );
	
	home_title_right = _requires['util'].makeLabel({
		text:L('label_tab_receive'),
		color:"white",
		font:{ fontSize:15, fontWeight:'normal'},
		textAlign: 'right',
		top: 50, right:10
	});
	top_bar.add( home_title_right );
	
	home_title_left = _requires['util'].makeLabel({
		text:L('label_tab_home'),
		color:"white",
		font:{ fontSize:15, fontWeight:'normal'},
		textAlign: 'right',
		top: 50, left:10
	});
	top_bar.add( home_title_left );
	home_title_left.opacity = 0;
	
	home_title_left.addEventListener('touchstart', function(){
		scrollableView.scrollToView(view_scroll['balance']);
	});
	home_title_right.addEventListener('touchstart', function(){
		scrollableView.scrollToView(view_scroll['qrcode']);
	});
	
	home_scroll_indicator = _requires['util'].makeImage({
	    image: '/images/scroll_indicator_1.png',
	    height: 8,
	    top:55, center: 0
	});
			
	top_bar.add( home_scroll_indicator );
	home_scroll_indicator.opacity = 1;
	
	var view_scroll = [];
	view_scroll['balance'] = Ti.UI.createScrollView({ scrollType: 'vertical', layout: 'vertical', backgroundColor: 'transparent', showVerticalScrollIndicator: true });
	view_scroll['qrcode'] = Ti.UI.createScrollView({ scrollType: 'vertical', layout: 'vertical', backgroundColor: 'transparent', showVerticalScrollIndicator: true });
	
	var scrollableView = Ti.UI.createScrollableView({
	    views: [view_scroll['balance'], view_scroll['qrcode']],
	    maxZoomScale: 1.0,
	    top: 65
	});
	scrollableView.addEventListener('scroll', function(e){
		if( e.currentPage != null ){
			var a = Ti.UI.createAnimation();
			a.opacity = 0;
			a.duration = 400;
		    home_title_right.animate(a);
		    home_title_left.animate(a);
		}
		
	});
	scrollableView.addEventListener('scrollend', function(e){
		if( e.currentPage != null ){
		
			if( scrollableView.currentPage == 1 ){ 
				
				home_title_center.text = L('label_tab_receive');
				home_scroll_indicator.image = '/images/scroll_indicator_2.png';
				
				var a = Ti.UI.createAnimation();
				a.opacity = 1;
				a.duration = 400;
			    home_title_left.animate(a);
				
			}
			if( scrollableView.currentPage == 0 ){ 
				
				home_title_center.text =  L('label_tab_home');
			    home_scroll_indicator.image = '/images/scroll_indicator_1.png';
			    
			    var a = Ti.UI.createAnimation();
				a.opacity = 1;
				a.duration = 400;
			    home_title_right.animate(a);
			}
		}
	});
	view.add(scrollableView);
	
	function createBox( params ){
		var box = _requires['util'].group();
		box.height = params.height;
		box.width = '100%';
		box.backgroundColor = '#ffffff';
		
		return box;
	}
	
	var assets_info = [];
	
	globals.loadBalance = function(bool, l){
		var loading = l;
		if( bool ) loading = _requires['util'].showLoading(view, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('label_load_tokens')});
		_requires['network'].connect({
			'method': 'getBalances',
			'post': {
				id: _requires['cache'].data.id
			},
			'callback': function( result ){
				globals.balances = result;
				_requires['tiker'].getTiker({
					'callback': function(){
						for (var key in assets_info) {
							if (assets_info.hasOwnProperty(key)) {
								var asset_object = assets_info[key];
								if(key === 'BTC' || key === 'XCP'){
									if( key === 'XCP' && !isFinite(asset_object.balance) ) globals.reorg_occured();
									asset_object.fiat_balance.text = _requires['tiker'].to(key, asset_object.balance, _requires['cache'].data.currncy);
								}
								else{
									(function(key) {
										_requires['network'].connect({
											'method': 'getMarketPrice',
											'post': {
												token: key
											},
											'callback': function( result ){
												if( result != null ){
													var the_asset_object = assets_info[key];
													the_asset_object.fiat_balance.text = _requires['tiker'].to('XCP', result.price * the_asset_object.balance , _requires['cache'].data.currncy);
												}
											}
										});
									})(key);
								}
							}
						}
					}
				});
				home_title_center.opacity = 1;
				home_title_right.opacity = 1;
				home_scroll_indicator.opacity = 1;
				view_scroll['balance'].removeAllChildren();
				
				for( var i = 0; i < result.length; i++ ){
					var val = result[i];
					
					var box = createBox({ height: 110 });
					box.top = 10;
					if(i == 0) box.top = 20;
					
					var asset_name = _requires['util'].makeLabel({
						text: val.asset,
						textAlign: 'left',
						font:{ fontFamily: 'HelveticaNeue-Light', fontSize:20, fontWeight:'light'},
						top: 21, left: 65
					});
					box.add(asset_name);
					
					_requires['util'].putTokenIcon({
						info: val, parent: box,
						width: 48, height: 48,
						top: 12, left: 7
					});
					
					var item_name = asset_name.text;
					var balance = _requires['util'].makeLabel({
						text: val.balance + ((val.unconfirmed != 0)? '(' + val.unconfirmed + ')': ''),
						font:{ fontSize:18, fontWeight:'normal'},
						textAlign: 'right',
						top: 40, right: 10
					});
					box.add( balance );
					
					var item_balance = balance.text;
					var border = Ti.UI.createView({ 'width': '95%', height: 1, backgroundColor: '#ececec', bottom: 28, opacity: 1 });
					box.add(border);
					
					var info_button = _requires['util'].group({
						'info_icon': _requires['util'].makeImage({
							image: '/images/icon_info.png',
				    		width: 25, height: 25
						}),
						'info_label': _requires['util'].makeLabel({
							text: L('label_showinfo'),
							color:'#9b9b9b',
							font:{fontFamily:'Helvetica Neue', fontSize:12, fontWeight:'bold'},
							height: 30, left: 10
						})
					}, 'horizontal');
					info_button.left = 20;
					info_button.bottom = -1;
					
					var send_button = _requires['util'].group({
						'send_icon': _requires['util'].makeImage({
							image: '/images/icon_send.png',
				    		width: 20, height: 20
						}),
						'send_label': _requires['util'].makeLabel({
							text: L('label_send'),
							color:'#9b9b9b',
							font:{fontFamily:'Helvetica Neue', fontSize:12, fontWeight:'bold'},
							height: 30, left: 10
						})
					}, 'horizontal');
					send_button.right = 25;
					send_button.bottom = -1;
					
					var asset_array = new Array();
						asset_array.balance = val.balance;
						asset_array.fiat_balance = _requires['util'].makeLabel({
							text: '',
							font:{fontFamily:'Helvetica Neue', fontSize:12, fontWeight:'normal'},
							textAlign: 'right',
							top: 64, right: 10
						}); 
					box.add(asset_array.fiat_balance );
					assets_info[val.asset] = asset_array;
					
					info_button.is = true;
					(function(info_button) {
						info_button.addEventListener('touchstart', function(e){
							if( info_button.is ){
								info_button.is = false;
								var asset = info_button.parent.children[0].text;
								if( asset !== 'BTC' ){
									info_button.opacity = 0.1;
									info_button.animate({ opacity: 1.0, duration: 200 }, function(){
										if( !globals.is_scrolling ) _windows['assetinfo'].run({ 'asset': asset });
										info_button.is = true;
									} );
								}
							}
						});
					})(info_button);
					
					send_button.is = true;
					(function(send_button, val, fiat_balance) {
						send_button.addEventListener('touchstart', function(e){
							if( send_button.is ){
								send_button.is = false;
								var asset =  val.asset;
								var balance = val.balance;
								var fiat = fiat_balance.text;
								
								send_button.opacity = 0.1;
								send_button.animate({ opacity: 1.0, duration: 200 }, function(){
									if( !globals.is_scrolling ) _windows['send'].run({ 'asset': asset, 'balance': balance, 'fiat': fiat});
									send_button.is = true;
								} );
							}
						});
					})(send_button, val, asset_array.fiat_balance);
					
					if( val.asset !== 'BTC' ) box.add(info_button);
					box.add(send_button, val.balance);
					
					view_scroll['balance'].add(box);
				}
				var create_button = createBox({ height: 30 });
				create_button.top = 10;
				create_button.add(
					_requires['util'].makeLabel({
						text: L('label_createtoken'),
						color:'#9b9b9b',
						font:{fontFamily:'Helvetica Neue', fontSize:13, fontWeight:'bold'},
					})
				);
				create_button.addEventListener('click', function(){
					if( !globals.is_scrolling ) _windows['createtoken'].run();
				});
				
				view_scroll['balance'].add(create_button);
				
				var bottom_space = createBox({ height: 300 });
				bottom_space.backgroundColor = "transparent",
				bottom_space.top = 10;
				
				view_scroll['balance'].add(bottom_space);
				if( bool ){
					_requires['layer'].addPullEvent(view_scroll['balance'], { parent: view, scrollableView: scrollableView, margin_top: 95, callback: function(l){
						globals.loadBalance(false, l);
					}});
				}
			},
			'onError': function(error){
				alert(error);
			},
			'always': function(){
				if( loading != null ) loading.removeSelf();
			}
		});
	};
	globals.loadBalance(true);
	
	function createQRcode( qr_data ){
		var view_qr = _requires['util'].group({
			'img_qrcode': _requires['util'].makeImageButton({
			    image: qr_data,
			    width: 290, height: 290,
			    top:100, left: 0,
			    listener: function(){
					Ti.UI.Clipboard.setText( address );
					_requires['util'].createDialog({
						message:L('text_copied_message'),
						buttonNames: [L('label_close')]
					}).show();
				}
			}),
			
			title: text_title,
			
		});
		view_scroll['qrcode'].add(view_qr);
		
		var tap = _requires['util'].makeLabel({
			text:L('label_qrcopy'),
			textAlign: 'left',
			font:{fontFamily: 'HelveticaNeue-Light', fontSize:15, fontWeight:'light'},
			top: 7
		});
		view_scroll['qrcode'].add(tap);
	}
	
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'qr_address.png');
	if( !_requires['cache'].data.qrcode ){
		_requires['network'].connect({
			'method': 'getQRcode',
			'binary': true,
			'post': {
				id: _requires['cache'].data.id
			},
			'callback': function( result ){
				_requires['cache'].data.qrcode = true;
				_requires['cache'].save();
				
				f.write( result );
				createQRcode(f);
			},
			'onError': function( error ){
				alert(error);
			}
		});
	}
	else createQRcode(f);
	
	var regist = null, isResume = true;
	if( _requires['cache'].data.easypass == null && _requires['cache'].data.isTouchId == null ){
		regist = function(){
			function completed(){
				var dialog = _requires['util'].createDialog({
					title: L('label_setting_completed'),
					message: L('text_setting_completed'),
					buttonNames: [L('label_start')]
				}).show();
			}
			
			function registEasyPass(){
				var dialog = _requires['util'].createDialog({
					title: L('label_easypass'),
					message: L('text_easypass'),
					buttonNames: [L('label_ok')]
				});
				dialog.addEventListener('click', function(e){
					regist = null;
					var easyInput = _requires['util'].createEasyInput({
						type: 'reconfirm',
						callback: function( number ){
							_requires['cache'].data.easypass = number;
							_requires['cache'].save();
							completed();
						},
						cancel: function(){}
					});
					easyInput.open();
				});
				dialog.show();
			}
			
			if( OS_IOS ){
				var dialog = _requires['util'].createDialog({
					title: L('label_fingerprint'),
					message: L('text_fingerprint'),
					buttonNames: [L('label_cancel'), L('label_ok')]
				});
				dialog.addEventListener('click', function(e){
					if( e.index == 1 ){
						isResume = false;
						_requires['auth'].useTouchID({ callback: function(e){
							if( e.success ){
								_requires['cache'].data.isTouchId = true;
								_requires['cache'].save();
								regist = null;
								completed();
							}
							else{
								var dialog = _requires['util'].createDialog({
									title: L('label_adminerror'),
									message: L('text_adminerror'),
									buttonNames: [L('label_close')]
								});
								dialog.addEventListener('click', function(e){
									registEasyPass();
								});
								dialog.show();
							}
						}});
					}
					else registEasyPass();
				});
				dialog.show();
			}
			else registEasyPass();
		};
	}
	function check_passcode(){
		if( regist != null ){
			if( globals.keepRegister ){
				var timer = setInterval(function(){
					if( globals.keepRegisterStart ){
						clearInterval(timer);
						globals.keepRegisterStart = false;
						regist();
					}
				}, 500);
			}
			else regist();
		}
	}
	check_passcode();
	
	if( OS_ANDROID ){
		theWindow.addEventListener('android:back', function(){
			var activity = Ti.Android.currentActivity;
			activity.finish();
	    });
	}
	if( OS_IOS ){
		Ti.App.addEventListener('resumed', function() {
			if( isResume ){
				globals.keepRegister = false;
				check_passcode();
			}
			else isResume = true;
		});
	}
};
Ti.API.home_win = theWindow;