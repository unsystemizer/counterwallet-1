var theWindow = Ti.UI.createWindow({
	title : L('label_tab_exchange'),
	backgroundColor : '#e5e5e5',
	orientationModes : [Ti.UI.PORTRAIT],
	navBarHidden : true
});
if (OS_IOS) theWindow.statusBarStyle = Ti.UI.iPhone.StatusBar.LIGHT_CONTENT;
exports.run = function() {
	var _windows = globals.windows;
	var _requires = globals.requires;

	var popular_tokens = [
		{ asset: 'XCP' },
		{ asset: 'LTBCOIN' },
		{ asset: 'FLDC' },
		{ asset: 'GEMZ' },
		{ asset: 'SJCX' },
		{ asset: 'BITCRYSTALS' }
	];
	search_tokens = popular_tokens;
	
	var display_height = _requires['util'].getDisplayHeight();
	
	var buy_asset = 'XCP';
	var spend_asset = 'XCP';
	var market_price = 0;
	var market_sell_price = 0;
	var open_orders_total_cost = 0;
	var open_orders_total_amount = 0;
	var open_orders_total_price = 0;
	var all_open_sell_orders = [];

	var view = Ti.UI.createView({
		backgroundColor : '#e54353',
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	});
	theWindow.add(view);

	var top_bar = Ti.UI.createView({
		backgroundColor : '#e54353',
		width : Ti.UI.FILL,
		height : 55
	});
	top_bar.top = 0;
	theWindow.add(top_bar);
	
	exchange_title_center = _requires['util'].makeLabel({
		text : L('label_tab_exchange'),
		color : "white",
		font : {
			fontFamily : 'HelveticaNeue-Light',
			fontSize : 20,
			fontWeight : 'normal'
		},
		textAlign : 'center',
		top : 25,
		center : 0
	});
	top_bar.add(exchange_title_center);

	var openOrders = _requires['util'].createTableList({
		backgroundColor : 'white',
		width : '100%',
		height : '40%',
		top : 5,
		rowHeight : 40
	});

	var buyTokens = _requires['util'].createTableList({
		backgroundColor: 'white',
		width: '100%', height: 200,
		top:0,
		rowHeight: 60
	});

	var sellTokens = _requires['util'].createTableList({
		backgroundColor : 'white',
		width : '100%',
		height : 200,
		top : 0,
		rowHeight : 60
	});

	var picker_toolbar = Ti.UI.createView({
		width: '100%',
		height: (OS_ANDROID)? 50: 40,
		backgroundColor: '#e54353'
	});

	var picker_toolbar2 = Ti.UI.createView({
		width: '100%', top: 0,
		height: 40,
		backgroundColor: '#e54353'
	});
	
	var picker1 = _requires['util'].group({
		"toolbar": picker_toolbar,
		"picker": buyTokens
	}, 'vertical');
	if(OS_ANDROID) picker1.top = display_height;
	else picker1.bottom = -340;
	
	var picker2 =  _requires['util'].group({
		"toolbar": picker_toolbar2,
		"picker": sellTokens
	}, 'vertical');
	picker2.bottom = -240;
	
	var price_box = _requires['util'].group();
	price_box.height = 50;
	price_box.width = '100%';

	price_box.top = 55;
	view.add(price_box);

	var fiat_label = _requires['util'].makeLabel({
		text : '---',
		color : 'white',
		font : {
			fontFamily : 'HelveticaNeue-Light',
			fontSize : 26,
			fontWeight : 'normal'
		},
		top : 0
	});

	var price_label = _requires['util'].makeLabel({
		text : '',
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 13,
			fontWeight : 'bold'
		},
		top : 35
	});
	price_box.add(price_label);

	price_box.add(fiat_label);

	var view_settings = [];
	view_settings['basic'] = Ti.UI.createScrollView({
		scrollType : 'vertical',
		top : 145,
		layout : 'vertical',
		backgroundColor : '#ececec',
		showVerticalScrollIndicator : true
	});
	view_settings['advanced'] = Ti.UI.createScrollView({
		scrollType : 'vertical',
		top : 145,
		layout : 'vertical',
		backgroundColor : '#ececec',
		showVerticalScrollIndicator : true
	});

	var cover = Ti.UI.createView({
		height : 30,
		backgroundColor : '#ececec'
	});
	var cover_label = _requires['util'].makeLabel({
		color : '#7a7a7a',
		text : L('label_exchange_basic'),
		font : { fontFamily : 'HelveticaNeue-Light', fontSize : 17, fontWeight : 'normal' }
	});
	cover.add(cover_label);
	var cover2 = Ti.UI.createView({
		height : 30,
		backgroundColor : 'transparent'
	});
	var cover2_label = _requires['util'].makeLabel({
		color : 'white',
		text : L('label_exchange_advanced'),
		font : { fontFamily : 'HelveticaNeue-Light', fontSize : 17, fontWeight : 'normal' }
	});
	cover2.add(cover2_label);

	view.add(view_settings['basic']);
	view.add(view_settings['advanced']);
	view_settings['advanced'].visible = false;
	view_settings['advanced'].left = 0;
	view_settings['basic'].left = 0;
	var category = Ti.UI.createView({
		width : '100%',
		height : 30,
		top : 117
	});
	view.add(category);
	
	var box1 = _requires['util'].group();
	box1.height = 50;
	box1.width = '100%';
	box1.backgroundColor = 'white';
	box1.borderRadius = 0;
	box1.top = 10;
	view_settings['basic'].add(box1);

	var box1_asset_image = Ti.UI.createImageView({
		image : '/images/asset_xcp.png',
		width : 40, height : 40,
		top : 5, left : 60
	});
	box1.add(box1_asset_image);

	function put_box1(asset_name){
		var box1_asset_buy = _requires['util'].makeLabel({
			text : L('label_exchange_buy_large'),
			color : '#7a7a7a',
			font : { fontFamily : 'Helvetica Neue', fontSize : 13, fontWeight : 'bold' },
			top : 17, left : 10
		});
		box1.add(box1_asset_buy);
	
		var border = Ti.UI.createView({
			'width' : 1,
			height : '100%',
			backgroundColor : '#7a7a7a',
			top : 0, left : 50,
			opacity : 0.5
		});
		box1.add(border);
	
		var box1_asset_name = _requires['util'].makeLabel({
			text : asset_name,
			color : 'black',
			minimumFontSize : 10,
			font : { fontFamily : 'Helvetica Neue', fontSize : 15, fontWeight : 'normal' },
			left : 105
		});
		box1.add(box1_asset_name);
	}
	put_box1('XCP');
	
	var box2 = _requires['util'].group();
	box2.height = 50;
	box2.width = '100%';
	box2.backgroundColor = 'white';
	box2.borderRadius = 0;
	box2.top = 5;
	view_settings['basic'].add(box2);
	
	var box2_asset_image = Ti.UI.createImageView({
		image : '/images/asset_xcp.png',
		width : 40, height : 40,
		left : 60
	});
	box2.add(box2_asset_image);
	
	var initial_balance = 0, index_selltoken = 0;
	for( var i = 0; i < globals.balances.length; i++ ){
		if( globals.balances[i].asset === 'XCP' ){
			index_selltoken = i;
			initial_balance = globals.balances[i].balance;
			break;
		}
	}
	
	var box2_asset_balance = null;
	function put_box2(asset_name, balance){
		var box2_asset_sell = _requires['util'].makeLabel({
			text : L('label_exchange_sell_large'),
			color : '#7a7a7a',
			font : { fontFamily : 'Helvetica Neue', fontSize : 13, fontWeight : 'bold' },
			top : 17, left : 7
		});
		box2.add(box2_asset_sell);
	
		var border = Ti.UI.createView({
			'width' : 1,
			height : '100%',
			backgroundColor : '#7a7a7a',
			top : 0, left : 50,
			opacity : 0.5
		});
		box2.add(border);
	
		var box2_asset_name = _requires['util'].makeLabel({
			text : asset_name,
			color : 'black',
			minimumFontSize : 10,
			font : { fontFamily : 'Helvetica Neue', fontSize : 15, fontWeight : 'normal' },
			top : 10, left : 105
		});
		box2.add(box2_asset_name);
		
		box2_asset_balance = _requires['util'].makeLabel({
			text: balance,
			color:'black',
			minimumFontSize: 10,
			height:'50%',
			top:22,
			font:{
				fontFamily:'Helvetica Neue',
				fontSize:12,
				fontWeight:'normal'
			},
			left: 105
		});
		box2.add(box2_asset_balance);
	}
	put_box2('XCP', initial_balance);
	
	var slide_in; 
	var slide_out;
	if( OS_ANDROID ){
		slide_in = Ti.UI.createAnimation({top: display_height - 350, duration:200});
		slide_out = Ti.UI.createAnimation({top: display_height, duration:200});
	}
	else {
		slide_in = Ti.UI.createAnimation({bottom: 0, duration:200});
		slide_out = Ti.UI.createAnimation({bottom: -340, duration:200});
	}
	
	var slide_in2 =  Ti.UI.createAnimation({bottom: 0, duration:200});
	var slide_out2 =  Ti.UI.createAnimation({bottom: -240, duration:200});		

	var searchField = Ti.UI.createTextField({
		borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
		color : 'black',
		hintText : 'token name',
		autocorrect : false,
		left : 5,
		width : 130,
		height : (OS_ANDROID) ? 40 : 30
	});
	var search = _requires['util'].makeLabel({
		text : 'search',
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		},
		height : 30,
		left : 150
	});

	var close = _requires['util'].makeLabel({
		text : 'close',
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		},
		height : 30,
		right : 10
	});

	picker_toolbar.add(searchField);
	picker_toolbar.add(search);
	picker_toolbar.add(close);

	var close2 = _requires['util'].makeLabel({
		text : 'close',
		color : 'white',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 15,
			fontWeight : 'bold'
		},
		height : 30,
		right : 10
	});
	picker_toolbar2.add(close2);

	var searchText = ' ';

	searchField.addEventListener('change', function(e) {
		searchText = e.value;
	});
	close.addEventListener('click',function() {
		searchField.blur();
		picker1.animate(slide_out);
	});

	close2.addEventListener('click', function() {
		picker2.animate(slide_out2);
	});

	var results_label = _requires['util'].makeLabel({
		color : 'black',
		text : '',
		height : 0,
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 18,
			fontWeight : 'bold'
		},
		width : '80%',
		top : 0
	});
	view_settings['basic'].add(results_label);
	
	var results_details_label = _requires['util'].makeLabel({
		color : 'black',
		text : '',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 9,
			fontWeight : 'normal'
		},
		width : '80%',
		top : 0
	});

	var basic_settings_top = _requires['util'].group({
		'left_label' : _requires['util'].makeLabel({
			color : 'black',
			text : L('label_exchange_how_many') + ' BTC ' + L('label_exchange_like_to_buy'),
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 13,
				fontWeight : 'normal'
			},
			width : '40%',
			top : 0,
			left : 10
		}),

		'or_label' : _requires['util'].makeLabel({
			color : 'black',
			text : 'or',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 13,
				fontWeight : 'bold'
			},
			width : '5%',
			top : 0
		}),

		'right_label' : _requires['util'].makeLabel({
			color : 'black',
			text : L('label_exchange_how_many') + ' XCP ' + L('label_exchange_like_to_spend'),
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 13,
				fontWeight : 'normal'
			},
			width : '40%',
			top : 0,
			right : 10
		})
	});
	basic_settings_top.top = 10;
	basic_settings_top.width = '100%';
	
	var keypad_done = Ti.UI.createButton({
		systemButton : Ti.UI.iPhone.SystemButton.DONE
	});

	keypad_done.addEventListener('click', function(e) {
		this.activeFld.blur();
	});
	
	var price_field = _requires['util'].group({
		'label' : _requires['util'].makeLabel({
			text : '('+L('label_exchange_price')+')\nXCP',
			color : '#9b9b9b',
			font : { fontFamily : 'Helvetica Neue', fontSize : 12, fontWeight : 'bold' },
			top: 0
		}),
		'field': _requires['util'].makeTextField({
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			color : 'black',
			textAlign : 'center',
			top : 2,
			keyboardType : Ti.UI.KEYBOARD_DECIMAL_PAD,
			height : 35,
			width: Ti.UI.FILL
		})
	}, 'vertical');
	price_field.left = 5;
	price_field.width = '30%';
	price_field.bottom = 0;
	
	var quantity_field = _requires['util'].group({
		'label' : _requires['util'].makeLabel({
			text : '('+L('label_exchange_amount')+')\nXCP',
			color : '#9b9b9b',
			font : { fontFamily : 'Helvetica Neue', fontSize : 12, fontWeight : 'bold' },
			top: 0
		}),
		'field': _requires['util'].makeTextField({
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			color : 'black',
			textAlign : 'center',
			top : 2,
			keyboardType : Ti.UI.KEYBOARD_DECIMAL_PAD,
			height : 35,
			width: Ti.UI.FILL
		})
	}, 'vertical');
	quantity_field.width = '30%';
	quantity_field.bottom = 0;
	
	advanced_settings_bottom = _requires['util'].group({
		'price_field' : price_field,
		'quantity_field' : quantity_field,
		'orderButton' : Ti.UI.createButton({
			backgroundColor : "#6db558",
			title : L('label_exchange_calculate'),
			color : 'white',
			bottom: 0, right : 5,
			width : "30%", height : 32,
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 15,
				fontWeight : 'normal'
			},
			borderRadius : 5
		})

	});
	advanced_settings_bottom.width = '100%';
	advanced_settings_bottom.top = 0;
	advanced_settings_bottom.orderButton.addEventListener('click', function() {
		order(false);
	});
	
 	basic_settings_middle = _requires['util'].group({
		'buy_field': _requires['util'].makeTextField({
  			borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  			color: 'black',
  			textAlign: 'center',
  			keyboardType: Ti.UI.KEYBOARD_DECIMAL_PAD,
  			top: 10, left: 15,
  			width: 130, height: 35
		}),
		'sell_field' : _requires['util'].makeTextField({
			borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			color : 'black',
			textAlign : 'center',
			keyboardType : Ti.UI.KEYBOARD_DECIMAL_PAD,
			top : 10, right : 15,
			width : 130, height : 35
		}),
	});
	basic_settings_middle.top = 0;
	basic_settings_middle.width = '100%';
	basic_settings_middle.buy_field.addEventListener('click', function(e) {
		var a = Ti.UI.createAnimation();
		a.top = -100;
		a.duration = 500;
	});
	
	cover.width = cover2.width = '50%';
	cover.left = 0; cover2.right = 0;
	var cover_button = _requires['util'].group({
		'basic' : cover,
		'advanced' : cover2
	});
	cover_button.width = '100%';
	
	cover_button.basic.addEventListener('touchstart', function() {
		advanced_settings_bottom.price_field.field.blur();
		advanced_settings_bottom.quantity_field.field.blur();
		view_settings['advanced'].visible = false;
		view_settings['basic'].visible = true;
		view_settings['advanced'].left = 0;
		view_settings['basic'].left = 0;
		cover_label.color = '#7a7a7a';
		cover2_label.color = 'white';
		cover.backgroundColor = '#ececec';
		cover2.backgroundColor = 'transparent';
	});
	cover_button.advanced.addEventListener('touchstart', function() {
		basic_settings_middle.buy_field.blur();
		basic_settings_middle.sell_field.blur();
		if( buy_asset != spend_asset ) goToAdvanced();
	});
	category.add(cover_button);
	
	function calculate_price( target ){
		var calculated_price;
		if( target == basic_settings_middle.buy_field ){
			calculated_price = Math.multiply(market_sell_price, target.value);
			if( target.value.length > 0 ) advanced_settings_bottom.quantity_field.field.value = parseFloat(target.value).toFixed2(8);
		}
		else{
			calculated_price = Math.divide(target.value, market_sell_price);
			if( target.value.length > 0 ) advanced_settings_bottom.quantity_field.field.value = parseFloat(calculated_price).toFixed2(8);
		}
		advanced_settings_bottom.price_field.field.value = parseFloat(market_sell_price).toFixed2(8);
		return calculated_price;
	}
	
	basic_settings_middle.buy_field.addEventListener('change', function(e) {
		if( e.value.length > 0 ){
			results_label.top = 10;
			results_label.height = 'auto';
			if( market_sell_price == 0 ){
				results_label.text = L('label_noprice');
				results_details_label.text = L('text_gocustom');
			}
			else{
				basic_settings_middle.sell_field.value = '';
				var calculated_price = calculate_price(this);
				var message = L('label_exchange_will_spend') + parseFloat(calculated_price).toFixed2(8) + ' ' + spend_asset;
				
				var atrib = Ti.UI.createAttributedString({
					text : message,
					attributes : [{
						type : Ti.UI.ATTRIBUTE_FONT,
						value : { fontFamily : 'HelveticaNeue', fontSize : 12, fontWeight : 'bold' },
						range : [ message.indexOf(L('label_exchange_will_spend')), (L('label_exchange_will_spend')).length ]
					}]
				});
				results_label.text = '';
				results_label.attributedString = atrib;
			
				var fiatVal = _requires['tiker'].to('XCP',( buy_asset === 'XCP' )? 1: parseFloat(calculated_price), _requires['cache'].data.currncy, 4);
				results_details_label.text = L('label_approx') + ' ' + fiatVal + ' '+ L('label_fee') + ' 0.0001 BTC';
				results_label.top = 10;
				results_label.height = 'auto';
			}
		}
	});
	
	basic_settings_middle.sell_field.addEventListener('change', function(e) {
		if( e.value.length > 0){
			results_label.top = 10;
			results_label.height = 'auto';
			if(market_sell_price == 0) {
				results_label.text = L('label_noprice');
				results_details_label.text = L('text_gocustom');
			}
			else {
				basic_settings_middle.buy_field.value = '';
				var calculated_price = calculate_price(this);
				var message = L('label_exchange_will_buy') +  parseFloat(calculated_price).toFixed2(8) + ' ' + buy_asset;

				var atrib = Ti.UI.createAttributedString({
					text : message,
					attributes : [{
						type : Ti.UI.ATTRIBUTE_FONT,
						value : { fontFamily : 'HelveticaNeue', fontSize : 12, fontWeight : 'bold' },
						range : [message.indexOf(L('label_exchange_will_buy')), (L('label_exchange_will_buy')).length]
					}]
				});

				results_label.text = '';
				results_label.attributedString = atrib;

				var fiatVal = _requires['tiker'].to('XCP', ( buy_asset === 'XCP' )? parseFloat(calculated_price): parseFloat(e.value), _requires['cache'].data.currncy, 4);
				results_details_label.text = L('label_approx') + ' ' + fiatVal + ' '+ L('label_fee') + ' 0.0001 BTC';

				results_label.top = 10;
				results_label.height = 'auto';
			}
		}
	});
	
	var orderButton = Ti.UI.createButton({
        backgroundColor : "#6db558",
        title : L('label_confirm'),
        color:'white',
        top : 20,
        width : 200,
        height : 40,
        font:{fontFamily:'Helvetica Neue', fontSize:15, fontWeight:'normal'},
        borderRadius:5
    });
	orderButton.addEventListener('click', function() {
		order(true);
   	});
	
	var customOrderButton = Ti.UI.createButton({
        backgroundColor : "#e54353",
        title :L('label_exchange_custom_order'),
        color:'white',
        top : 10,
        width : 110,
        height : 40,
        font:{
        	fontFamily:'Helvetica Neue',
        	fontSize:15,
        	fontWeight:'normal'
        },
        borderRadius:5
    });
    function goToAdvanced(){
		view_settings['advanced'].visible = true;
		view_settings['basic'].visible = false;
		view_settings['advanced'].left = 0;
		view_settings['basic'].left = 0;
		cover_label.color = 'white';
		cover2_label.color = '#7a7a7a';
		cover.backgroundColor = 'transparent';
		cover2.backgroundColor = '#ececec';
	}
	customOrderButton.addEventListener('click', function() {
		goToAdvanced();
   	});
	
	var basic_fields = _requires['util'].group({
		'results_details_label': results_details_label,
		'basic_settings_top': basic_settings_top,
		'basic_settings_middle': basic_settings_middle,
		'orderButton': orderButton
	}, 'vertical');
	
	var go_customButton = _requires['util'].group({
		'label' : _requires['util'].makeLabel({
			text : '',
			color : '#9b9b9b',
			textAlign : 'left',
			font : { fontFamily : 'Helvetica Neue', fontSize : 12, fontWeight : 'bold' },
			top: 5
		}),
		'customOrderButton': customOrderButton
	}, 'vertical');
	
	var label_choose = Ti.UI.createLabel({
		text : L('text_choose'),
		font : {
			fontFamily : 'HelveticaNeue-Light',
			fontSize : 12,
			fontWeight : 'bold'
		},
		color : '#6db558',
		top: 5
	});

	var labels = _requires['util'].group({
		"open" : _requires['util'].makeLabel({
			text : L('label_exchange_open_orders'),
			left : 5,
			top : 0,
			color : '#9b9b9b',
			textAlign : 'left',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 12,
				fontWeight : 'bold'
			},
		}),

		"price" : _requires['util'].makeLabel({
			text : L('label_exchange_price'),
			top : 0,
			color : '#9b9b9b',
			textAlign : 'left',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 12,
				fontWeight : 'bold'
			},
		}),

		"amount" : _requires['util'].makeLabel({
			text : L('label_exchange_amount'),
			top : 0,
			right : 10,
			color : '#9b9b9b',
			textAlign : 'left',
			font : {
				fontFamily : 'Helvetica Neue',
				fontSize : 12,
				fontWeight : 'bold'
			},
		})
	});
	labels.width = '100%';
	labels.top = 5;

	function addBuyTokens() {
		buyTokens.setRowDesign(search_tokens, function(row, val) {
			if (val.asset != L('label_exchange_getting_tokens') && val.asset != L('label_exchange_search_limit')) {
				var nameLeft = 5;
				if (search_tokens.length < 50) {
					nameLeft = 55;
					
					_requires['util'].putTokenIcon({
						info: val, parent: row,
						width: 40, height: 40,
						left: 5
					});
				}
			}
			var label = Ti.UI.createLabel({
				text : val.asset,
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 20,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				left : nameLeft
			});
			row.add(label);
			return row;
		});
	};
	addBuyTokens();
	buyTokens.addEventListener('click', selectBuyToken);

	box1.addEventListener('click', function() {
		search_tokens = popular_tokens;
		addBuyTokens();
		picker2.animate(slide_out2);
		picker1.animate(slide_in);
	});
	
	box2.addEventListener('click', function() {
		addSellTokens();
		picker1.animate(slide_out);
		picker2.animate(slide_in2);
	});
	
	view.add(picker1);
	view.add(picker2);
	
	search.addEventListener('click', function(){
		searchField.blur();

		if (searchText.length > 0) {
			if (searchText.length < 3) {
				search_tokens = [ {asset: L('label_exchange_search_limit') }];
				addBuyTokens();
				return;
			}
			search_tokens = [ {asset: L('label_exchange_getting_tokens') }];
			addBuyTokens();
			_requires['network'].connect({
				'method' : 'searchAssets',
				'post' : {
					keyword : searchText
				},
				'callback' : function(result) {
					search_tokens = result;
					addBuyTokens();
				},
				'onError' : function(error) {
					alert(error);
				}
			});

		} else {
			search_tokens = popular_tokens;
		}

	});

	function selectBuyToken(e) {
		var selectedVal = search_tokens[e.index].asset;
		buy_asset = selectedVal;
		advanced_settings_bottom.quantity_field.label.text = '('+L('label_exchange_amount')+')\n' + buy_asset;
		
		box1.removeAllChildren();
		put_box1(selectedVal);
		
		_requires['util'].putTokenIcon({
			info: {asset: selectedVal}, parent: box1,
			width: 40, height: 40,
			left: 60
		});
		
		picker1.animate(slide_out);
		globals.getOrders();
	}

	function addSellTokens() {
		sellTokens.setRowDesign(globals.balances, function(row, val) {
			if (val.asset != 'BTC') {
				
				_requires['util'].putTokenIcon({
					info: val, parent: row,
					width: 40, height: 40,
					left: 5
				});
				
				var label = Ti.UI.createLabel({
					text : val.asset,
					font : {
						fontFamily : 'HelveticaNeue-Light',
						fontSize : 20,
						fontWeight : 'normal'
					},
					color : 'black',
					width : 'auto',
					height : 'auto',
					top : 15,
					left : 55
				});

				row.add(label);

				var label_balance = Ti.UI.createLabel({
					text : val.balance,
					font : {
						fontFamily : 'HelveticaNeue-Light',
						fontSize : 12,
						fontWeight : 'normal'
					},
					color : 'black',
					width : 'auto',
					height : 'auto',
					left : 55,
					top : 40
				});
				
				row.add(label_balance);
				return row;
			}

		});
	};
	sellTokens.addEventListener('click', selectSellToken);
	
	globals.change_box2_asset_balance = function(){
		box2_asset_balance.text = globals.balances[index_selltoken].balance;
	};
	function selectSellToken(e) {
		index_selltoken = e.index + 1;
		var selectedVal = spend_asset = globals.balances[e.index + 1].asset;
		sell_asset = selectedVal;
		advanced_settings_bottom.price_field.label.text = '(' + L('label_exchange_price') + ')\n' + sell_asset;
		
		box2.removeAllChildren();
		put_box2(selectedVal, globals.balances[e.index + 1].balance);
		
		_requires['util'].putTokenIcon({
			info: globals.balances[e.index + 1], parent: box2,
			width: 40, height: 40,
			left: 60
		});
		
		picker2.animate(slide_out2);
		globals.getOrders();
	}

	var openOrdersArray = [];
	var closedOrdersArray = [];

	openOrders.addEventListener('click', selectRow);

	function selectRow(e) {
		 var rowId = e.rowData.rowId;
		 advanced_settings_bottom.price_field.field.value = openOrdersArray[e.index].price.toFixed2(8);
	}

	var closedLabel = _requires['util'].makeLabel({
		text : L('label_exchange_closed_orders'),
		left : 5,
		top : 5,
		color : '#9b9b9b',
		textAlign : 'left',
		font : {
			fontFamily : 'Helvetica Neue',
			fontSize : 12,
			fontWeight : 'bold'
		},
	});

	var histories = _requires['util'].createTableList({
		backgroundColor : 'white',
		width : '100%',
		height : '50%',
		top : 5,
		rowHeight : 40
	});

	histories.addEventListener('click', selectRowClosed);

	function selectRowClosed(e) {
		 var rowId = e.rowData.rowId;
		 advanced_settings_bottom.price_field.field.value = closedOrdersArray[e.index].price.toFixed2(8);
	}
	
	globals.getOrders = function(){
		open_orders_total_price = 0;
		open_orders_total_amount = 0;
		open_orders_total_cost = 0;
		market_price = 0;
		market_sell_price = 0;
		basic_settings_top.left_label.text = L('label_exchange_how_many') + ' ' + buy_asset + ' ' + L('label_exchange_like_to_buy');
		basic_settings_top.right_label.text = L('label_exchange_how_many') + ' ' + spend_asset + ' ' + L('label_exchange_like_to_spend');
		results_label.text = '';
		basic_settings_middle.sell_field.value = '';
		basic_settings_middle.buy_field.value = '';
		advanced_settings_bottom.price_field.field.value = '';
		advanced_settings_bottom.quantity_field.field.value = '';
		results_details_label.text = '';
		results_label.top = 0;
		all_open_sell_orders = [];
		are_sell_orders = false;
		price_label.text = "";
		view_settings['basic'].remove(label_choose);
		if( buy_asset != spend_asset ){
			var current_value = null;
			fiat_label.text = L('label_getting_price');
			view_settings['basic'].remove(go_customButton);
			_requires['network'].connect({
				'method' : 'getOrderMatches',
				'post' : {
					id : _requires['cache'].data.id,
					main_asset : buy_asset,
					price_asset : spend_asset
				},
				'callback' : function(result) {
					histories.opacity = 1;
					histories.setData([]);
					if (histories != null) histories.removeAllChildren();
					if (result.length == 0) {
						openOrders.opacity = 1;
						openOrders.height = 30;
						
						histories.add(_requires['util'].makeLabel({
							text : L('label_noorders_closed'),
							backgroundColor : "transparent",
							color : '#9b9b9b',
							font : {
								fontFamily : 'Helvetica Neue',
								fontSize : 12,
								fontWeight : 'bold'
							},
						}));
					}
					if (result[0] != null) {
						closedOrdersArray = result;
						if (result.length > 3) result = result.slice(0, 3);
						
						histories.height = result.length * 40;
						var tokens = ' ' + spend_asset + '/' + buy_asset;
						price_label.text = L('label_noprice');
						
						current_value = result[0]['price'].toFixed2(8);
						
						var current = result[0]['price'].toFixed2(8) + tokens;
						if (result.length > 0) {
							price_label.text = current;
							var atrib = Ti.UI.createAttributedString({
								text : current,
								attributes : [{
									type : Ti.UI.ATTRIBUTE_FONT,
									value : { fontFamily : 'HelveticaNeue', fontSize : 12, fontWeight : 'bold' },
									range : [current.indexOf(tokens), (tokens).length]
								}]
							});
							price_label.text = '';
							price_label.attributedString = atrib;
						}
						market_price = parseFloat(result[0]['price']).toFixed2(8);
						
						if ( !isNaN(result[0]['price']) ) {
							_requires['tiker'].getTiker({
								'callback' : function() {
									fiat_label.text = _requires['tiker'].to('XCP', ( buy_asset === 'XCP' )? 1: current_value, _requires['cache'].data.currncy, 4);
									view_settings['basic'].remove(basic_fields);
									view_settings['basic'].remove(go_customButton);
									view_settings['basic'].add(basic_fields);
								}
							});
						}
						else fiat_label.text = L('label_noprice');
	
						histories.setRowDesign(result, function(row, val) {
							var buy_spend_asset = buy_asset;
							var token_amount = (val.type == 'buy')?val['forward_quantity']: val['backward_quantity'];
							var color = '#6db558';
							if (val.type == 'buy') color = '#e54353';
							if (market_sell_price == 0) market_sell_price = val.price;
							
							var typedate = _requires['util'].group({
								'type': _requires['util'].makeLabel({
									text : L('label_' + val.type),
									left : 0,
									color : color,
									font : { fontFamily : 'Helvetica Neue', fontSize : 12, fontWeight : 'bold' },
								}),
								'date': _requires['util'].makeLabel({
									text : val.date,
									textAlign : 'left',
									left : 0, top: 2,
									color : 'black',
									font : { fontFamily : 'Helvetica Neue', fontSize : 8, fontWeight : 'normal' }
								})
							}, 'vertical');
							typedate.left = 10;
							row.backgroundColor = 'white';
	
							var amount_order = _requires['util'].makeLabel({
								text : token_amount,
								textAlign : 'right',
								right : 10,
								top : 5,
								color : '#9b9b9b',
								font : {
									fontFamily : 'Helvetica Neue',
									fontSize : 12,
									fontWeight : 'normal'
								}
							});
	
							var amount_token = _requires['util'].makeLabel({
								text : buy_spend_asset,
								textAlign : 'right',
								right : 10,
								top : 20,
								color : '#9b9b9b',
								font : {
									fontFamily : 'Helvetica Neue',
									fontSize : 12,
									fontWeight : 'normal'
								}
							});
							
							var fiat_order = _requires['util'].makeLabel({
								text : _requires['tiker'].to('XCP', (spend_asset === 'XCP')? val.price: Math.divide(val.price, current_value), _requires['cache'].data.currncy, 4),
								textAlign : 'center',
								top : 20,
								color : color,
								font : {
									fontFamily : 'Helvetica Neue',
									fontSize : 11,
									fontWeight : 'normal'
								}
							});
	
							var price_order = _requires['util'].makeLabel({
								text : val.price.toFixed(8) + spend_asset,
								textAlign : 'center',
								top : 5,
								color : color,
								font : {
									fontFamily : 'Helvetica Neue',
									fontSize : 13,
									fontWeight : 'normal'
								}
							});
							
							row.add(amount_order);
							row.add(amount_token);
							row.add(fiat_order);
							row.add(price_order);
							row.add(typedate);
	
							return row;
						});
					}
					else {
						price_label.text = '';
						fiat_label.text = L('label_noprice');
						histories.opacity = 0;
						histories.height = 10;
						
						view_settings['basic'].remove(basic_fields);
						go_customButton.label.text = L('label_gocustom_noprice');
						view_settings['basic'].add(go_customButton);
					}
					
					_requires['network'].connect({
						'method' : 'getOrdersBoard',
						'post' : {
							id : _requires['cache'].data.id,
							main_asset : buy_asset,
							price_asset : spend_asset
						},
						'callback' : function(result) {
							openOrders.removeAllChildren();
							openOrders.opacity = 1;
							openOrders.setData([]);
							if (openOrders != null) openOrders.removeAllChildren();
							if (result.sell.length == 0 && result.buy.length == 0) {
								openOrders.opacity = 1;
								openOrders.height = 30;
			
								openOrders.add(_requires['util'].makeLabel({
									text : L('label_noorders'),
									backgroundColor : "transparent",
									color : '#9b9b9b',
									font : {
										fontFamily : 'Helvetica Neue',
										fontSize : 12,
										fontWeight : 'bold'
									},
								}));
							} else {
								function marge(orders, type) {
									var marged = new Array();
									var n = 0;
									for (var i = 0; i < orders.length; i++) {
										var is = true;
										if (i > 0) {
											if (orders[i].price == marged[n].price) {
												marged[n].order += orders[i].order;
												is = false;
											} else {
												n++;
												is = true;
											}
										}
										if (is) {
											if (marged[n] == null) marged[n] = {};
											marged[n].price = orders[i].price;
											if (type === 'buy') {
												marged[n].quantity = orders[i]["get_quantity"];
											} else {
												marged[n].quantity = orders[i]["give_quantity"];
											}
											marged[n].order = orders[i].order;
											marged[n].type = type;
										}
									}
									return marged;
								}
			
								var sell_orders = marge(result.sell, 'sell');
								if (sell_orders.length > 3) sell_orders = sell_orders.slice(0, 3);
								sell_orders.reverse();
								
								var buy_orders = marge(result.buy, 'buy');
								if (buy_orders.length > 3) buy_orders = buy_orders.slice(0, 3);
								
								if( buy_orders.length > 0 ) market_sell_price = buy_orders[0].price;
								else if( sell_orders.length > 0 ) market_sell_price = sell_orders[sell_orders.length - 1].price;
								
								var open_orders = sell_orders.concat(buy_orders);
								openOrdersArray = open_orders;
								openOrders.height = open_orders.length * 40;
								openOrders.setRowDesign(open_orders, function(row, val) {
									var buy_spend_asset = buy_asset;
									var color = '#6db558';
									if (val.type == 'buy') color = '#e54353';
			
									row.add(_requires['util'].makeLabel({
										text : L('label_' + val.type),
										left : 10,
										color : color,
										font : {
											fontFamily : 'Helvetica Neue',
											fontSize : 12,
											fontWeight : 'bold'
										},
									}));
									row.backgroundColor = 'white';
			
									var amount_token = _requires['util'].makeLabel({
										text : val.order.toFixed2(4),
										textAlign : 'right',
										color : '#9b9b9b',
										top: 5, right: 10,
										font : {
											fontFamily : 'Helvetica Neue',
											fontSize : 12,
											fontWeight : 'normal'
										}
									});
									row.add(amount_token);
			
									var token_tag = _requires['util'].makeLabel({
										text : buy_spend_asset,
										textAlign : 'right',
										color : '#9b9b9b',
										top: 20, right: 10,
										font : {
											fontFamily : 'Helvetica Neue',
											fontSize : 12,
											fontWeight : 'normal'
										}
									});
									row.add(token_tag);
									
									if( current_value != null ){
										var fiat_price = _requires['util'].makeLabel({
											text : _requires['tiker'].to('XCP', (spend_asset === 'XCP')? val.price : Math.divide(val.price, current_value), _requires['cache'].data.currncy, 4),
											textAlign : 'center',
											color : color,
											top: 20,
											font : {
												fontFamily : 'Helvetica Neue',
												fontSize : 11,
												fontWeight : 'normal'
											}
										});
										row.add(fiat_price);
									}
									
									var price = _requires['util'].makeLabel({
										text : val.price.toFixed(8) + spend_asset,
										textAlign : 'center',
										color : color,
										top: 5,
										font : {
											fontFamily : 'Helvetica Neue',
											fontSize : 13,
											fontWeight : 'normal'
										}
									});
									row.add(price);
			
									return row;
								});
							}
						},
						'onError' : function(error) {
							alert(error);
						}
					});
				},
				'onError' : function(error) {
					alert(error);
				}
			});
		}
		else{
			fiat_label.text = L('---');
			view_settings['basic'].add(label_choose);
			view_settings['basic'].remove(basic_fields);
			view_settings['basic'].remove(go_customButton);
		}
	};
	globals.getOrders();

	var view_custom = _requires['util'].group({
		'fields' : advanced_settings_bottom,
		'labels' : labels,
		'openOrders' : openOrders,
		'closedTitle' : closedLabel,
		'histories' : histories
	}, 'vertical');
	view_settings['advanced'].add(view_custom);
	
	function order(is_basic){
		var total_amount = Math.multiply(advanced_settings_bottom.price_field.field.value, advanced_settings_bottom.quantity_field.field.value).toFixed2(8);
		if( is_basic ){
			var target = (basic_settings_middle.buy_field.value != '')? basic_settings_middle.buy_field: basic_settings_middle.sell_field;
			calculate_price(target);
			_requires['inputverify'].set(new Array({
					name : L('label_price'),
					type : 'number',
					target : target,
					over : 0
				})
			);
		}
		else{
			_requires['inputverify'].set(new Array({
				name : L('label_price'),
				type : 'number',
				target : advanced_settings_bottom.price_field.field,
				over : 0
			}, {
				name : L('label_quantity'),
				type : 'number',
				target : advanced_settings_bottom.quantity_field.field,
				over : 0
			}));
		}
		var result = null;
		if (( result = _requires['inputverify'].check()) == true) {
			var noun = L('text_necessarycost').format({
				'total' : total_amount,
				'price_asset' : spend_asset
			});
			var dialog = _requires['util'].createDialog({
				title : L('label_confirmorder'),
				message : L('text_confirmorder').format({
					'price' : advanced_settings_bottom.price_field.field.value,
					'price_asset' : spend_asset,
					'quantity' : advanced_settings_bottom.quantity_field.field.value,
					'main_asset' : buy_asset
				}) + '\n' + noun + ((is_basic)? '\n' + L('label_exchange_disclaimer'):''),
				buttonNames : [L('label_exchange_place_order'), L('label_cancel'), (is_basic)?L('label_exchange_create_custom_order'): null]
			});
			dialog.addEventListener('click', function(e) {
				if( e.index == 2 ) goToAdvanced();
				else if( e.index == 0 ) {
					_requires['auth'].check({
						title : L('label_confirmorder'),
						callback : function(e) {
							if (e.success) {
								var loading = _requires['util'].showLoading(theWindow, {
									width : Ti.UI.FILL,
									height : Ti.UI.FILL
								});

								_requires['network'].connect({
									'method' : 'doOrder',
									'post' : {
										id : _requires['cache'].data.id,
										code : _requires['cache'].data.pass_hash,
										type : 'buy',
										price_asset : spend_asset,
										price_quantity : total_amount,
										main_asset : buy_asset,
										main_quantity : advanced_settings_bottom.quantity_field.field.value
									},
									'callback' : function(result) {
										_requires['bitcore'].sign(result, {
											'callback': function(signed_tx) {
												_requires['network'].connect({
													'method' : 'sendrawtransaction',
													'post' : {
														tx : signed_tx
													},
													'callback' : function(result) {
														_requires['util'].createDialog({
															message : L('text_orderd'),
															buttonNames : [L('label_close')]
														}).show();
													},
													'onError' : function(error) {
														alert(error);
													},
													'always' : function() {
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
									'onError' : function(error) {
										alert(error);
										loading.removeSelf();
									}
								});
							}
						}
					});
				}
			});
			dialog.show();
		} else {
			var dialog = _requires['util'].createDialog({
				message : result.message,
				buttonNames : [L('label_close')]
			});
			dialog.addEventListener('click', function(e) {
				result.target.focus();
			});
			dialog.show();
		}
	}

	Ti.API.dexLoad = 'YES';
};
Ti.API.exchange_win = theWindow;