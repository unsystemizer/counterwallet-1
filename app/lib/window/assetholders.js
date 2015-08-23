exports.run = function( params ){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: true, NoScroll: true });
	
	var info = globals.datas;
	var total_holders = 0;
	
	var loading = _requires['util'].showLoading(frame.view, { width: Ti.UI.FILL, height: Ti.UI.FILL});
	_requires['network'].connect({
		'method': 'getHolders',
		'post': {
			id: _requires['cache'].data.id,
			asset: params.asset
		},
		'callback': function( result ){
			total_holders = result.count;
			
			var title = _requires['util'].makeLabel({
				text: params.asset,
				top: 5,
				font:{ fontSize: 17 }
			});
			frame.view.add(title);
			
			var count = _requires['util'].makeLabel({
				text: L('text_holdcount').format({'count': result.count}),
				top: 30,
				font:{ fontSize: 12 }
			});
			frame.view.add(count);
			
			var view = Ti.UI.createScrollView({ scrollType: 'vertical', layout: 'vertical', backgroundColor: '#ffe0c1', showVerticalScrollIndicator: true });
			view.top = 50;
			frame.view.add(view);
			
			function createBox( params ){
				var box = _requires['util'].group();
				box.height = params.height;
				box.width = '95%';
				box.borderColor = '#deb887';
				box.borderRadius = 3;
				box.backgroundColor = '#ffffff';
				
				return box;
			}
			
			for( var i = 0; i < result.holders.length; i++ ){
				var val = result.holders[i];
				var box = createBox({ height: 70 });
				box.top = 10;
				box.add(
					_requires['util'].makeLabel({
						text: val.address,
						top: 10, left: 10,
						font:{ fontSize: 12 }
					})
				);
				box.add(
					_requires['util'].makeLabel({
						text: val.quantity,
						top: 25, left: 20,
						font:{ fontSize: 20 }
					})
				);
				box.add(
					_requires['util'].makeLabel({
						text: (val.ratio * 100).toFixed2() + '%',
						top: 50, right: 10,
						font:{ fontSize: 11 }
					})
				);
				view.add(box);
			}
		},
		'onError': function(error){
			alert(error);
		},
		'always': function(){
			loading.removeSelf();
		}
	});
	if( globals.issues[params.asset] ){
		var menuScreen = _requires['util'].createUpScreen({
			'win': win,
			'height': 150,
			'open': function( view, layer ){
				var desc = _requires['util'].group({
					'description': _requires['util'].makeLabel({
						text: L('text_dividend_description').format({ asset: params.asset }),
						textAlign: 'left',
						font:{ fontSize: 12 }
					})
				});
				desc.top = 0;
				desc.width = '95%';
				
				var form = _requires['util'].group({
					'paydistribution': _requires['util'].createAutocompleteField({
						value: params.main_asset,
						hintText: L('label_dividend_token'),
						width: '65%', height: 35,
						top: 10,
						over: 1,
						method: function(text){
							var balances = globals.balances;
							var array = new Array();
							for( var i = 0; i < balances.length; i++ ){
								if( balances[i].asset.match( new RegExp('^' + text, 'ig') ) != null ){
									array.push(balances[i].asset);
								}
							}
							return array;
						},
						callback: function( text ){
							
						},
						parent: layer
					}),
					'perunit': _requires['util'].makeTextField({
						hintText: '%',
						width: '25%', height: 35,
						top: 10, left: 10,
						keyboardType: Ti.UI.KEYBOARD_DECIMAL_PAD,
					})
				}, 'horizontal');
				form.top = 0;
				
				var fee = _requires['util'].makeLabel({
					text: L('label_fee') + ' ' + (total_holders * 0.0002).toFixed2() + 'XCP',
					top: 5, right: 10,
					font:{ fontSize: 10 },
					color: '#a6a8ab'
				});
				
				view.add(
					_requires['util'].group({
						'desc': desc,
						'form': form,
						'fee': fee,
						'button': _requires['util'].makeButton({
							label: L('label_dodividend'),
							font: { fontSize: 12 },
							color: '#ffffff',
							backgroundColor: '#ff8200',
							borderColor: '#ff8200',
							borderRadius: 3,
							width: 120, height: 25,
							top: 10,
							listener: function(){
								var result = null;
								_requires['inputverify'].set( new Array(
									{ name: L('label_dividend_token'), type: 'string', target: form.paydistribution, over: 0 },
									{ name: '%', type: 'number', target: form.perunit, over: 0, shouldvalue: true }
								));
								if( (result = _requires['inputverify'].check()) == true ){
									var dialog = _requires['util'].createDialog({
										title: L('label_confirm'),
										message: L('text_dividendconfirmation').format( { 'token': form.paydistribution.value, 'perunit': form.perunit.value }),
										buttonNames: [L('label_cancel'), L('label_ok')]
									});
									dialog.addEventListener('click', function(e){
										if( e.index == 1 ){
											_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
												if( e.success ){
													var loading = _requires['util'].showLoading(win.origin, { width: Ti.UI.FILL, height: Ti.UI.FILL});
													
													_requires['network'].connect({
														'method': 'doDividend',
														'post': {
															id: _requires['cache'].data.id,
															code: _requires['cache'].data.pass_hash,
															asset: params.asset,
															dividend_asset: form.paydistribution.value,
															quantity_per_unit: (form.perunit.value / 100).toFixed2()
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
																			message: L('text_dividend'),
																			buttonNames: [L('label_close')]
																		});
																		dialog.addEventListener('click', function(e){
																			win.close({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
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
														},
														'always': function(){
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
						})
					}, 'vertical')
				);
			}
		});
		
		var button = _requires['util'].makeButton({
			label: L('label_dividend'),
			font: { fontSize: 12 },
			color: '#ffffff',
			width: 60, height: 30,
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
			button.setLabel(L('label_dividend'));
		});
		frame.bottom.add(button);
	}
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	
	return win.origin;
};