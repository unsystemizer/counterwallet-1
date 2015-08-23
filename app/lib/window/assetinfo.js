exports.run = function( params ){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: true});
	
	var view = _requires['util'].group(null, 'vertical');
	frame.view.add(view);
		
	var loading = _requires['util'].showLoading(frame.view, { width: Ti.UI.FILL, height: Ti.UI.FILL});
	_requires['network'].connect({
		'method': 'getAssetInfo',
		'post': {
			asset: params.asset
		},
		'callback': function( result ){
			var readonly = !(_requires['cache'].data.address === result.issuer);
			function createInfo(json){
				function createFieldBox(){
					var box = _requires['util'].group({
						title: _requires['util'].makeLabel({
							text: '',
							left: 10,
							font:{ fontSize: 10 },
							color: '#a6a8ab'
						}),
						field: _requires['util'].makeTextField({
							value: '',
							width: Ti.UI.FILL,
							height: 35,
							left: 15,
							border: 'hidden',
							keyboardType: Ti.UI.KEYBOARD_DECIMAL_PAD,
						})
					}, 'vertical');
					box.width = '95%';
					box.backgroundColor = '#ffe8d1';
					view.add(box);
					
					return box;
				}
				
				function createBox(){
					var box = _requires['util'].group({
						title: _requires['util'].makeLabel({
							text: '',
							left: 10,
							font:{ fontSize: 15 },
							color: '#a6a8ab'
						})
					});
					box.width = '95%';
					box.height = 35;
					box.backgroundColor = '#ffe8d1';
					view.add(box);
					
					return box;
				}
				
				if( json != null ){
					var image = Ti.UI.createImageView({
						image: json.image,
						width: 50, height: 50,
						top: 10
					});
					view.add(image);
					result.description = json.description;
				}
				
				var box_asset = createFieldBox();
				box_asset.title.text = 'Token Name';
				box_asset.field.value = result.asset;
				box_asset.top = 10;
				
				var box_owner = createFieldBox();
				box_owner.title.text = 'Owned By';
				box_owner.field.value = result.issuer;
				box_owner.top = 10;
				
				var box_description = createFieldBox();
				box_description.title.text = 'Description';
				box_description.field.value = result.description;
				box_description.top = 10;
				
				if( json != null ){
					if( json.website != null ){
						var box_website = createFieldBox();
						box_website.title.text = 'Web';
						box_website.field.value = json.website;
						box_website.top = 10;
					}
					if( json.pgpsig != null ){
						var box_pgpsig = createFieldBox();
						box_pgpsig.title.text = 'pgpsig';
						box_pgpsig.field.value = json.pgpsig;
						box_pgpsig.top = 10;
					}
				}
				
				var box_supply = createFieldBox();
				box_supply.title.text = 'Total Issued';
				box_supply.field.value = result.supply;
				box_supply.top = 10;
				
				var box_divisible = createBox();
				box_divisible.title.text = 'Divisible';
				box_divisible.top = 10;
				var is_divisible = _requires['util'].createSlider({
					'init': result.divisible,
				});
				is_divisible.origin.right = 10;
				box_divisible.add(is_divisible.origin);
				is_divisible.editable = false;
				
				var box_locked = createBox();
				box_locked.title.text = 'Lock';
				box_locked.top = 10;
				var is_locked = _requires['util'].createSlider({
					'init': result.locked,
				});
				is_locked.origin.right = 10;
				box_locked.add(is_locked.origin);
				is_locked.editable = false;
				
				var menus = new Array(
					{ icon: 'icon_review.png', title: L('label_holders') }
				);
				if( !readonly ){
					if( !result.locked ) menus.push({ icon: 'icon_review.png', title: L('label_reissue') });
				}
				var menu_height = menus.length * 50;
				var menuScreen = _requires['util'].createUpScreen({
					'win': win,
					'width': 240, 'height': menu_height,
					'right': 5,
					'backgroundColor': '#ffc07f',
					'open': function( view ){
						var menuTable = _requires['util'].createTableList({
							width: 240, height: menu_height,
							backgroundColor: '#ffffff',
							top: 0,
							rowHeight: 50
						});
						menuTable.setRowDesign(menus, function(row, val){
							row.add(_requires['util'].makeImage({
							    image: '/images/' + val.icon,
							    width: 40,
							    left: 10
							}));
							
							row.add(_requires['util'].makeLabel({
								text: val.title,
								font: { fontSize: 15 },
								color: '#2b4771',
								left: 55
							}));
							
							return row;
						});
						menuTable.addEventListener('click', function(e){
							menuScreen.close();
							if( e.row.children[1].text === menus[0].title ){
								_windows['assetholders'].run( { 'asset': params.asset } );
							}
							else if( e.row.children[1].text === menus[1].title ){
								var dialog = _requires['util'].createInputDialog({
									title: L('label_reissue'),
									message: L('text_reissue'),
									value: '',
									buttonNames: [L('label_close'), L('label_ok')]
								});
								dialog.origin.addEventListener('click', function(e){
									var inputText = (OS_ANDROID)?dialog.androidField.getValue():e.text;
									if( e.index == 1 ){
										if( inputText.length > 0 ){
											_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
												if( e.success ){
													var loading = _requires['util'].showLoading(win.origin, { width: Ti.UI.FILL, height: Ti.UI.FILL});
													
													_requires['network'].connect({
														'method': 'doIssue',
														'post': {
															id: _requires['cache'].data.id,
															code: _requires['cache'].data.pass_hash,
															token: result.asset,
															quantity: inputText
														},
														'callback': function( result ){
															_requires['bitcore'].sign(result, function(signed_tx){
																_requires['network'].connect({
																	'method': 'sendrawtransaction',
																	'post': {
																		tx: signed_tx
																	},
																	'callback': function( result ){
																		var dialog = _requires['util'].createDialog({
																			message: L('text_reissued'),
																			buttonNames: [L('label_close')]
																		});
																		dialog.show();
																	},
																	'onError': function(error){
																		alert(error);
																	},
																	'always': function(){
																		loading.removeSelf();
																	}
																});
															});
														},
														'onError': function(error){
															alert(error);
															loading.removeSelf();
														}
													});
												}
											}});
										}
									}
								});
								dialog.origin.show();
							}
						});
						view.add(menuTable);
					}
				});
				
				var img_menu = _requires['util'].makeImageButton({
					    image: '/images/img_menu.png',
					    height: 50,
					    bottom: 0,
					    right: 10,
					    listener: function(self){
							if( !menuScreen.isVisible ) menuScreen.open();
							else menuScreen.close();
						}
					}
				);
				menuScreen.icon = img_menu;
				frame.bottom.add(img_menu);
				
				loading.removeSelf();
			}
			
			if( /^(https?:\/\/).*\.json/.test(result.description) ){
				_requires['network'].getjson({
					uri: result.description,
					callback: function(json){ createInfo(json); },
					onError: function(){ createInfo(); }
				});
			}
			else createInfo();
		},
		'onError': function(error){
			alert(L('text_assetinfo_error'));
		}
	});
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	
	return win.origin;
};