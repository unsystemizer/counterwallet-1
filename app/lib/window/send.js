exports.run = function( params ){
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var main_view = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	win.origin.add(main_view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 185 });
	top_bar.top = 0;
	win.origin.add(top_bar);
	
	var back_home = _requires['util'].makeLabel({
		text:L('label_tab_home'),
		color:"white",
		font:{ fontSize:15, fontWeight:'normal'},
		textAlign: 'right',
		top: 25, left:10
	});
	top_bar.add( back_home );
	
	back_home.addEventListener('touchstart', function(){
		win.close();
	});
	
	var settings_title_center = _requires['util'].makeLabel({
		text:L('label_send'),
		color:"white",
		font:{ fontFamily: 'HelveticaNeue-Light', fontSize: 20, fontWeight:'normal' },
		top: 25, center: 0
	});
	top_bar.add( settings_title_center );
	
	var view = Ti.UI.createScrollView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL,
		scrollType: 'vertical',
	});
	main_view.add(view);
	
	var send_amount = '';
	var is_fiatvalue = ( params.fiat != null && params.fiat.length > 0 )? true: false;
	
	var token_amount_field = _requires['util'].makeLabel({
		text:'0 '+params.asset,
		width: '80%',
		top: 60,
		color: 'white',
		font:{ fontSize: 40 }
	});
	top_bar.add( token_amount_field );
	
	var atrib = Ti.UI.createAttributedString({
	 	text: token_amount_field.text,
		attributes: [{
			 type: Ti.UI.ATTRIBUTE_FONT,	
			 value: { fontSize:20, fontWeight:'bold'},
			 range: [token_amount_field.text.indexOf(' '+params.asset), (' '+params.asset).length]
		}]
	});
	token_amount_field.attributedString = atrib;
	
	var fiat_amount_field = _requires['util'].makeLabel({
		text: _requires['tiker'].to('XCP', 0, _requires['cache'].data.currncy),
		width: '80%',
		top: 110,
		color:'white',
		font:{ fontSize: 20 }
	});
	if( !is_fiatvalue ) fiat_amount_field.opacity = 0.3;
	top_bar.add(fiat_amount_field);
	
	var top_field = token_amount_field;
	
	var toGetSymbol = _requires['tiker'].to('XCP', 0, _requires['cache'].data.currncy);
		toGetSymbol = toGetSymbol.replace('0','');
	var fiat_value = 0;
	var available_balance_text = params.balance + ' ' + params.asset;
	
	if(params.fiat != null){
		fiat_value = params.fiat.replace(toGetSymbol,'') / params.balance;
	}
		
	if( params.fiat != null ) available_balance_text = params.balance + ' ' + params.asset + ' (' + params.fiat +')';
	if(fiat_value == 0) available_balance_text = params.balance + ' ' + params.asset;
	var available_balance = _requires['util'].makeLabel({
		text: available_balance_text,
		width: '80%',
		top: 140,
		color:'white',
		font:{ fontSize:12, fontWeight:'normal'}
	});
	
	top_bar.add(available_balance);
	
	var switch_image = _requires['util'].makeImage({
	    image: '/images/icon_switch.png',
	    height: 30,
	    top:100, right: 10
	});
	top_bar.add( switch_image );
	
	function switch_inputs(){
		if( top_field == token_amount_field ){
			top_field = fiat_amount_field;
			
			token_amount_field.font = { fontSize:20, fontWeight:'normal' };
			fiat_amount_field.font = { fontSize:40, fontWeight:'normal' };
			
			token_amount_field.top = (OS_ANDROID)? 90: 110;
			fiat_amount_field.top = 60;
		}
		else{
			top_field = token_amount_field;
			
			token_amount_field.font = { fontSize:40, fontWeight:'normal' };
			fiat_amount_field.font = { fontSize:20, fontWeight:'normal' };
			
			token_amount_field.top = 60;
			fiat_amount_field.top = 110;
		}
		updateFields(null);
	}
	if( !is_fiatvalue ) switch_image.setOpacity(0.3);
	else{
		switch_image.addEventListener('touchstart', switch_inputs);
	}
	
	function addCommas(nStr) {
   		 nStr += '';
   		 x = nStr.split('.');
   		 x1 = x[0];
   		 x2 = x.length > 1 ? '.' + x[1] : '';
    	 var rgx = /(\d+)(\d{3})/;
    	 while (rgx.test(x1)) x1 = x1.replace(rgx, '$1' + ',' + '$2');
   		 return x1 + x2;
	}
	function updateFields( value ){
		if( value == null ) send_amount = '';
		else if(value === 'del'){
			if(send_amount.length > 0){
				send_amount = send_amount.slice(0, send_amount.length - 1);
			}
		}
		else if(value === '.'){
			if(send_amount.indexOf(".") <= -1){
				send_amount = '' + send_amount + value;
			}
		}
		else{
			if(send_amount === '0'){
				send_amount = '' + value;
			}else{
				send_amount = '' + send_amount + value;
			}
		}
		
		if(send_amount.length == 0) send_amount = '0';
		var toGetSymbol = _requires['tiker'].to('XCP', 0, _requires['cache'].data.currncy);
			toGetSymbol = toGetSymbol.replace('0', '');
		
		var fiat_value = null;
		if( is_fiatvalue ){
		  fiat_value = _requires['tiker'].to(params.asset.toUpperCase(), 1, _requires['cache'].data.currncy);
		  Titanium.API.log(fiat_val);
		 
		  	fiat_value = fiat_value.replace(toGetSymbol,'');
		  	  Titanium.API.log(fiat_value);
			fiat_value = fiat_value.replace(',','');
		}
		
		if(top_field == token_amount_field){
			var new_text = addCommas(send_amount) + ' ' + params.asset;
			
			if( is_fiatvalue ){
				var val = (send_amount * fiat_value).toFixed2(2);
				
				if( fiat_value == 0 ) val = 0;
				fiat_amount_field.text = val;
				fiat_amount_field.text = toGetSymbol + addCommas(val);
			}
			
			var atrib = Ti.UI.createAttributedString({
   				text:new_text,
				attributes: [{
       				 type: Ti.UI.ATTRIBUTE_FONT,	
       				 value: { fontSize:20 },
        			range: [new_text.indexOf(' '+params.asset), (' '+params.asset).length]
    			}]
			});
			token_amount_field.text = '';
			token_amount_field.attributedString = atrib;
		}else{
			fiat_amount_field.text = toGetSymbol + addCommas(send_amount);
			var fiat_val = _requires['tiker'].to(params.asset.toUpperCase(), 1, _requires['cache'].data.currncy);
			
			fiat_val = fiat_val.replace(toGetSymbol,'');
			fiat_val = fiat_val.replace(',','');
			
			var val = addCommas((send_amount / fiat_val).toFixed2(8));
			if( fiat_val == 0 ) val = 0;
			var new_text = val +' '+ params.asset;
			var atrib = Ti.UI.createAttributedString({
   				text: new_text,
				attributes: [{
       				type: Ti.UI.ATTRIBUTE_FONT,	
       				value: { fontSize: 10 },
        			range: [ new_text.indexOf(' '+params.asset), (' '+params.asset).length ]
    			}]
			});
			token_amount_field.text = '';
			token_amount_field.attributedString = atrib;
		}
	}
	
	var recipient = _requires['util'].makeTextField({
		hintText: L('label_destination'),
		width: Ti.UI.FILL,
		height: 40,
		paddingLeft:7,    
		paddingRight:7,    
		autocorrect:false,
		textAlign:'left',
		backgroundColor:"white",
		font:{ fontSize:12, fontWeight:'normal'},
		border: 'hidden',
		top:185
	});
	view.add(recipient);
	
	var first_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "20%" });
	var second_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "20%" });
	var third_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "20%" });
	var fourth_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "20%" });
	var fith_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "20%" });
	
	var qr_button = Ti.UI.createButton({
        backgroundColor: 'transparent',
        title: '',
        backgroundImage: '/images/img_qrcode.png',
        color: '#e54353',
        left: 30,
        width: 50, height: 50,
        font:{fontFamily:'GillSans-Light', fontSize:20, fontWeight:'light'}
    });
	qr_button.addEventListener('touchstart', function(){
		readQR();
	});
	first_row.add(qr_button);
	
	var send_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : L('text_dosend'),
        color:'#e54353',
        right:0,
        width :"33.3%",
        height : "100%",
        font:{fontFamily:'Gill Sans', fontSize:20, fontWeight:'light'}
    });
	first_row.add(send_button);
	
	var one_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '1',
        color:'#e54353',
        top :0,
        left:0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	one_button.addEventListener('touchstart', function(){
		updateFields(1);
	});
	second_row.add(one_button);
	
	var two_button = Ti.UI.createButton({
         backgroundColor : "transparent",
        title : '2',
        color:'#e54353',
        top : 0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	two_button.addEventListener('touchstart', function(){
		updateFields(2);
	});
	second_row.add(two_button);
	
	var three_button = Ti.UI.createButton({
         backgroundColor : "transparent",
        title : '3',
        color:'#e54353',
        right:0,
        top : 0,
       width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
    three_button.addEventListener('touchstart', function(){
		updateFields(3);
	});
    second_row.add(three_button);
    
    var four_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '4',
        color:'#e54353',
        top : 0,
        left:0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	four_button.addEventListener('touchstart', function(){
		updateFields(4);
	});
	third_row.add(four_button);
	
	var five_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '5',
        color:'#e54353',
        top : 0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	five_button.addEventListener('touchstart', function(){
		updateFields(5);
	});
	third_row.add(five_button);
	
	var six_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '6',
        color:'#e54353',
        right:0,
        top : 0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	six_button.addEventListener('touchstart', function(){
		updateFields(6);
	});
	third_row.add(six_button); 
	
	 var seven_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '7',
        color:'#e54353',
        top : 0,
        left:0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	seven_button.addEventListener('touchstart', function(){
		updateFields(7);
	});
	fourth_row.add(seven_button);
	
	var eight_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '8',
        color:'#e54353',
        top : 0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	eight_button.addEventListener('touchstart', function(){
		updateFields(8);
	});
	fourth_row.add(eight_button);
	
	var nine_button = Ti.UI.createButton({
         backgroundColor : "transparent",
        title : '9',
        color:'#e54353',
        right:0,
        top : 0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	nine_button.addEventListener('touchstart', function(){
		updateFields(9);
	});
	fourth_row.add(nine_button);
	
	var dot_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '.',
        color:'#e54353',
        top : 0,
        left:0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	dot_button.addEventListener('touchstart', function(){
		updateFields('.');
	});
	fith_row.add(dot_button);
	
	var zero_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '0',
        color:'#e54353',
        top : 0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	zero_button.addEventListener('touchstart', function(){
		updateFields(0);
	});
	fith_row.add(zero_button);
	
	var back_button = Ti.UI.createButton({
         backgroundColor : "transparent",
        title : 'DEL',
        color:'#e54353',
        right:0,
        top : 0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:20, fontWeight:'light'}
    });
	back_button.addEventListener('touchstart', function(){
		updateFields('del');
	});
	fith_row.add(back_button);
	
	var keypad_view = _requires['util'].group({
		'firstrow':first_row,
		'secondrow':second_row,
		'thirdrow':third_row,
		'fouthrow':fourth_row,
		'fithrow':fith_row,
	},'vertical');
	view.add(keypad_view);
	keypad_view.height = Ti.UI.FILL;
	keypad_view.top = 230;
	
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
	
	var details = _requires['util'].group({
		'txt_dust': _requires['util'].makeLabel({
			text: 'BTC 0.0000543 BTC',
			top: 5, right: 10,
			font:{ fontSize: 12 },
			color: '#a6a8ab'
		}),
		'txt_fee': _requires['util'].makeLabel({
			text: L('label_fee') + ' 0.0001543 BTC',
			top: 18, right: 10,
			font:{ fontSize: 10 },
			color: '#a6a8ab'
		})
	});
	
	var box_amount = _requires['util'].group({
		'amount': _requires['util'].makeTextField({
			hintText: L('label_quantity_send'),
			width: Ti.UI.FILL,
			height: 50,
			textAlign:'center',
			font:{ fontSize:20, fontWeight:'normal'},
			border: 'hidden',
			keyboardType: Ti.UI.KEYBOARD_DECIMAL_PAD,
		})
	});
	box_amount.top = 0;
	box_amount.width = '100%';
	box_amount.height = 50;
	box_amount.backgroundColor = 'transparent';
	box_amount.amount.addEventListener('change', function(e){
		if( e.value.length > 0 ){
			if( Number(e.value) > Number(params.balance) ) box_amount.amount.value = e.value = params.balance;
			text_balances.after.text = '→ ' + (params.balance - e.value).toFixed2();
		}
		else text_balances.after.text = '';
	});
	
	var box_amount_fiat = _requires['util'].group({
		'amount': _requires['util'].makeTextField({
			hintText: L('label_quantity_send'),
			width: Ti.UI.FILL,
			textAlign:'center',
			font:{ fontSize:20, fontWeight:'normal'},
			border: 'hidden',
			keyboardType: Ti.UI.KEYBOARD_DECIMAL_PAD,
		})
	});
	box_amount_fiat.top = 65;
	box_amount_fiat.width = '100%';
	box_amount_fiat.height = 50;
	box_amount_fiat.backgroundColor = 'transparent';
	box_amount_fiat.amount.addEventListener('change', function(e){
		if( e.value.length > 0 ){
			if( Number(e.value) > Number(params.balance) ) box_amount_fiat.amount.value = e.value = params.balance;
			text_balances.after.text = '→ ' + (params.balance - e.value).toFixed2();
		}
		else text_balances.after.text = '';
	});
	
	if( params.asset === 'BTC' ) details.txt_dust.text = '';
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
	box_address.top = 175;
	box_address.width = '100%';
	box_address.height = 50;
	box_address.backgroundColor = 'white';
	
	var box_desc_address = _requires['util'].group();
	box_desc_address.top = 130;
	box_desc_address.width = '100%';
	
	function setValues( vals ){
		
		if( vals.asset != null && vals.asset != params.asset ){
			var send_token = null;
			for( var i = 0; i < globals.balances.length; i++ ){
				if( globals.balances[i].asset === vals.asset ){
					send_token = globals.balances[i];
					break;
				}
			}
			if( send_token != null ){
				var data = {
					'asset': send_token.asset,
					'balance': send_token.balance,
					'fiat': globals.requires['tiker'].to(send_token.asset, send_token.balance, globals.requires['cache'].data.currncy),
					'address': vals.address,
					'amount': vals.amount,
					'currency': vals.currency
				};
				globals.windows['send'].run(data);
			}
			else{
				_requires['util'].createDialog({
					message: L('label_errortokenfound').format({'token': vals.asset}),
					buttonNames: [L('label_close')]
				}).show();
			}
		}
		else{
			if( vals.currency != null ){
				vals.extras = { 'currency': vals.currency };
			}
			
			if( vals.address != null ){
				recipient.value = vals.address.toString();
				
				if( vals.extras != null && vals.extras.currency != null ){
					if( is_fiatvalue && _requires['tiker'].isAvailable(vals.extras.currency) ){
						if( top_field == token_amount_field ) switch_inputs();
						if( _requires['cache'].data.currncy != vals.extras.currency ){
							vals.amount = _requires['tiker'].swapCurrency({
								'from': vals.extras.currency,
								'to': _requires['cache'].data.currncy,
								'amount': vals.amount
							});
						}
					}
					else vals.amount = 0;
				}
				else{
					if( top_field != token_amount_field ) switch_inputs();
				}
				
				if( vals.amount != null ){
					updateFields( null );
					updateFields( vals.amount );
				}
			}
		}
		if( vals.message != null ){
			_requires['util'].createDialog({
				title: L('text_withmessage'),
				message: vals.message,
				buttonNames: [L('label_close')]
			}).show();
		}
	}
	setValues(params);
	
	function readQR(){
		_requires['util'].readQRcode({
			callback: setValues
		});
	}
	
	send_button.addEventListener('touchstart', function(){
		var result = null;
		var send_text = token_amount_field.attributedString.text;
		var to_send_amount = send_text.replace(' '+params.asset,'');
		
		var temp_field = _requires['util'].makeTextField({
			hintText: L('label_destination'),
			left: 15,
			height: 35,
			width: 210,
			border: 'hidden'
		});
		
		to_send_amount = to_send_amount.replace(/[^\d.-]/g, '');
		temp_field.value = to_send_amount;
		
		_requires['inputverify'].set( new Array(
			{ name: L('label_quantity_send'), type: 'number', target: temp_field, over: 0, shouldvalue: true },
			{ name: L('label_destination'), type: 'address', target: recipient, over: 0 }
		));
		if( (result = _requires['inputverify'].check()) == true ){
			var dialog = _requires['util'].createDialog({
				title: L('label_confirm'),
				message: L('text_sendconfirmation').format( { 'address': recipient.value, 'amount': temp_field.value, 'token':params.asset })+' '+L('label_fee') + ' 0.0001543 BTC',
				buttonNames: [L('label_cancel'), L('label_ok')]
			});
			dialog.addEventListener('click', function(e){
				if( e.index == 1 ){
					_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
						if( e.success ){
							
							var loading = _requires['util'].showLoading(win.origin, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('loading_send')});
							_requires['network'].connect({
								'method': 'create_send',
								'post': {
									id: _requires['cache'].data.id,
									asset: params.asset,
									destination: recipient.value,
									quantity: temp_field.value
								},
								'callback': function( result ){
									_requires['bitcore'].sign(result.unsigned_hex, {
										'callback': function(signed_tx){
											_requires['network'].connect({
												'method': 'sendrawtransaction',
												'post': {
													tx: signed_tx
												},
												'callback': function( result ){
													if( params.channel != null ) globals.publich({'status': true});
													
													var dialog = _requires['util'].createDialog({
														message: L('text_sent'),
														buttonNames: [L('label_close')]
													});
													dialog.addEventListener('click', function(e){
														win.close();
													});
													dialog.show();
													
													_requires['network'].connect({
														'method': 'acs_push',
														'post': {
															id: _requires['cache'].data.id,
															acs_key: Alloy.CFG.acs_key,
															type: 'send',
															asset: params.asset,
															destination: recipient.value,
															quantity:temp_field.value
														},
														'callback': function( result ){
															Ti.API.info(JSON.stringify(result));
														},
														'onError': function(error){
															Ti.API.info(error);
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
										},
										'fail': function(){
											alert(L('text_error_serierize'));
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
	
	Ti.API.home_tab.open(win.origin,{ animated:true });
	return win.origin;
};