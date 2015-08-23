exports.run = function(){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { NoScroll: true });
	
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
			var view_personal = _requires['util'].group({
				icon_personal: _requires['util'].makeImage({
				    image: '/images/icon_noimage.png',
				    height: 40,
				    left: 6
				}),
				text_account: _requires['util'].makeLabel({
					text: globals.user_name,
					font: { fontSize: 18 },
					color: '#2b4771',
					left: 45
				}),
				icon_qrcode: _requires['util'].makeImageButton({
				    image: '/images/icon_qrcode.png',
				    height: 40,
				    right: 10,
				    listener: function(){
				    	_windows['receive'].run();
				    }
				}),
			});
			globals.user_name_top = view_personal.text_account;
			view_personal.top = 0;
			view_personal.width = '100%';
			view_personal.height = 60;
			frame.view.add(view_personal);
		},
		'onError': function(error){
			globals.user_name = '';
		}
	});
	
	var view = [];
	view['balance'] = Ti.UI.createScrollView({ scrollType: 'vertical', layout: 'vertical', backgroundColor: '#ffe0c1', showVerticalScrollIndicator: true });
	view['issued'] = Ti.UI.createScrollView({ scrollType: 'vertical', layout: 'vertical', backgroundColor: '#ffe0c1', showVerticalScrollIndicator: true });
	
	var scrollableView = Ti.UI.createScrollableView({
	    views: [view['balance'], view['issued']],
	    maxZoomScale: 1.0,
	    top: 120
	});
	scrollableView.addEventListener('scrollend', function(e){
		if( e.currentPage != null ){
			if( view['balance'].message ) view['balance'].message.opacity = 0;
			if( view['issued'].message ) view['issued'].message.opacity = 0;
			cover.animate({ left: (e.currentPage * 50) + '%', duration: 100 });
		}
	});
	frame.view.add(scrollableView);
	
	var category = Ti.UI.createView({ width: '100%', height: 30, top: 90 });
	var cover = Ti.UI.createView({ width: '50%', height: 30, left: 0, backgroundColor: '#ffe0c1' });
	category.add(cover);
	var cover_button = _requires['util'].group({
		'balance': _requires['util'].makeLabel({
			text: L('label_holdAssets'),
			font:{ fontSize: 12 },
			width: '50%'
		}),
		'issues': _requires['util'].makeLabel({
			text: L('label_ownAssets'),
			font:{ fontSize: 12 },
			width: '50%'
		})
	}, 'horizontal');
	cover_button.balance.addEventListener('click', function(){
		scrollableView.scrollToView(view['balance']);
	});
	cover_button.issues.addEventListener('click', function(){
		scrollableView.scrollToView(view['issued']);
	});
	category.add(cover_button);
	frame.view.add(category);
	
	function createBox( params ){
		var box = _requires['util'].group();
		box.height = params.height;
		box.width = '95%';
		box.borderColor = '#deb887';
		box.borderRadius = 3;
		box.backgroundColor = '#ffffff';
		
		return box;
	}
	
	var btc_balance = new Array();
	globals.loadBalance = function(bool, l){
		var loading = l;
		if( bool ) loading = _requires['util'].showLoading(view['balance'], { width: Ti.UI.FILL, height: Ti.UI.FILL});
		_requires['network'].connect({
			'method': 'getBalances',
			'post': {
				id: _requires['cache'].data.id
			},
			'callback': function( result ){
				globals.balances = result;
				view['balance'].removeAllChildren();
				
				for( var i = 0; i < result.length; i++ ){
					var val = result[i];
					
					var box = createBox({ height: 100 });
					box.top = 10;
					var asset_name = _requires['util'].makeLabel({
						text: val.asset,
						font:{ fontSize: 16 },
						top: 10, left: 10
					});
					box.add(asset_name);
					
					if( /^(https?:\/\/).*\.json/.test(val.description) ){
						asset_name.left = 70;
						_requires['network'].getjson({
							uri: val.description,
							callback: (function(box) {
								return function(json){
									var asset_image = Ti.UI.createImageView({
										image: json.image,
										width: 50, height: 50,
										top: 10, left: 10
									});
									box.add( asset_image );
								};
							})(box)
						});
					}
					
					var balance = _requires['util'].makeLabel({
						text: val.balance + ((val.unconfirmed != 0)? '(' + val.unconfirmed + ')': ''),
						font:{ fontSize: 15 },
						textAlign: 'right',
						top: 45, right: 10
					});
					box.add( balance );
					
					var border = Ti.UI.createView({ 'width': '95%', height: 1, backgroundColor: '#deb887', bottom: 30, opacity: 0.5 });
					box.add(border);
					
					var menu = _requires['util'].group({
						'info': _requires['util'].makeLabel({
							text: L('label_showinfo'),
							font:{ fontSize: 12 },
							width: '33%', height: 30
						}),
						'send': _requires['util'].makeLabel({
							text: L('label_send'),
							font:{ fontSize: 12 },
							width: '33%', height: 30
						}),
						'order': _requires['util'].makeLabel({
							text: L('label_exchange'),
							font:{ fontSize: 12 },
							width: '33%', height: 30
						})
					}, 'horizontal');
					menu.bottom = 0;
					
					if( val.asset === 'BTC' ){
						menu.info.opacity = 0.0;
						balance.top = 30;
						btc_balance.balance = val.balance;
						btc_balance.fiat_balance = _requires['util'].makeLabel({
							text: '',
							font:{ fontSize: 12 },
							textAlign: 'right',
							top: 45, right: 10
						});
						box.add( btc_balance.fiat_balance );
						_requires['tiker'].getTiker({
							'callback': function(){
								btc_balance.fiat_balance.text = _requires['tiker'].to('BTC', btc_balance.balance, _requires['cache'].data.currncy);
							}
						});
						
						asset_name.left = 70;
						box.add( Ti.UI.createImageView({
							image: '/images/asset_bitcoin.png',
							width: 50, height: 50,
							top: 10, left: 10
						}) );
					}
					if( val.asset === 'XCP' ){
						asset_name.left = 70;
						box.add( Ti.UI.createImageView({
							image: '/images/asset_xcp.png',
							width: 50, height: 50,
							top: 10, left: 10
						}) );
						
						if( val.balance === '???' ){
							var dialog = _requires['util'].createDialog({
								title: L('label_reorganisation'),
								message: L('text_reorganisation'),
								buttonNames: [L('label_close')]
							}).show();
						}
					}
					
					menu.info.addEventListener('click', function(e){
						var asset = e.source.parent.parent.children[0].text;
						if( asset !== 'BTC' ){
							e.source.opacity = 0.1;
							e.source.animate({ opacity: 1.0, duration: 200 }, function(){
								_windows['assetinfo'].run({ 'asset': asset });
							} );
						}
					});
					menu.send.addEventListener('click', function(e){
						var asset = e.source.parent.parent.children[0].text;
						var balance = e.source.parent.parent.children[1].text;
						e.source.opacity = 0.1;
						e.source.animate({ opacity: 1.0, duration: 200 }, function(){
							_windows['send'].run({ 'asset': asset, 'balance': balance });
						} );
					});
					menu.order.addEventListener('click', function(e){
						var asset = e.source.parent.parent.children[0].text;
						e.source.opacity = 0.1;
						e.source.animate({ opacity: 1.0, duration: 200 }, function(){
							_windows['order'].run({ 'main_asset': asset, 'price_asset': 'XCP' });
						} );
					});
					box.add(menu);
					
					view['balance'].add(box);
				}
				if( bool ){
					_requires['layer'].addPullEvent(view['balance'], { parent: frame.view, scrollableView: scrollableView, callback: function(l){
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
	
	function loadIssues(bool, l){
		var loading2 = l;
		if( bool ) loading2 = _requires['util'].showLoading(view['issued'], { width: Ti.UI.FILL, height: Ti.UI.FILL});
		_requires['network'].connect({
			'method': 'getIssues',
			'post': {
				id: _requires['cache'].data.id
			},
			'callback': function( result ){
				globals.issues = new Array();
				view['issued'].removeAllChildren();
				
				var create_button = createBox({ height: 30 });
				create_button.top = 10;
				create_button.add(
					_requires['util'].makeLabel({
						text: L('label_createtoken'),
						font:{ fontSize: 13 }
					})
				);
				create_button.addEventListener('click', function(){
					_windows['createtoken'].run();
				});
				view['issued'].add(create_button);
				
				for( var i = 0; i < result.length; i++ ){
					var val = result[i];
					globals.issues[val.asset] = true;
					
					var name_left = 10;
					if( /^(https?:\/\/).*\.json/.test(val.description) ) name_left = 70;
					
					var box = createBox({ height: 100 });
					box.top = 10;
					box.add(
						_requires['util'].makeLabel({
							text: val.asset,
							font:{ fontSize: 16 },
							top: 10, left: name_left
						})
					);
					
					if( name_left == 70 ){
						_requires['network'].getjson({
							uri: val.description,
							callback: (function(box) {
								return function(json){
									var asset_image = Ti.UI.createImageView({
										image: json.image,
										width: 50, height: 50,
										top: 10, left: 10
									});
									box.add( asset_image );
								};
							})(box)
						});
					}
					
					box.add(
						_requires['util'].makeLabel({
							text: L('label_issue_supply').format({supply: val.supply}),
							font:{ fontSize: 12 },
							top: 45, right: 10
						})
					);
					
					var border = Ti.UI.createView({ 'width': '95%', height: 1, backgroundColor: '#deb887', bottom: 30, opacity: 0.5 });
					box.add(border);
					
					var menu = _requires['util'].group({
						'info': _requires['util'].makeLabel({
							text: L('label_showinfo'),
							font:{ fontSize: 12 },
							width: '50%', height: 30
						}),
						'holders': _requires['util'].makeLabel({
							text: L('label_holders'),
							font:{ fontSize: 12 },
							width: '50%', height: 30
						})
					}, 'horizontal');
					menu.bottom = 0;
					
					menu.info.addEventListener('click', function(e){
						var asset = e.source.parent.parent.children[0].text;
						e.source.opacity = 0.1;
						e.source.animate({ opacity: 1.0, duration: 200 }, function(){
							_windows['assetinfo'].run({ 'asset': asset });
						} );
					});
					menu.holders.addEventListener('click', function(e){
						var asset = e.source.parent.parent.children[0].text;
						e.source.opacity = 0.1;
						e.source.animate({ opacity: 1.0, duration: 200 }, function(){
							_windows['assetholders'].run( { 'asset': asset } );
						} );
					});
					box.add(menu);
					view['issued'].add(box);
				}
				if( bool ){
					_requires['layer'].addPullEvent(view['issued'], { parent: frame.view, scrollableView: scrollableView, callback: function(l){
						loadIssues(false, l);
					}});
				}
			},
			'onError': function(error){
				alert(error);
			},
			'always': function(){
				if( loading2 != null ) loading2.removeSelf();
			}
		});
	}
	loadIssues(true);
	
	var menus = new Array(
		{ icon: 'icon_review.png', title: L('label_qrcode') },
		{ icon: 'icon_review.png', title: L('label_createtoken') },
		{ icon: 'icon_history.png', title: L('label_histories') },
		{ icon: 'icon_history.png', title: L('label_about') },
		{ icon: 'icon_history.png', title: L('label_signout') }
	);
	var menu_height = menus.length * 50;
	var menuScreen = _requires['util'].createUpScreen({
		'win': win,
		'width': 240, 'height': 60 + menu_height,
		'left': 5,
		'backgroundColor': '#ffc07f',
		'open': function( view ){
			var view_personal = _requires['util'].group({
				icon_personal: _requires['util'].makeImage({
				    image: '/images/icon_noimage.png',
				    height: 40,
				    left: 6
				}),
				text_account: _requires['util'].makeLabel({
					text: globals.user_name,
					font: { fontSize: 18 },
					color: '#2b4771',
					left: 45
				}),
				icon_edit: _requires['util'].makeImageButton({
					    image: '/images/icon_appliedit.png',
					    height: 40,
					    right: 10,
					    listener: function(e){
							menuScreen.close();
							_windows['settings'].run();
						}
					}
				)
			});
			view_personal.top = 0;
			view_personal.width = '100%';
			view_personal.height = 60;
			view.add(view_personal);
			
			var menuTable = _requires['util'].createTableList({
				width: 240, height: menu_height,
				backgroundColor: '#ffffff',
				top: 60,
				rowHeight: 50
			});
			menuTable.setRowDesign(menus, function(row, val){
				row.add(_requires['util'].makeLabel({
					text: val.title,
					font: { fontSize: 15 },
					color: '#2b4771',
					left: 15
				}));
				
				return row;
			});
			menuTable.addEventListener('click', function(e){
				menuScreen.close();
				if( e.row.children[0].text === menus[0].title ){
					_windows['receive'].run();
				}
				else if( e.row.children[0].text === menus[1].title ){
					_windows['createtoken'].run();
				}
				else if( e.row.children[0].text === menus[2].title ){
					_windows['history'].run();
				}
				else if( e.row.children[0].text === menus[3].title ){
					var dialog = _requires['util'].createDialog({
						title: L('appname'),
						message: 'ver' + Ti.App.version + '\n\n' + globals.copyright,
						buttonNames: [L('label_close')]
					}).show();
				}
				else if( e.row.children[0].text === menus[4].title ){
					var dialog = _requires['util'].createDialog({
						title: L('label_signout'),
						message: L('text_signout'),
						buttonNames: [L('label_cancel'), L('label_ok')]
					});
					dialog.addEventListener('click', function(e){
						if( e.index == 1 ){
							_requires['cache'].init();
							_windows['login'].run();
							win.close();
						}
					});
					dialog.show();
				}
				
			});
			view.add(menuTable);
		}
	});
	
	var img_menu = _requires['util'].makeImageButton({
		    image: '/images/img_menu.png',
		    height: 50,
			bottom: 0, left: 10,
		    listener: function(self){
				if( !menuScreen.isVisible ) menuScreen.open();
				else menuScreen.close();
			}
		}
	);
	menuScreen.icon = img_menu;
	frame.bottom.add(img_menu);
	
	var result_view = null, input_view = null;;
	var searchScreen = _requires['util'].createUpScreen({
		'win': win,
		'width': '100%', 'height': 60,
		'open': function( view, layer ){
			result_view = Ti.UI.createScrollView({ scrollType: 'vertical', layout: 'vertical', showVerticalScrollIndicator: true });
			result_view.width = '100%';
			result_view.height = frame.view.height - 60;
			result_view.top = 0;
			layer.add(result_view);
			
			if( OS_IOS ){
				input_view = Ti.UI.createScrollView({ scrollType: 'vertical' });
				input_view.add(view);
				input_view.height = 60;
				input_view.bottom = 0;
				layer.add(input_view);
			}
			
			var searchField = _requires['util'].createAutocompleteField({
				value: '',
				width: '90%',
				method: 'searchAssets',
				bottom: null,
				getResult: function( result ){
					result_view.removeAllChildren();
					for( var i = 0; i < result.length; i++ ){
						var val = result[i];
						var box = createBox({ height: 100 });
						box.top = 10;
						box.add(
							_requires['util'].makeLabel({
								text: val.asset,
								font:{ fontSize: 16 },
								top: 10, left: 10
							})
						);
						box.add(
							_requires['util'].makeLabel({
								text: L('label_issue_supply').format({supply: val.supply}),
								font:{ fontSize: 12 },
								top: 45, right: 10
							})
						);
						
						var border = Ti.UI.createView({ 'width': '95%', height: 1, backgroundColor: '#deb887', bottom: 30, opacity: 0.5 });
						box.add(border);
						
						var menu = _requires['util'].group({
							'info': _requires['util'].makeLabel({
								text: L('label_showinfo'),
								font:{ fontSize: 12 },
								width: '33%', height: 30
							}),
							'holders': _requires['util'].makeLabel({
								text: L('label_holders'),
								font:{ fontSize: 12 },
								width: '33%', height: 30
							}),
							'order': _requires['util'].makeLabel({
								text: L('label_exchange'),
								font:{ fontSize: 12 },
								width: '33%', height: 30
							})
						}, 'horizontal');
						menu.bottom = 0;
						
						menu.info.addEventListener('click', function(e){
							var asset = e.source.parent.parent.children[0].text;
							e.source.opacity = 0.1;
							e.source.animate({ opacity: 1.0, duration: 200 }, function(){
								_windows['assetinfo'].run({ 'asset': asset });
							} );
						});
						menu.holders.addEventListener('click', function(e){
							var asset = e.source.parent.parent.children[0].text;
							e.source.opacity = 0.1;
							e.source.animate({ opacity: 1.0, duration: 200 }, function(){
								_windows['assetholders'].run( { 'asset': asset } );
							} );
						});
						menu.order.addEventListener('click', function(e){
							var asset = e.source.parent.parent.children[0].text;
							e.source.opacity = 0.1;
							e.source.animate({ opacity: 1.0, duration: 200 }, function(){
								_windows['order'].run({ 'main_asset': asset, 'price_asset': 'XCP' });
							} );
						});
						box.add(menu);
						
						result_view.add(box);
					}
				}
			});
			
			var isFocus = false;
			searchField.addEventListener('focus', function(){
				isFocus = true;
			});
			searchField.addEventListener('blur', function(){
				isFocus = false;
			});
			if( OS_IOS ){
				Ti.App.addEventListener('keyboardframechanged', function(e){
					if( isFocus ){
						input_view.height = e.keyboardFrame.height + 10;
						result_view.height = frame.view.height - input_view.height;
					}
					else{
						input_view.height = 60;
						result_view.height = frame.view.height - 60;
					}
				});
			}
			view.add(searchField);
		},
		'close': function(layer){
			if( result_view != null ) layer.remove(result_view);
		}
	});
	
	var icon_search = _requires['util'].makeImageButton({
		    image: '/images/icon_search.png',
		    height: 35,
		    right: 10,
		    listener: function(e){
				if( !searchScreen.isVisible ){
					searchScreen.open();
					icon_search.image = '/images/icon_close.png';
				}
				else{
					searchScreen.close();
					icon_search.image = '/images/icon_search.png';
				}
			}
		}
	);
	frame.bottom.add(icon_search);
	
	win.open();
};