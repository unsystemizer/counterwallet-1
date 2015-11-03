var theWindow = Ti.UI.createWindow({
	title : L('label_tab_ss'),
	backgroundColor : '#e5e5e5',
	orientationModes : [Ti.UI.PORTRAIT],
	navBarHidden : true
});
if( OS_IOS ) theWindow.statusBarStyle = Ti.UI.iPhone.StatusBar.LIGHT_CONTENT;
exports.run = function() {
	var didLoadOnce = false;
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var btc_xcp_limit = -1;
	var btc_xcp_min = -1;
	var btc_xcp_fee = -1;
	var btc_xcp_rate = -1;
	
	var xcp_btc_limit = -1;
	var xcp_btc_min = -1;
	var xcp_btc_fee = -1;
	var xcp_btc_rate = -1;
	
	var send_token_amount = -1;
	var buy_token_amount = -1;
	
	var btc_balance = 0;
	var xcp_balance = 0;
	
	function getBalances(){
		for( var i = 0; i < globals.balances.length; i++ ){
			var val = globals.balances[i];
			if(val["asset"] === 'BTC'){
				 btc_balance = val["balance"];
			}
			else if (val["asset"] === 'XCP'){
				 xcp_balance = val["balance"];
			}
		}
	}
	getBalances();			
	
	function getInfoBTCXCP(){
		getBalances();
		var url = "https://shapeshift.io/marketinfo/btc_xcp";
		 
	 	var client = Ti.Network.createHTTPClient({
	 		// function called when the response data is available
		    onload : function(e) {
		        
		          obj = JSON.parse(this.responseText);
		          btc_xcp_rate = obj["rate"];
		          btc_xcp_limit = obj["limit"];
		          btc_xcp_min = obj["minimum"];
		          btc_xcp_fee = obj["minerFee"];
		         
		          updateFields('na');
		     },
		     // function called when an error occurs, including a timeout
		     onerror : function(e) {
		        Ti.API.debug(e.error);
		        if (globals.tabGroup.tabs.indexOf(globals.tabGroup.getActiveTab( )) == 1){
					alert('error getting rates');
				}
		     },
		     timeout : 5000  // in milliseconds
	 	});
 		// Prepare the connection.
 		client.open("GET", url);
 		// Send the request.
 		client.send();
 	}
 	getInfoBTCXCP();
	
 	function getInfoXCPBTC(){
		var url = "https://shapeshift.io/marketinfo/xcp_btc";
 		var client = Ti.Network.createHTTPClient({
 			// function called when the response data is available
	    	onload : function(e) {
	        
	          obj = JSON.parse(this.responseText);
	          xcp_btc_rate = obj["rate"];
	          xcp_btc_limit = obj["limit"];
	          xcp_btc_min = obj["minimum"];
	          xcp_btc_fee = obj["minerFee"];
	         
	          updateFields('na');
	          if (didLoadOnce == false) {
	          	start_loading.removeSelf();
	          	didLoadOnce = true;
	          }
	        },
     		// function called when an error occurs, including a timeout
		     onerror : function(e) {
		         Ti.API.debug(e.error);
		         if (globals.tabGroup.tabs.indexOf(globals.tabGroup.getActiveTab( )) == 1){
		        	 alert('error getting rates');
		         }
		         if (didLoadOnce == false) {
		          	start_loading.removeSelf();
		          	didLoadOnce = true;
		          }
		     },
		     timeout : 5000  // in milliseconds
		 });
 		// Prepare the connection.
 		client.open("GET", url);
 		// Send the request.
 		client.send();
 	}
 	getInfoXCPBTC();
	
	var main_view = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	theWindow.add(main_view);
	
	var btc_xcp_bar = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: 70 });
	btc_xcp_bar.top = 0;

	var switch_token = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '',
        backgroundImage : '/images/switch_horizontal.png',
    	left:85,
    	top:22,
        width : 40,
        height : 35
    });
	
	var token_left_image = _requires['util'].makeImage({
	    image: '/images/asset_xcp.png',
	    height: 40,
	    top:20,
	    left:30
	});
	var sell_token = 'BTC';
	var buy_token = 'XCP';
	
	var token_right_image = _requires['util'].makeImage({
	    image: '/images/asset_bitcoin.png',
	    height: 40,
	    top:20, left: 140
	});
			
	var sell_label = _requires['util'].makeLabel({
		text:L('label_sell'),
		width: 30,
		color:'#e54353',
		font:{ fontSize:15, fontWeight:'normal'},
		bottom:5, left:145,
	});
	
	var buy_label = _requires['util'].makeLabel({
		text:L('label_buy'),
		width: 30,
		color:'#e54353',
		font:{ fontSize:15, fontWeight:'normal'},
		bottom:5, left:35,
	});
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 160 });
	top_bar.top = 0;
	theWindow.add(top_bar);
	
	var view = Ti.UI.createScrollView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL,
		scrollType: 'vertical',
	});
	main_view.add(view);
	
	var send_amount = '';
	
	var token_amount_field = _requires['util'].makeLabel({
		text:'0 XCP',
		width: '80%',
		top: 35,
		textAlign:'center',
		color:'white',
		font:{ fontSize:40, fontWeight:'normal'}
	});
	
	top_bar.add(token_amount_field);
	
	var atrib = Ti.UI.createAttributedString({
	 	text:token_amount_field.text,
		attributes: [{
			 type: Ti.UI.ATTRIBUTE_FONT,	
			 value: { fontSize:20, fontWeight:'bold'},
			 range: [token_amount_field.text.indexOf(' XCP'), (' XCP').length]
		}]
	});
	
	token_amount_field.attributedString = atrib;
	
	var switch_image = _requires['util'].makeImage({
	    image: '/images/icon_switch.png',
	    height: 30,
	    top:70, right: 10
	});
			
	top_bar.add( switch_image );
	
	var fiat_amount_field = _requires['util'].makeLabel({
		text: _requires['tiker'].to('BTC', 0, _requires['cache'].data.currncy),
		width: '80%',
		top: 85,
		color:'white',
		font:{ fontSize: 20, fontWeight:'normal'}
	});
	
	top_bar.add(fiat_amount_field);
	
	var top_field = token_amount_field;	
	var status_view = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 20 });
	status_view.bottom = 5;
	top_bar.add(status_view);
	
	var status_label = _requires['util'].makeLabel({
		text:L('shape_shift_instruction').format({'asset': buy_token}),
		width: '100%',
		color:'white',
		font:{ fontSize: 16, fontWeight:'bold'}
    });
	status_view.add(status_label);
	
	var progress_view = Ti.UI.createView({ backgroundColor:'#53749c', width: 0, height:4 });
	progress_view.top = 160;
	progress_view.left = 0;
	theWindow.add(progress_view);
	var progress = 0;
	globals.timer_shapshiftupdate = setInterval(function() {
		progress += 0.03333;
	    progress_view.width = progress + '%';
	    if(progress > 100){
	    	progress = 0;
	    	getBalances();
	    	getInfoXCPBTC();
	    	getInfoBTCXCP();
	    }
	}, 10);
	
	var start_loading = _requires['util'].showLoading(theWindow, { width: Ti.UI.FILL, height: Ti.UI.FILL});
	
		switch_image.addEventListener('touchstart', function(){
			send_amount = '0';
			var currentAmount = 0;
			
			if( top_field == token_amount_field ){
				currentAmount = fiat_amount_field.text;
				token_amount_field.top = 85;
				fiat_amount_field.top = 35;
				
				token_amount_field.font = { fontSize:20, fontWeight:'normal'};
				fiat_amount_field.font = { fontSize:40, fontWeight:'normal'};
				top_field = fiat_amount_field;
			}
			else {
				currentAmount = token_amount_field.text;
				token_amount_field.top = 35;
				fiat_amount_field.top = 85;
				
				token_amount_field.font = { fontSize:40, fontWeight:'normal'};
				fiat_amount_field.font = { fontSize:20, fontWeight:'normal'};
				top_field = token_amount_field;
			}
			currentAmount = currentAmount.replace(/\D/g,'');
			updateFields(null);
		});
		
		switch_token.addEventListener('touchstart', function(){
			send_amount = '0';
			
			if(sell_token === 'BTC'){
				sell_token = 'XCP';
				buy_token = 'BTC';
				token_left_image.image = '/images/asset_bitcoin.png';
				token_right_image.image = '/images/asset_xcp.png';
				
				var new_text = '0 XCP';
				fiat_amount_field.text =  _requires['tiker'].to('XCP', 0, _requires['cache'].data.currncy);
				
			}else{
				sell_token = 'BTC';
				buy_token = 'XCP';
				token_left_image.image = '/images/asset_xcp.png';
				token_right_image.image = '/images/asset_bitcoin.png';
				
				var new_text = '0 BTC';
				fiat_amount_field.text =  _requires['tiker'].to('BTC', 0, _requires['cache'].data.currncy);
			}
			send_amount = '0'; 
			updateFields('0');
		});
	
	function addCommas(nStr) {
   		 nStr += '';
   		 x = nStr.split('.');
   		 x1 = x[0];
   		 x2 = x.length > 1 ? '.' + x[1] : '';
    	var rgx = /(\d+)(\d{3})/;
    	while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
   		 }
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
			if(send_amount.indexOf(".") > -1){
			
			}else{
				send_amount = '' + send_amount + value;
			}
		}
		else if(value == 'na'){
			//do nothing
		}
		else{
			
			if(send_amount === '0'){
				send_amount = '' + value;
			}else{
				send_amount = '' + send_amount + value;
			}
		}
		
		if(send_amount.length == 0){
			send_amount = '0';
		}else{
			if(value != 'na' && value != '0'){
				//start_top_bar.hide();
			}
		}
		var toGetSymbol = _requires['tiker'].to('XCP', 0, _requires['cache'].data.currncy);
			toGetSymbol = toGetSymbol.replace('0', '');
		
		var fiat_value = null;
		if(top_field == token_amount_field){
			var new_text = addCommas(send_amount) +' '+buy_token;
			buy_token_amount = send_amount;
			fiat_amount_field.text = _requires['tiker'].to(buy_token, send_amount, _requires['cache'].data.currncy);
			
			var atrib = Ti.UI.createAttributedString({
   				text:new_text,
				attributes: [{
       				type: Ti.UI.ATTRIBUTE_FONT,	
       				value: { fontSize:20 },
        			range: [new_text.indexOf(' '+buy_token), (' '+buy_token).length]
    			}]
			});
			token_amount_field.text = '';
			token_amount_field.attributedString = atrib;
			
			if(value != 'na'){
				if(btc_xcp_rate == -1 || xcp_btc_rate == -1 || btc_xcp_limit == -1 || xcp_btc_limit == -1 || btc_xcp_fee == -1 || xcp_btc_fee == -1 || btc_xcp_min == -1 || xcp_btc_min == -1){
					status_label.text = L('shape_shift_norate');
					getInfoBTCXCP();
					getInfoXCPBTC();
				}else{
					if(buy_token === 'XCP'){
						var total_val = (send_amount /  btc_xcp_rate) + (btc_xcp_fee /  btc_xcp_rate);
						total_val = total_val + 0.0001;
						
						if(total_val < 0){
							total_val = 0;
						}
						if(total_val > 1){
							total_val = total_val.toFixed2(3);
						}
						else{
							total_val = total_val.toFixed2(4);
						}
						send_token_amount = total_val;
						status_label.text = L('shape_shift_spend').format({'amount':addCommas(total_val) + ' ' + sell_token}) + ' (' + btc_balance.toFixed2(4) + 'BTC)';
					}else{
						var total_val = (send_amount / xcp_btc_rate) + xcp_btc_fee;
						
						if(total_val < 0){
							total_val = 0;
						}
						if(total_val > 1){
							total_val = total_val.toFixed2(3);
						}
						else{
							total_val = total_val.toFixed2(4);
						}
						send_token_amount = total_val;
						status_label.text = L('shape_shift_spend').format({'amount':addCommas(total_val)  + ' ' + sell_token}) + ' (' + xcp_balance.toFixed2(4) + 'XCP)';
					}	
				}
			}
		}else{
			fiat_value = _requires['tiker'].to(buy_token, 1, _requires['cache'].data.currncy);
			var toGetSymbol = _requires['tiker'].to(buy_token, 0, _requires['cache'].data.currncy);
			toGetSymbol = toGetSymbol.replace('0', '');
		
			fiat_value =  fiat_value.replace(toGetSymbol,'');
			fiat_amount_field.text = toGetSymbol + addCommas(send_amount);
			fiat_value =  fiat_value.replace(',','');
			var val = (send_amount / fiat_value).toFixed2(8);
			if(fiat_value == 0){
				val = 0;
			}
			buy_token_amount = val;
			var new_text = addCommas(val) + ' ' + buy_token;
			var atrib = Ti.UI.createAttributedString({
   				text:new_text,
				attributes: [{
       				type: Ti.UI.ATTRIBUTE_FONT,	
       				value: { fontSize:10 },
        			range: [new_text.indexOf(' '+buy_token), (' '+buy_token).length]
    			}]
			});
			token_amount_field.text = '';
			token_amount_field.attributedString = atrib;
			
			if(value != 'na'){
				if(btc_xcp_rate == -1 || xcp_btc_rate == -1 || btc_xcp_limit == -1 || xcp_btc_limit == -1 || btc_xcp_fee == -1 || xcp_btc_fee == -1 || btc_xcp_min == -1 || xcp_btc_min == -1){
					status_label.text = L('shape_shift_norate');
					getInfoBTCXCP();
					getInfoXCPBTC();
				}else{
					if(buy_token === 'BTC'){
						var total_val = (val / xcp_btc_rate) + xcp_btc_fee;
						
						if(total_val < 0){
							total_val = 0;
						}
						if(total_val > 1){
							total_val = total_val.toFixed2(3);
						}
						else{
							total_val = total_val.toFixed2(4);
						}
						send_token_amount = total_val;
						status_label.text =  L('shape_shift_spend').format({'amount': addCommas(total_val) + ' ' + sell_token}) + ' (' + xcp_balance.toFixed2(4) + 'XCP)';
					}else{
						var total_val = (val /  btc_xcp_rate) + (btc_xcp_fee /  btc_xcp_rate);
						
						if(total_val < 0){
							total_val = 0;
						}
						if(total_val > 1){
							total_val = total_val.toFixed2(3);
						}
						else{
							total_val = total_val.toFixed2(4);
						}
						send_token_amount = total_val;
						status_label.text =  L('shape_shift_spend').format({'amount': addCommas(total_val) + ' ' + sell_token}) + ' (' + btc_balance.toFixed2(4) + 'BTC)';
						
					}
				}
			}
		}
		if(buy_token_amount == 0){
			status_label.text = L('shape_shift_instruction').format({'asset': buy_token});
		}
	}
	
	var top_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "24%" });
	var first_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "17%" });
	var second_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "17%" });
	var third_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "17%" });
	var fourth_row = Ti.UI.createView({ backgroundColor:'transparent', width: Ti.UI.FILL, height: "17%" });
	
	var confirm_button = Ti.UI.createButton({
        backgroundColor : "#4b986e",
        borderRadius: 4,
        title : L('label_confirm').toUpperCase(),
        color:'white',
        right:10,
        top:20,
        width :100,
        height : 40,
        font:{fontFamily:'Gill Sans', fontSize:20, fontWeight:'light'}
    });
    
	top_row.add(token_left_image);
	top_row.add(sell_label);
	top_row.add(switch_token);
	top_row.add(token_right_image);
	top_row.add(buy_label);
	top_row.add(confirm_button);
 
	var one_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '1',
        color:'#e54353',
        top : 0,
        left: 0,
        width : "33.3%",
        height : "100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	one_button.addEventListener('touchstart', function(){
		updateFields(1);
	});
	first_row.add(one_button);
	
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
	first_row.add(two_button);
	
	var three_button = Ti.UI.createButton({
         backgroundColor : "transparent",
        title : '3',
        color:'#e54353',
        right:0,
        top :0,
        width : "33.3%",
        height :"100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
    three_button.addEventListener('touchstart', function(){
		updateFields(3);
	});
   first_row.add(three_button);
    
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
	second_row.add(four_button);
	
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
	second_row.add(five_button);
	
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
	second_row.add(six_button); 
	
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
	third_row.add(seven_button);
	
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
	third_row.add(eight_button);
	
	var nine_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : '9',
        color:'#e54353',
        right:0,
        top : 0,
        width : "33.3%",
        height :"100%",
        font:{fontFamily:'GillSans-Light', fontSize:40, fontWeight:'light'}
    });
	nine_button.addEventListener('touchstart', function(){
		updateFields(9);
	});
	third_row.add(nine_button);
	
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
	fourth_row.add(dot_button);
	
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
	fourth_row.add(zero_button);
	
	var back_button = Ti.UI.createButton({
        backgroundColor : "transparent",
        title : 'DEL',
        color:'#e54353',
        right:0,
        top : 0,
        width : "33.3%",
        height :"100%",
        font:{fontFamily:'GillSans-Light', fontSize:20, fontWeight:'light'}
    });
	back_button.addEventListener('touchstart', function(){
		updateFields('del');
	});
	fourth_row.add(back_button);
	
	
	
	var keypad_view = _requires['util'].group({
		'toprow':top_row,
		'firstrow':first_row,
		'secondrow':second_row,
		'thirdrow':third_row,
		'fouthrow':fourth_row,
	},'vertical');
	view.add(keypad_view);
	keypad_view.height = Ti.UI.FILL;
	keypad_view.top = 165;
	
	
	var disclaimer_label = _requires['util'].makeLabel({
		text:L('shape_shift_disclaimer'),
		width: '70%',
		height: 30,
		left:10,
		bottom:10,
		textAlign:'left',
		color:'#e54353',
		font:{ fontSize:12, fontWeight:'normal'}
	});
	
	var ss_image = _requires['util'].makeImage({
	    image: '/images/powered_ss.png',
	    height: 30,
	    bottom:7,
	   right:10
	});
	
	var text_balances = _requires['util'].group({
		asset: _requires['util'].makeLabel({
			text: 'XCP',
			top: 0,
			font:{ fontSize: 18 },
		}),
		balance: _requires['util'].makeLabel({
			text: '',
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
	
	
	confirm_button.addEventListener('touchstart', function(){
		var address = _requires['cache'].data.address;
		var pair = sell_token.toLowerCase() + '_' + buy_token.toLowerCase();
		
		if(buy_token === 'BTC'){
			if(send_token_amount < xcp_btc_min){
				
				alert( L('text_shapeshift_more').format( { 'amount': xcp_btc_min, 'asset':sell_token }));
				return;
			}
			if(send_token_amount > xcp_btc_limit){
				alert( L('text_shapeshift_less').format( { 'amount': xcp_btc_limit, 'asset':sell_token }));
				return;
			}
		}
		else if(buy_token === 'XCP'){
			if(send_token_amount < btc_xcp_min){
				alert( L('text_shapeshift_more').format( { 'amount': btc_xcp_min, 'asset':sell_token }));
				return;
			}
			if(send_token_amount > btc_xcp_limit){
				alert( L('text_shapeshift_less').format( { 'amount': btc_xcp_limit, 'asset':sell_token }));
				return;
			}
		}
		
		Titanium.API.log(pair);
		
		var dialog = _requires['util'].createDialog({
			message: L('text_sendconfirmation_shape_shift').format( { 'amount': send_token_amount, 'token':sell_token, 'amount2':buy_token_amount, 'token2':buy_token })+' \n\n('+L('label_fee') + ' 0.0001543 BTC)',
			buttonNames: [L('shape_shift_accept'), L('label_cancel'), L('shape_shift_view_terms')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index == 0 ){
				var client = Ti.Network.createHTTPClient({
		 			// function called when the response data is available
		     		onload : function(e) {
		        		var results = JSON.parse(this.responseText);
		        		var deposit_address = results["deposit"];
		        		
		        		_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
								if( e.success ){
									_requires['network'].connect({
										'method': 'doSend',
										'post': {
											id: _requires['cache'].data.id,
											code: _requires['cache'].data.pass_hash,
											asset: sell_token,
											destination: deposit_address,
											quantity: send_token_amount
										},
										'callback': function( result ){
											_requires['bitcore'].sign(result, {
												'callback': function(signed_tx){
													_requires['network'].connect({
														'method': 'sendrawtransaction',
														'post': {
															tx: signed_tx
														},
														'callback': function( result ){
															var dialog = _requires['util'].createDialog({
																title: L('text_sent'),
																message: L('text_sent_shape_shift'),
																buttonNames: [L('label_close')]
															}).show();
															updateFields(null);
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
								else{
									loading.removeSelf();
								}
							}});
				     },
				     // function called when an error occurs, including a timeout
				     onerror : function(e) {
				        Ti.API.debug(e.error);
				        alert(e.error);
				        loading.removeSelf();
				     },
				     timeout : 10000  // in milliseconds
				});
				// Prepare the connection.
				var jsonData = {
					withdrawal: address,
					pair: pair,
					returnAddress: address
				};
				Titanium.API.log(jsonData);
				client.open("POST","https://shapeshift.io/shift");
		 		//client.setRequestHeader("Content-Type","application/json; charset=utf-8");
		 		// Send the request.
		 		var loading = _requires['util'].showLoading(theWindow, { width: Ti.UI.FILL, height: Ti.UI.FILL});
		 		client.send(jsonData);
		 	}else if( e.index == 2 ){
		 		Ti.Platform.openURL('https://shapeshift.io/files/ShapeShift_Terms_Conditions%20v1.1.pdf');
			}
	 	});
	 	dialog.show();
	});
	Ti.API.ssLoad = 'YES';
	
	if( Ti.App.Properties.getString('shows_ss') !== 'FALSE'){
	   var dialog = _requires['util'].createDialog({
	   		title:'Shapeshift',
			message: L('text_shape_shift_how_to'),
			buttonNames: ['OK',L('text_dont_show')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index == 1 ){
				Ti.App.Properties.setString('shows_ss', "FALSE");
			}
		});
		dialog.show();
	}
};
Ti.API.ss_win = theWindow;