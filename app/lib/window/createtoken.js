exports.run = function( params ){
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: true });
	
	var view = _requires['util'].group(null, 'vertical');
	frame.view.add(view);
	
	function createBox( params ){
		var box = _requires['util'].group(params.add);
		
		box.height = params.height || 60;
		box.width = '95%';
		box.backgroundColor = '#ffe8d1';
		
		return box;
	}
	
	var sl_numeric = _requires['util'].createSlider({
		init: false,
		on: function(){
			box_token.field.fireEvent('change');
			box_token.field.setValue('A' + ('000000' + Math.floor(Math.random() * 10000000) ).substr(-7) + ('000000' + Math.floor(Math.random() * 10000000) ).substr(-7) + ('0000' + Math.floor(Math.random() * 100000) ).substr(-5));
		},
		off: function(){
			box_token.field.fireEvent('change');
			box_token.field.setValue('');
		}
	});
	sl_numeric.origin.top = sl_numeric.origin.right = 0;
	
	var numeric = _requires['util'].group({
		'origin': sl_numeric.origin,
		'desc': _requires['util'].makeLabel({
			text: L('label_numeric'),
			top: 1,
			font:{ fontSize: 10 },
			color: '#a6a8ab'
		})
	}, 'vertical');
	numeric.right = 10;
	numeric.bottom = 2;
	
	var box_token = createBox({ height: 60, add: {
		'field': _requires['util'].makeTextField({
			hintText: L('label_tokenname'),
			width: '70%', height: 35,
			left: 15,
			border: 'hidden'
		}),
		'fee': _requires['util'].makeLabel({
			text: L('label_fee') + ' 0.5XCP',
			left: 20, bottom: 2,
			font:{ fontSize: 10 },
			color: '#a6a8ab'
		}),
		'numeric': numeric
	} });
	box_token.top = 10;
	box_token.field.addEventListener('change', function(e){
		box_token.field.value = e.value = box_token.field.value.toUpperCase();
		if( e.value.charAt(0) === 'A' ){
			box_token.fee.text = '';
		}
		else{
			box_token.fee.text = L('label_fee') + ' 0.5XCP';
		}
	});
	
	var box_quantity = createBox({ height: 60, add: {
		'field': _requires['util'].makeTextField({
			hintText: L('label_quantity_issue'),
			width: Ti.UI.FILL, height: 35,
			left: 15,
			border: 'hidden',
			keyboardType: Ti.UI.KEYBOARD_DECIMAL_PAD,
		})
	} });
	box_quantity.top = 10;
	
	var box_description = createBox({ height: 40, add: {
		'field': _requires['util'].makeTextField({
			hintText: L('label_description'),
			width: Ti.UI.FILL, height: 35,
			left: 15,
			border: 'hidden'
		})
	} });
	box_description.top = 10;
	
	var box_website = createBox({ height: 40, add: {
		'field': _requires['util'].makeTextField({
			hintText: L('label_website'),
			width: Ti.UI.FILL, height: 35,
			left: 15,
			border: 'hidden'
		})
	} });
	box_website.top = 10;
	
	var box_pgpsig = createBox({ height: 40, add: {
		'field': _requires['util'].makeTextField({
			hintText: L('label_pgpsig'),
			width: Ti.UI.FILL, height: 35,
			left: 15,
			border: 'hidden'
		})
	} });
	box_pgpsig.top = 10;
	
	var box_divisible = createBox({ height: 60, add: {
		'label': _requires['util'].makeLabel({
			text: L('text_makedivisible'),
			font:{ fontSize: 14 },
			left: 15
		})
	} });
	box_divisible.top = 10;
	
	var sl_divisible = _requires['util'].createSlider({
		init: true,
		on: function(){ },
		off: function(){ }
	});
	sl_divisible.origin.right = 10;
	box_divisible.add(sl_divisible.origin);
	
	var box_image = createBox({ height: 60, add: {
		'label': _requires['util'].makeLabel({
			text: L('text_imageupload'),
			font:{ fontSize: 14 },
			left: 15
		})
	} });
	box_image.top = 10;
	
	var blobImage = null, showImage = null;
	var sl_image = _requires['util'].createSlider({
		init: false,
		on: function(){
			Ti.Media.openPhotoGallery({
			    success: function(event) {
			    	box_image.label.text = '';
			    	
			    	blobImage = event.media.imageAsThumbnail(48);
			        showImage = _requires['util'].makeImage({
					    image: blobImage,
					    left: 15
					});
					box_image.add(showImage);
			    },
			    error: function(error) {
			        sl_image.off();
			    },
			    cancel: function() {
			        sl_image.off();
			    },
			    allowEditing: true,
			    mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
			});
		},
		off: function(){
			assetImage = null;
			box_image.remove(showImage);
			box_image.label.text = L('text_imageupload');
		}
	});
	sl_image.origin.right = 10;
	box_image.add(sl_image.origin);
	
	var send_button = _requires['util'].group({
		'image': _requires['util'].makeImage({
		    image: '/images/img_done.png',
		    width: 90,
		    bottom: 10,
		}),
		'text': _requires['util'].makeLabel({
			text: L('text_doissuance'),
			font:{ fontSize: 10 },
			bottom: 0
		})
	});
	send_button.addEventListener('click', function(){
		var result = null;
		_requires['inputverify'].set( new Array(
			{ name: L('label_quantity_issue'), type: 'number', target: box_quantity.field, over: 0, shouldvalue: true }
		));
		if( !sl_numeric.is ) _requires['inputverify'].unshift({ name: L('label_tokenname'), type: 'plain', target: box_token.field, over: 0 });
		
		if( (result = _requires['inputverify'].check()) == true ){
			var token = ((sl_numeric.is)? 'Numeric Token': box_token.field.value);
			var dialog = _requires['util'].createDialog({
				title: L('label_confirm'),
				message: L('text_confirmIssuance').format( {'token': token, 'quantity': box_quantity.field.value} ),
				buttonNames: [L('label_cancel'), L('label_ok')]
			});
			dialog.addEventListener('click', function(e){
				if( e.index == 1 ){
					_requires['auth'].check(win, { title: L('text_createToken'), callback: function(e){
						if( e.success ){
							var loading = _requires['util'].showLoading(win.origin, { width: Ti.UI.FILL, height: Ti.UI.FILL});
							
							_requires['network'].connect({
								'method': 'makeEnhancedInfo',
								'post': {
									asset: token,
									media: blobImage,
									description: box_description.field.value,
									website: box_website.field.value,
									pgpsig: box_pgpsig.field.value,
								},
								'callback': function( url ){
									loading.removeSelf();
									
									var md5 = require('crypt/md5');
									_requires['network'].connect({
										'method': 'doIssue',
										'post': {
											id: _requires['cache'].data.id,
											code: md5.MD5_hexhash(_requires['cache'].data.password),
											token: token,
											description: url,
											quantity: box_quantity.field.value,
											divisible: sl_divisible.is
										},
										'callback': function( result ){
											_requires['bitcore'].sign(result, function(signed_tx){
												_requires['network'].connect({
													'method': 'sendrawtransaction',
													'post': {
														tx: signed_tx
													},
													'callback': function( r ){
														_requires['util'].createDialog({
															message: L('text_issuance_done').format({'asset': result.asset}),
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
										},
										'always': function(){
											loading.removeSelf();
										}
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
	send_button.top = 0;
	
	frame.view.add(_requires['util'].group({
		'box_token': box_token,
		'box_quantity': box_quantity,
		'box_description': box_description,
		'box_website': box_website,
		'box_pgpsig': box_pgpsig,
		'box_image': box_image,
		'send_button': send_button
	}, 'vertical'));
	
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	
	return win.origin;
};