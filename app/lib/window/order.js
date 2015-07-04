exports.run = function( params ){
	var _requires = globals.requires;
	
	var inputverify = require('require/inputverify');
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: true });
	
	var currentprice = _requires['util'].makeLabel({
		text: '',
		top: 0,
		font:{ fontSize: 15 }
	});
	var currentcurrency = _requires['util'].makeLabel({
		text: '',
		top: 0,
		font:{ fontSize: 12 }
	});
	
	var ordersBoard = _requires['util'].group({
		'label_price': _requires['util'].makeLabel({
			text: L('label_price'),
			top: 0,
			font:{ fontSize: 12 }
		}),
		'label_price_asset': _requires['util'].makeLabel({
			text: params.price_asset,
			top: 15,
			font:{ fontSize: 10 }
		}),
		'label_sell': _requires['util'].makeLabel({
			text: L('label_sell'),
			top: 0, left: 20,
			font:{ fontSize: 12 }
		}),
		'label_buy': _requires['util'].makeLabel({
			text: L('label_buy'),
			top: 0, right: 20,
			font:{ fontSize: 12 }
		}),
		'table': Ti.UI.createView({
			width: '95%',
			height: '85%',
			top: 30,
			backgroundColor: '#ffe8d1'
		}),
	});
	ordersBoard.top = 10;
	ordersBoard.height = '45%';
	
	var histories = _requires['util'].createTableList({
		backgroundColor: '#ffffff',
		width: '100%', height: 120,
		top: 10, rowHeight: 50
	});
	
	var myhistories = _requires['util'].createTableList({
		backgroundColor: '#ffffff',
		width: '100%', height: 120,
		top: 10, rowHeight: 50
	});
	myhistories.is = false;
	
	function getOrders(){
		myhistories.is = false;
		_requires['network'].connect({
			'method': 'getOrdersBoard',
			'post': {
				id: _requires['cache'].data.id,
				main_asset: params.main_asset,
				price_asset: params.price_asset
			},
			'callback': function( result ){
				if( ordersBoard.table != null ) ordersBoard.table.removeAllChildren();
				if( result.sell.length == 0 && result.buy.length == 0 ){
					ordersBoard.table.add(
						_requires['util'].makeLabel({
							text: L('label_noorders'),
							font:{ fontSize: 12 }
						})
					);
				}
				else{
					function marge( orders ){
						var marged = new Array();
						var n = 0;
						for(var i = 0; i < orders.length; i++ ){
							var is = true;
							if( i > 0 ){
								if( orders[i].price == marged[n].price ){
									marged[n].order += orders[i].order;
									is = false;
								}
								else{
									n++; is = true;
								}
							}
							if( is ){
								if( marged[n] == null ) marged[n] = {};
								marged[n].price = orders[i].price;
								marged[n].order = orders[i].order;
							}
						}
						return marged;
					}
					var sell_orders = marge(result.sell);
					var buy_orders = marge(result.buy);
					
					var ORDERS = {};
					
					var _BASELINE = _requires['util'].convert_y(ordersBoard.table.toImage().height) / 2 - 10;
					
					var len = sell_orders.length;
					for(var i = 0; i < len; i++){
						ORDERS['sell' + i] = _requires['util'].makeLabel({
							text: sell_orders[i].price.toFixed(10),
							top: _BASELINE - (i * 20),
							font:{ fontSize: 12 }
						});
						ORDERS['sell_order' + i] = _requires['util'].makeLabel({
							text: sell_orders[i].order.toFixed(2),
							top: _BASELINE - (i * 20), left: 10,
							font:{ fontSize: 12 }
						});
					}
					
					len = buy_orders.length;
					for(var i = 0; i < len; i++){
						ORDERS['buy' + i] = _requires['util'].makeLabel({
							text: buy_orders[i].price.toFixed(10),
							top: _BASELINE + ((i + 1) * 20),
							font:{ fontSize: 12 }
						});
						ORDERS['buy_order' + i] = _requires['util'].makeLabel({
							text: buy_orders[i].order.toFixed(2),
							top: _BASELINE + ((i + 1) * 20), right: 10,
							font:{ fontSize: 12 }
						});
					}
					for(key in ORDERS) ordersBoard.table.add(ORDERS[key]);
				}
			},
			'onError': function(error){
				alert(error);
			}
		});
		
		_requires['network'].connect({
			'method': 'getOrderMatches',
			'post': {
				id: _requires['cache'].data.id,
				main_asset: params.main_asset,
				price_asset: params.price_asset
			},
			'callback': function( result ){
				if( histories != null ) histories.removeAllChildren();
				
				var current = (result.length > 0) ? result[0]['price'].toFixed2() : L('label_noprice');
				currentprice.text = L('label_price') + '：' + current;
				
				currentcurrency.text = '';
				if( !isNaN(current) ){
					_requires['tiker'].getTiker({
						'callback': function(){
							currentcurrency.text = '(' + _requires['tiker'].to('XCP', current, _requires['cache'].data.currncy) + ')';
						}
					});
				}
				histories.setRowDesign(result, function(row, val){
					row.add(_requires['util'].makeLabel({
						text: L('label_' + val.type),
						left: 10,
						font:{ fontSize: 15 }
					}));
					
					var info = _requires['util'].group({
						'a': _requires['util'].makeLabel({
							text: val.price.toFixed2(),
							top: 0,
							font:{ fontSize: 15 }
						}),
						'b': _requires['util'].makeLabel({
							text: val.date,
							top: 20,
							font:{ fontSize: 10 }
						})
					});
					info.right = 10;
					row.add(info);
					
					return row;
				});
			},
			'onError': function(error){
				alert(error);
			}
		});
	}
	getOrders();
	
	var input_main = _requires['util'].createAutocompleteField({
		value: params.main_asset,
		width: 150,
		left: 0,
		method: 'getAssetNames',
		callback: function( text ){
			params.main_asset = text;
			getOrders();
		},
		parent: frame.view
	});
	var input_price = _requires['util'].createAutocompleteField({
		value: params.price_asset,
		width: 150,
		left: 10,
		method: 'getAssetNames',
		callback: function( text ){
			params.price_asset = ordersBoard['label_price_asset'].text = text;
			getOrders();
		},
		parent: frame.view
	});
	
	var input_mainprice = _requires['util'].group({
		'input_main': input_main,
		'input_price': input_price
	}, 'horizontal');
	input_mainprice.top = 10;
	
	var menuScreen = _requires['util'].createUpScreen({
		'win': win,
		'height': 300,
		'open': function( view ){
			var total_amount = 0;
			var order_form = _requires['util'].group({
				'price': _requires['util'].makeTextField({
					hintText: L('label_price') + '('+params.price_asset+')',
					width: 120, height: 35,
					top: 10, left: 10,
					keyboardType: Ti.UI.KEYBOARD_DECIMAL_PAD,
				}),
				'quantity': _requires['util'].makeTextField({
					hintText: L('label_quantity_order'),
					width: 120, height: 35,
					top: 10, left: 150,
					keyboardType: Ti.UI.KEYBOARD_DECIMAL_PAD,
				}),
				'total_price': _requires['util'].makeLabel({
					text: L('text_totalcost').format({'asset': params.price_asset, 'amount': total_amount}),
					top: 50, right: 10,
					font:{ fontSize: 12 }
				}),
				'cost_miner': _requires['util'].makeLabel({
					text: 'Miners fee 0.0002 BTC',
					top: 65, right: 10,
					font:{ fontSize: 10 }
				}),
				'cost_redeem': _requires['util'].makeLabel({
					text: 'Reedemable fee 0.000156 BTC',
					top: 75, right: 10,
					font:{ fontSize: 10 }
				}),
			});
			order_form.top = 0;
			
			function order( type ){
				var result = null;
				_requires['inputverify'].set( new Array(
					{ name: L('label_price'), type: 'number', target: order_form.price, over: 0 },
					{ name: L('label_quantity'), type: 'number', target: order_form.quantity, over: 0 }
				));
				if( (result = _requires['inputverify'].check()) == true ){
					var noun = ((type === 'buy')? L('text_necessarycost').format({'total': total_amount, 'price_asset': params.price_asset }): L('text_canget').format({'total': total_amount, 'price_asset': params.price_asset}));
					var dialog = _requires['util'].createDialog({
						title: L('label_confirm'),
						message: L('text_comfirmorder').format({'type': ((type === 'buy')? L('label_buy'): L('label_sell')), 'price': order_form.price.value, 'price_asset': params.price_asset, 'quantity': order_form.quantity.value, 'main_asset': params.main_asset }) + '\n' + noun,
						buttonNames: [L('label_cancel'), L('label_ok')]
					});
					dialog.addEventListener('click', function(e){
						if( e.index == 1 ){
							_requires['auth'].check(win, { title: L('label_confirmorder'), callback: function(e){
								if( e.success ){
									var loading = _requires['util'].showLoading(win.origin, { width: Ti.UI.FILL, height: Ti.UI.FILL});
									
									var md5 = require('crypt/md5');
									_requires['network'].connect({
										'method': 'doOrder',
										'post': {
											id: _requires['cache'].data.id,
											code: md5.MD5_hexhash(_requires['cache'].data.password),
											type: type,
											price_asset: params.price_asset,
											price_quantity: total_amount,
											main_asset: params.main_asset,
											main_quantity: order_form.quantity.value
										},
										'callback': function( result ){
											_requires['bitcore'].sign(result, function(signed_tx){
												_requires['network'].connect({
													'method': 'sendrawtransaction',
													'post': {
														tx: signed_tx
													},
													'callback': function( result ){
														_requires['util'].createDialog({
															message: L('text_orderd'),
															buttonNames: [L('label_close')]
														}).show();
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
					});
					dialog.show();
				}
				else{
					var dialog = _requires['util'].createDialog({
						message: result.message,
						buttonNames: [L('label_close')]
					});
					dialog.addEventListener('click', function(e){
						result.target.focus();
					});
					dialog.show();
				}
			}
			var buttons = _requires['util'].group({
				'buy': _requires['util'].makeButton({
					label: L('label_buy'),
					font: { fontSize: 12 },
					color: '#ffffff',
					backgroundColor: '#ff8200',
					borderColor: '#ff8200',
					borderRadius: 3,
					width: 120, height: 25,
					left: 0,
					listener: function(){ order('buy'); }
				}),
				'sell': _requires['util'].makeButton({
					label: L('label_sell'),
					font: { fontSize: 12 },
					color: '#ffffff',
					backgroundColor: '#ff8200',
					borderColor: '#ff8200',
					borderRadius: 3,
					width: 120, height: 25,
					left: 10,
					listener: function(){ order('sell'); }
				})
			}, 'horizontal');
			buttons.top = 10;
			
			if( !myhistories.is ){
				_requires['network'].connect({
					'method': 'getOrderHistory',
					'post': {
						id: _requires['cache'].data.id,
						main_asset: params.main_asset,
						price_asset: params.price_asset
					},
					'callback': function( result ){
						myhistories.is = true;
						if( histories != null ) histories.removeAllChildren();
						myhistories.setRowDesign(result, function(row, val){
							row.add(_requires['util'].makeLabel({
								text: L('label_' + val.type),
								left: 10,
								font:{ fontSize: 15 }
							}));
							
							var order = _requires['util'].group({
								'a': _requires['util'].makeLabel({
									text:  L('label_order_price') + ' ' + val.price.toFixed2(),
									top: 0, left: 0,
									font:{ fontSize: 12 }
								}),
								'b': _requires['util'].makeLabel({
									text:  L('label_order_num') + ' ' + val.order,
									top: 15, left: 0,
									font:{ fontSize: 12 }
								}),
								'c': _requires['util'].makeLabel({
									text: L('label_order_status') + ' ' + L('label_order_status_' + val.status),
									top: 30, left: 0,
									font:{ fontSize: 12 }
								})
							});
							order.right = 10;
							row.add( order );
							
							return row;
						});
					},
					'onError': function(error){
						alert(error);
					}
				});
			}
			
			view.add(_requires['util'].group({
				'title': _requires['util'].makeLabel({
					text: L('lebal_orderhistory'),
					top: 0, left: 10,
					font:{ fontSize: 12 }
				}),
				'myhistories': myhistories,
				'order_form': order_form,
				'buttons': buttons
			}, 'vertical'));
			
			function updateTotalPrice(){
				if( order_form.price.value.length > 0 && order_form.quantity.value.length > 0 ){
					total_amount = (order_form.price.value * order_form.quantity.value).toFixed2();
					order_form.total_price.text = L('text_totalcost').format({'asset': params.price_asset, 'amount': total_amount});
				}
			}
			order_form.price.addEventListener('change', updateTotalPrice);
			order_form.quantity.addEventListener('change', updateTotalPrice);
		}
	});
	
	var button = _requires['util'].makeButton({
		label: L('label_order'),
		font: { fontSize: 12 },
		color: '#ffffff',
		width: 50, height: 30,
		range: { width: 80, height: Ti.UI.FILL },
		right: 10,
		backgroundColor: '#ff8200',
		borderColor: '#ff8200',
		borderRadius: 3,
		listener: function(){
			if( !menuScreen.isVisible ) menuScreen.open();
			else menuScreen.close();
		}
	});
	menuScreen.origin.addEventListener('open', function(){
		button.setLabel(L('label_close'));
	});
	menuScreen.origin.addEventListener('close', function(){
		button.setLabel(L('label_order'));
	});
	frame.bottom.add(button);
	
	var view = _requires['util'].group({
		'currentprice': currentprice,
		'currentcurrency': currentcurrency,
		'ordersBoard': ordersBoard,
		'histories': histories,
		'input_mainprice': input_mainprice
	}, 'vertical');
	frame.view.add(view);
	
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
};