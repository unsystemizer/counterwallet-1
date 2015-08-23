exports.run = function( params ){
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: true });
	
	var view = Ti.UI.createScrollView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL,
		scrollType: 'vertical',
	});
	frame.view.add(view);
	
	var text_balances = _requires['util'].group({
		asset: _requires['util'].makeLabel({
			text: params.asset,
			top: 0,
			font:{ fontSize: 18 },
		}),
		balance: _requires['util'].makeLabel({
			text: params.balance,
			top: 20,
			font:{ fontSize: 25 },
		}),
		after: _requires['util'].makeLabel({
			text: '',
			top: 50,
			font:{ fontSize: 15 },
		})
	});
	text_balances.top = 70;
	win.view.add(text_balances);
	
	var box_amount = _requires['util'].group({
		'txt_dust': _requires['util'].makeLabel({
			text: 'BTC 0.0000543 BTC',
			top: 5, right: 10,
			font:{ fontSize: 12 },
			color: '#a6a8ab'
		}),
		'txt_fee': _requires['util'].makeLabel({
			text: L('label_fee') + ' 0.0001 BTC',
			top: 18, right: 10,
			font:{ fontSize: 10 },
			color: '#a6a8ab'
		}),
		'amount': _requires['util'].makeTextField({
			hintText: L('label_quantity_send'),
			width: Ti.UI.FILL,
			height: 35,
			left: 15, top: 30,
			border: 'hidden',
			keyboardType: Ti.UI.KEYBOARD_DECIMAL_PAD,
		})
	});
	box_amount.top = 0;
	box_amount.width = '90%';
	box_amount.height = 65;
	box_amount.backgroundColor = '#ffe8d1';
	box_amount.amount.addEventListener('change', function(e){
		if( e.value.length > 0 ){
			if( Number(e.value) > Number(params.balance) ) box_amount.amount.value = e.value = params.balance;
			text_balances.after.text = '→ ' + (params.balance - e.value).toFixed2();
		}
		else text_balances.after.text = '';
	});
	if( params.asset === 'BTC' ) box_amount.txt_dust.text = '';
	
	var param = {
	    backgroundImage:'/images/img_qrcode.png',
	    width: 30,
	    height: 30,
	    right: 5,
	    listener: readQR
	};
	
	var box_address = _requires['util'].group({
		address: _requires['util'].makeTextField({
			hintText: L('label_destination'),
			left: 15,
			height: 35,
			width: 210,
			border: 'hidden'
		}),
		rightButton: _requires['util'].makeImageButton( param )
	});
	box_address.top = 75;
	box_address.width = '90%';
	box_address.height = 50;
	box_address.backgroundColor = '#ffe8d1';
	
	var box_desc_address = _requires['util'].group();
	box_desc_address.top = 130;
	box_desc_address.width = '90%';
	
	view.add(_requires['util'].group({
		'box_amount': box_amount,
		'input_bitcoinaddress': box_address,
		'box_desc_address': box_desc_address
	}));
	
	function readQR(){
		_requires['util'].readQRcode({
			callback: function( vals ){
				if( vals.address != null ){
					if( vals.options != null ){
						if( vals.options.message != null ){
							_requires['util'].createDialog({
								title: L('text_withmessage'),
								message: vals.options.message,
								buttonNames: [L('label_close')]
							}).show();
						}
					}
					box_address.address.value = vals.address;
				}
				else{
					_requires['util'].createDialog({
						message: L('text_unreadable'),
						buttonNames: [L('label_close')]
					}).show();
				}
			}
		});
	}
	
	var send_button = _requires['util'].group({
		image: _requires['util'].makeImage({
		    image: '/images/img_done.png',
		    width: 90,
		    bottom: 10,
		}),
		text: _requires['util'].makeLabel({
			text: L('text_dosend'),
			font:{ fontSize: 10 },
			bottom: 0
		})
	});
	send_button.addEventListener('click', function(){
		var result = null;
		_requires['inputverify'].set( new Array(
			{ name: L('label_quantity_send'), type: 'number', target: box_amount.amount, over: 0, shouldvalue: true },
			{ name: L('label_destination'), type: 'address', target: box_address.address, over: 0 }
		));
		if( (result = _requires['inputverify'].check()) == true ){
			var dialog = _requires['util'].createDialog({
				title: L('label_confirm'),
				message: L('text_sendconfirmation').format( { 'address': box_address.address.value, 'amount': box_amount.amount.value }),
				buttonNames: [L('label_cancel'), L('label_ok')]
			});
			dialog.addEventListener('click', function(e){
				if( e.index == 1 ){
					_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
						if( e.success ){
							var loading = _requires['util'].showLoading(win.origin, { width: Ti.UI.FILL, height: Ti.UI.FILL});
							
							_requires['network'].connect({
								'method': 'doSend',
								'post': {
									id: _requires['cache'].data.id,
									code: _requires['cache'].data.pass_hash,
									asset: params.asset,
									destination: box_address.address.value,
									quantity: box_amount.amount.value
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
													message: L('text_sent'),
													buttonNames: [L('label_close')]
												});
												dialog.addEventListener('click', function(e){
													win.close({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
												});
												dialog.show();
												
												_requires['network'].connect({
													'method': 'acs_push',
													'post': {
														id: _requires['cache'].data.id,
														acs_key: Alloy.CFG.acs_key,
														type: 'send',
														asset: params.asset,
														destination: box_address.address.value,
														quantity: box_amount.amount.value
													},
													'callback': function( result ){
														//
													},
													'onError': function(error){
														alert(error);
													}
												});
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
	});
	send_button.bottom = 20;
	frame.view.add(send_button);
	
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	
	return win.origin;
};