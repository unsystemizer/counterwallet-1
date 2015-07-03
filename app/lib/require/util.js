module.exports = (function() {
	
	function merge( obj1, obj2 ){
	    if( !obj2 ) obj2 = {};
	    for (var attrname in obj2) {
	        if (obj2.hasOwnProperty(attrname)) obj1[attrname] = obj2[attrname];
	    }
	    return obj1;
	};
	
	function getFont( params ){
		var basic_font = { fontSize: '15dp', fontFamily: 'Verdana' };
		if( params.font ) basic_font = merge(basic_font, params.font);
		
		return basic_font;
	};
	
	function makeAnimation( directory, num, params ){
		var images = [];
		
		for( var i = 0; i < num; i++ ){
			images.push('/images/'+directory+'/'+i+'.png');
		}
		var basic = {
			 'images': images,
		};
		var animation = Ti.UI.createImageView( merge(basic, params) );
		animation.start();
		
		return animation;
	};
	
	this.makeImage = function( params ){
		var image = Ti.UI.createImageView( params );
		return image;
	};
	
	this.makeImageButton = function( params ){
		var image = Ti.UI.createImageView(params);
		if( params.listener != null ){
			image.addEventListener('click', function(){
				params.listener(image);
			});
		}
		
		return image;
	};
	
	this.makeButton = function( params ){
		var view = Ti.UI.createView( params );
		var label = this.makeLabel({
			text: params.label,
			color: params.color || '#ffffff',
			font: params.font
		});
		view.add(label);
		
		if( params.listener != null ){
			if( params.range != null ){
				params.width = params.range.width;
				params.height = params.range.height;
				params.backgroundColor = null;
				params.borderRadius = null;
				params.borderColor = 'transparent';
				var view_range = Ti.UI.createView(params);
				view_range.addEventListener('click', function(){
					params.listener(view);
				});
				view_range.setLabel = function( new_label ){
					label.text = new_label;
				};
				view_range.add(view);
				return view_range;
			}
			else{
				view.setLabel = function( new_label ){
					label.text = new_label;
				};
				view.addEventListener('click', function(){
					params.listener(view);
				});
			}
		}
		return view;
	};
	
	this.makeTextField = function( params ){
		var basic = {
			clearButtonMode: Ti.UI.INPUT_BUTTONMODE_ONFOCUS,
			keyboardType: Ti.UI.KEYBOARD_DEFAULT,
			returnKeyType: Ti.UI.RETURNKEY_DONE,
			borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			color: '#000000'
		};
		if( params.border === 'hidden' ){
			if( OS_ANDROID ){
				//basic.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
				basic.backgroundColor = 'transparent';
				basic.borderWidth = 0;
				basic.borderColor = 'transparent';
				params.border = null;
			}
			else{
				basic.borderStyle = Ti.UI.INPUT_BORDERSTYLE_NONE;
			}
		}
		else{
			if( OS_ANDROID ){
				basic.backgroundColor = 'transparent';
				basic.borderWidth = 1;
				basic.borderColor = '#a9a9a9';
				params.border = null;
			}
		}
		params.font = getFont( params );
		
		if( params.keyboardType == Ti.UI.KEYBOARD_DECIMAL_PAD ){
			if( OS_ANDROID ) params.keyboardType = Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION;
		}
		
		var field = Ti.UI.createTextField( merge(basic, params) );
		if( params.keyboardType == Ti.UI.KEYBOARD_DECIMAL_PAD ){
			if( OS_IOS ){
				var doneBtn = Ti.UI.createButton({ title : L('label_close'), width : 67, height : 32 });
				doneBtn.addEventListener('click', function(e){ field.blur(); });
				field.keyboardToolbar = [doneBtn];
			}
		}
		return field;
	};
	
	this.makeCustomTextField = function( params ){
		var basic = {
			width: Ti.UI.SIZE,
			height: Ti.UI.SIZE,
		};
		
		var field = Ti.UI.createView(merge(basic, params));
        if( params.hintText ){
	    	var text = this.makeLabel({
				text: params.hintText,
				left: 10,
				color: '#a6a8ab'
			});
			field.text = text;
			field.add(text);
		}
		
		if( params.type === 'native' ){
			params.left = 10;
			params.width = Ti.UI.FILL;
			params.top = null; params.bottom = null;
			
			var textField = this.makeTextField(params);
			textField.addEventListener('blur', function(){
				var text = textField.getValue();
				field.text.visible = true;
				textField.visible = false;
				
				if( text.length > 0 ){
					field.text.text = text;
					field.text.color = '#000000';
				}
				else{
					field.text.text = params.hintText;
					field.text.color = '#a6a8ab';
				}
			});
			textField.visible = false;
			
			field.textField = textField;
			field.add(textField);
		}
		
		field.setValue = function( value ){
			if( value.length > 0 ){
				field.text.text = value;
				field.text.color = '#000000';
			}
			else{
				field.text.text = params.hintText;
				field.text.color = '#a6a8ab';
			}
			if( field.textField != null ) field.textField.setValue( value );
		};
		
		field.getValue = function(){
			return field.text.text;
		};
		
		field.blur = function(){
			if( field.textField != null ){
				textField.visible = false; field.text.visible = true;
				textField.blur();
			}
		};
		
		field.focus = function(){
			if( field.textField != null ){
				textField.visible = true; field.text.visible = false;
				textField.focus();
			}
		};
		
		field.addEventListener('click', function(){
			if( params.type === 'native' ){
				field.text.visible = false;
				if( !field.textField.visible ){
					field.textField.visible = true;
					field.textField.focus();
				}
			}
		});
		
		return field;
	};
	
	this.makeLabel = function( params ){
		var basic = {
			color: '#000000',
		    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
		};
		params.font = getFont( params );
		var label = Ti.UI.createLabel( merge(basic, params) );
		
		return label;
	};
	
	this.makeAnimation = makeAnimation;
	
	this.openScanner = function( v ){
		var scanditsdk = require("com.mirasense.scanditsdk");
		var window = Ti.UI.createWindow({  
			title:'Scan QRcode',
			navBarHidden: true
		});
		var picker = scanditsdk.createView({
			width: Ti.UI.FILL,
			height: Ti.UI.FILL
		});
		picker.init("xKpFXhlXEeSO2ceePbErdDelCupO9KN+wZMNnAMjDQU", 0);
		picker.showSearchBar(true);
		picker.showToolBar(true);
		picker.setSuccessCallback(function(e) {
			v.callback(e);
			if (picker != null) {
				picker.stopScanning();
				window.remove(picker);
			}
			window.close();
		});
		picker.setCancelCallback(function(e) {
			if (picker != null) {
				picker.stopScanning();
				window.remove(picker);
			}
			window.close();
		});
		window.add(picker);
		window.addEventListener('open', function(e) {
			if( OS_IOS ){
	    		picker.setOrientation(Ti.UI.orientation);
			}	
			else {
				picker.setOrientation(window.orientation);
			}
			picker.setSize(Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight);
			picker.startScanning();
		});
		window.open();
	};
	
	this.group = function( v, layout ){
		var basic = {
			width: Ti.UI.SIZE,
        	height: Ti.UI.SIZE
		};
		if( layout != null ) basic.layout = layout;
		
		var group = Ti.UI.createView(basic);
		for( key in v ){
			group.add(v[key]);
			group[key] = v[key];
		}
		
		return group;
	};
	
	this.createDialog = function( params, listener ){
		if( params.title == null ) params.title = '';
		var dialog = Ti.UI.createAlertDialog(params);
		if( listener!= null ) dialog.addEventListener('click', listener);
		
		return dialog;
	};
	
	this.createInputDialog = function( params ){
		var dialog = {};
		if( params.title == null ) params.title = '';
		
		var origin;
		if( OS_ANDROID ){
			var inputView = Ti.UI.createView({ backgroundColor:'#ffffff' });
			var style = {
		        hintText: (params.hintText)? params.hintText: '',
		        height:45,
		        width: '100%',
		        color: '#000000',
		        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED
			};
			if( params.passwordMask ) style.passwordMask = true;
			
		 	dialog.androidField = Ti.UI.createTextField(style);
		    inputView.add( dialog.androidField );
			origin = Ti.UI.createOptionDialog({
	            title: params.title,
	            message: params.message,
	            androidView: inputView,
	            buttonNames: params.buttonNames
	        });
	        if( params.value ) dialog.androidField.setValue( params.value );
	   	}
	   	else{
	   		var style = {
				title: params.title,
				message: params.message,
				style: Ti.UI.iPhone.AlertDialogStyle.PLAIN_TEXT_INPUT,
				buttonNames: params.buttonNames
			};
	   		if( params.passwordMask ) style.style = Ti.UI.iPhone.AlertDialogStyle.SECURE_TEXT_INPUT;
			origin = Ti.UI.createAlertDialog(style);
		}
		dialog.origin = origin;
		
		return dialog;
	};
	
	this.createEasyInput = function( params ){
		var inputView = {};
		
		inputView.view = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			top: this.getDisplayHeight() - 1
		});
		
		var back = Ti.UI.createView({
			backgroundColor: '#ffffff',
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			top: 0,
			opacity: 0.95
		});
		inputView.view.add(back);
		
		function createButton(sign, params, callback ){
			if( sign === L('label_close') || sign === L('label_delete') ){
				font = 15;
				opacity = 0.0;
			}
			else{
				font = 25;
				opacity = 1.0;
			}
			var button = this.group({
				image: this.makeImage({
				    image: '/images/img_button_easy.png',
				    width: 60,
				    opacity: opacity
				}),
				text: this.makeLabel({
					text: sign,
					color: '#ff8200',
					font:{ fontSize: font },
				}),
			});
			button.top = params.top;
			button.left = params.left;
			
			button.addEventListener('click', function(){
				callback(sign);
			});
			
			return button;
		}
		
		var numberArray = new Array();
		var numbers = { reconfirmed: false };
		var callback = function(sign){
			if( sign === L('label_close') ){
				inputView.close();
				if( params.cancel != null ) params.cancel();
			}
			else if( sign === L('label_delete') ){
				if( numberArray.length > 0 ){
					comp_marks['m'+(numberArray.length - 1)].image = '/images/img_easyinput_none.png';
					numberArray.pop();
				}
			}
			else{
				if( numberArray.length < 4 ){
					comp_marks['m'+numberArray.length].image = '/images/img_easyinput_on.png';
					numberArray.push(sign);
					
					if( numberArray.length >= 4 ){
						var number = '';
						for(var i = 0; i < 4; i++) number += numberArray[i];
						
						function flush(){
							for(var i = 0; i < 4; i++){
								comp_marks['m'+i].image = '/images/img_easyinput_none.png';
								numberArray.pop();
							}
						}
						
						var md5 = require('crypt/md5');
						if( params.type === 'reconfirm' ){
							if( numbers.reconfirmed ){
								if( numbers.number === number ){
									params.callback(md5.MD5_hexhash(number));
									inputView.close();
								}
								else{
									flush();
								}
							}
							else{
								comp_whole.text.text = L('text_reconfirm');
								numbers.number = number;
								numbers.reconfirmed = true;
								flush();
							}
						}
						else{
							var cache = require('require/cache');
							var enc_number = md5.MD5_hexhash(number);
							if( enc_number === cache.data.easypass ){
								params.callback(enc_number);
								inputView.close();
							}
							else{
								comp_whole.text.text = L('text_wrongpass');
								flush();
							}
						}
					}
				}
			}
		};
		
		var buttons = this.group({
			b1: createButton('1', {top: 0, left: 0}, callback),
			b2: createButton('2', {top: 0, left: 70}, callback),
			b3: createButton('3', {top: 0, left: 140}, callback),
			b4: createButton('4', {top: 70, left: 0}, callback),
			b5: createButton('5', {top: 70, left: 70}, callback),
			b6: createButton('6', {top: 70, left: 140}, callback),
			b7: createButton('7', {top: 140, left: 0}, callback),
			b8: createButton('8', {top: 140, left: 70}, callback),
			b9: createButton('9', {top: 140, left: 140}, callback),
			b0: createButton('0', {top: 210, left: 70}, callback),
			bc: createButton(L('label_close'), {top: 210, left: -3}, callback),
			bd: createButton(L('label_delete'), {top: 210, left: 140}, callback)
		});
		buttons.top = 120;
		
		var logos = this.group({
			logo: this.makeImage({
			    image: '/images/icon_logo.png',
			    width: 70,
			})
		});
		logos.top = 0;
		
		var comp_marks = {
			m0: this.makeImage({
			    image: '/images/img_easyinput_none.png',
			    width: 12,
			    left: 0
			}),
			m1: this.makeImage({
			    image: '/images/img_easyinput_none.png',
			    width: 12,
			    left: 20
			}),
			m2: this.makeImage({
			    image: '/images/img_easyinput_none.png',
			    width: 12,
			    left: 40
			}),
			m3: this.makeImage({
			    image: '/images/img_easyinput_none.png',
			    width: 12,
			    left: 60
			})
		};
		var marks = this.group(comp_marks);
		marks.top = 80;
		
		var comp_whole = {
			logos: logos,
			text: this.makeLabel({
				text: L('text_inputpass'),
				color: '#ff8200',
				font:{ fontSize: 12 },
				top: 55
			}),
			marks: marks,
			buttons: buttons
		};
		var whole_view = this.group(comp_whole);
		inputView.view.add(whole_view);
		
		var inputWindow = null;
		inputView.open = function(){
			inputWindow = Ti.UI.createWindow({ orientationModes: [Ti.UI.PORTRAIT], navBarHidden: true });
			inputWindow.add(inputView.view);
			inputWindow.open();
			
			inputView.view.animate({ top: 0, duration: 500 });
		};
		
		inputView.close = function(){
			inputView.view.animate({ top: this.getDisplayHeight(), duration: 500 }, function(){
				inputWindow.close();
				inputWindow.remove(inputView.view);
				inputView = null;
			});
		};
		
		return inputView;
	};
	
	this.createCustomInput = function( params ){
		var inputView = {};
		
		inputView.view = Ti.UI.createView({
			width: Ti.UI.FILL,
			height: 220,
			bottom: -219
		});
		
		var back = Ti.UI.createView({
			backgroundColor: '#ffffff',
			width: Ti.UI.FILL,
			height: Ti.UI.FILL,
			top: 0,
			opacity: 0.95
		});
		inputView.view.add(back);
		
		function createButton(sign, params, callback ){
			if( sign === L('label_close') || sign === L('label_delete') || sign === L('label_done') ){
				font = 15;
				opacity = 0.0;
			}
			else{
				font = 25;
				opacity = 1.0;
			}
			var button = this.group({
				image: this.makeImage({
				    image: '/images/img_button_custom.png',
				    width: 70,
				    opacity: opacity
				}),
				text: this.makeLabel({
					text: sign,
					color: '#ff8200',
					font:{ fontSize: font },
				}),
			});
			button.bottom = params.bottom;
			button.left = params.left;
			
			button.addEventListener('click', function(){
				callback(sign);
			});
			
			return button;
		}
		
		var text = '';
		var callback = function(sign){
			if( sign === L('label_close') || sign === L('label_done') ){
				inputView.close();
				if( params.cancel != null ) params.cancel();
			}
			else if( sign === '×' ){
				text = text.substr(0, text.length - 1);
				params.textField.setValue(text);
			}
			else{
				if( sign === '.' ){
					if( text.length <= 0 ) text = '0.';
					else if( text.indexOf(sign) == -1 ) text += sign;
				}
				else text += sign;
				
				params.textField.setValue(text);
			}
		};
		
		var buttons = this.group({
			b1: createButton('1', {bottom: 155, left: 0}, callback),
			b2: createButton('2', {bottom: 155, left: 75}, callback),
			b3: createButton('3', {bottom: 155, left: 150}, callback),
			b4: createButton('4', {bottom: 105, left: 0}, callback),
			b5: createButton('5', {bottom: 105, left: 75}, callback),
			b6: createButton('6', {bottom: 105, left: 150}, callback),
			b7: createButton('7', {bottom: 55, left: 0}, callback),
			b8: createButton('8', {bottom: 55, left: 75}, callback),
			b9: createButton('9', {bottom: 55, left: 150}, callback),
			b0: createButton('0', {bottom: 5, left: 75}, callback),
			bd: createButton('×', {bottom: 5, left: 0}, callback),
			be: createButton('.', {bottom: 5, left: 150}, callback),
			bc: createButton(L('label_done'), {bottom: 5, left: 225}, callback)
		});
		buttons.left = 5;
		
		inputView.view.add(buttons);
		
		inputView.open = function(){
			inputView.view.animate({ bottom: 0, duration: 500 });
		};
		
		inputView.close = function(){
			inputView.view.animate({ top: this.getDisplayHeight(), duration: 500 }, function(){ inputView = null; });
		};
		
		return inputView;
	};
	
	this.showLoading = function(parent,  params ){
		params.font = getFont( params );
		if( params.width == Ti.UI.FILL && params.height == Ti.UI.FILL ){
			params.backgroundColor = '#ffffff';
			params.opacity = 0.7;
			params.style = 'dark';
		}
		if( OS_IOS ){
			var style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
			if( params.style != null ){
				if( params.style === 'dark' ) style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
			}
			params.style = style;
		}
		if( OS_ANDROID ) delete params['style'];
		
		var act = Ti.UI.createActivityIndicator( params );
		if( OS_ANDROID ){
			if( params.message ) act.setMessage(params.message);
		}
		act.show();
		
		parent.add(act);
		
		act.removeSelf = function(){
			parent.remove(act);
			act = null;
		};
		
		return act;
	};
	
	this.readQRcode = function( params ){
		this.openScanner({
			'callback': function(e){
				var matches = e.barcode.match(/[a-zA-Z0-9]{27,34}/);
				
				var vals = {};
				vals.address = ( matches != null )?matches[0]: null;
				
				if( e.barcode.indexOf('&') >= 0 ){
					vals.options = {};
					
					var args = e.barcode.split('&');
					for( var i = 1; i < args.length; i++ ){
						var a = args[i].split('=');
						vals.options[a[0]] = a[1];
					}
				}
				
				params.callback(vals);
			}
		});
	};
	
	this.createSlider = function( params ){
		var slider = {};
		
		slider.is = params.init || false;
		slider.editable = params.editable || true;
		slider.origin = Ti.UI.createView({
			borderRadius: 2,
			backgroundColor: params.init ? '#ff8200': '#666666',
			width: 60,
			height: 25
		});
		
		var swit = this.makeImage({
		    image: '/images/settings_slider.png',
		    height: 22.5,
		    width: 64.2
		});
		swit.left = (!params.init)? -18.6 : 16;
		
		slider.origin.add(swit);
		slider.origin.addEventListener('click', function(){
			if( slider.editable ){
				if( slider.is ){
					if( OS_ANDROID ) slider.origin.backgroundColor = '#666666';
					else slider.origin.animate({ backgroundColor: '#666666', duration: 500 });
					
					swit.animate({ left: -18.6, duration: 300}, params.off);
					slider.is = false;
				}
				else{
					if( OS_ANDROID ) slider.origin.backgroundColor = '#ff8200';
					else slider.origin.animate({ backgroundColor: '#ff8200', duration: 500 });
					swit.animate({ left: 16, duration: 300}, params.on);
					slider.is = true;
				}
			}
		});
		
		slider.on = function(){
			slider.is = true;
			swit.left = 16;
			slider.origin.backgroundColor = '#ff8200';
		};
		
		slider.off = function(){
			slider.is = false;
			swit.left = -18.6;
			slider.origin.backgroundColor = '#666666';
		};
		
		return slider;
	};
	
	this.getStatusBarHeight = function(){
		switch ( Ti.Platform.displayCaps.density ) {
			case 160:
			    return 25;
			case 120:
			    return 19;
			case 240:
			    return 38;
			case 320:
			    return 50;
			default:
			    return 25;
		}
	};
	
	this.getDisplayHeight = function(){
		if( OS_ANDROID ){
			return (Ti.Platform.displayCaps.platformHeight / Ti.Platform.displayCaps.logicalDensityFactor) - this.getStatusBarHeight();
		}
		return Ti.Platform.displayCaps.platformHeight;
	};
	
	this.getDisplayWidth = function(){
		if( OS_ANDROID ){
			return (Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor);
		}
		return Ti.Platform.displayCaps.platformWidth;
	};
	
	this.convert_x = function(val){
		return (OS_ANDROID)? (val / Ti.Platform.displayCaps.logicalDensityFactor): val;
	};
	
	this.convert_y = function(val){
		return (OS_ANDROID)? (val / Ti.Platform.displayCaps.logicalDensityFactor): val;
	};
	
	this.isTestAccount = function(){
		return (globals.datas.identifier === 'test' && globals.datas.password === 'test');
	};
	
	this.createTableList = function(params){
		var tableview = Ti.UI.createTableView(params);
		
		tableview.setRowDesign = function(data, func){
			function createRow( key, val ){
				var row = Ti.UI.createTableViewRow({ height: (params.rowHeight != null)? params.rowHeight: 30 });
				return func(row, val);
			}
			var table_data = [];
			for( key in data ){
				var row = createRow( key, data[key] );
				if( row != null ){
					row.data = data[key];
					table_data.push(row);
				}
			}
			tableview.setData( table_data );
		};
		
		tableview.addRowDesign = function(data, func){
			function createRow( key, val ){
				var row = Ti.UI.createTableViewRow({ height: (params.rowHeight != null)? params.rowHeight: 30 });
				return func(row, val);
			}
			for( key in data ){
				var row = createRow( key, data[key] );
				if( row != null ){
					row.data = data[key];
					tableview.appendRow(row);
				}
			}
		};
		
		return tableview;
	};
	
	this.createAutocompleteField = function( params ){
		var basic = {
			color: '#333333',
			hintText: L('label_search'),
			borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			width: 150, height: 35,
			bottom: 0
		};
		var textField = this.makeTextField( merge(basic, params) );
		var last_search = null;
		var timer = null;
		
		var autocomplete_view = null;
		textField.addEventListener('change', function(e){
			clearTimeout(timer);
			if(e.value.length >= ((params.over != null)? params.over: 2) && e.value != last_search){
				timer = setTimeout(function(){ auto_complete(e.value); }, 500);
			}
			else{
				if( autocomplete_view != null ) params.parent.remove(autocomplete_view);
			}
			return false;
		});
		textField.addEventListener('blur', function(e){
			if( autocomplete_view != null ) params.parent.remove(autocomplete_view);
		});
		
		function createAutoCompleteView(){
			if( autocomplete_view != null ) params.parent.remove(autocomplete_view);
			
			var a = textField.parent.convertPointToView({
				x: textField.rect.x,
				y: textField.rect.y
			}, params.parent);
			
			view = Ti.UI.createTableView({
				backgroundColor: '#ffffff',
				width: textField.width, height: 100,
				left: this.convert_x(a.x),
				top: this.convert_y(a.y) + ((OS_ANDROID)? 0: params.parent.contentOffset.y) - 100
			});
			view.addEventListener('click', function(e){
				textField.value = last_search = e.row.children[0].text;
				textField.blur();
				if( autocomplete_view != null ) params.parent.remove(autocomplete_view);
				params.callback(e.row.children[0].text);
			});
			
			return view;
		}
		
		var network = require('require/network');
		function auto_complete( text ){
			if( text.length > 0 ){
				function apply( result ){
					function createRow( d ){
						var row = Ti.UI.createTableViewRow({ height: 30 });
						var text = this.makeLabel({
							text: result[i],
							top: 5,
							font:{ fontSize: 15 }
						});
						row.add(text);
						
						return row;
					}
					var data = [];
					for( var i = 0; i < result.length; i++ ){
						var row = createRow( result[i] );
						data.push(row);
					}
					autocomplete_view = createAutoCompleteView();
					autocomplete_view.setData( data );
					params.parent.add(autocomplete_view);
				}
				if( typeof params.method === 'function' ){
					apply( params.method(text) );
				}
				else if( params.method != null ){
					network.connect({
						'method': params.method,
						'post': {
							keyword: text
						},
						'callback': function(result){
							if( params.getResult != null ) params.getResult(result);
							else apply(result);
						},
						'onError': function(error){
							alert(error);
						}
					});
				}
			}
		}
		return textField;
	};
	
	this.createUpScreen = function( params ){
		var layer = require('require/layer');
		var menu = {};
		
		menu.origin = Ti.UI.createView({ top: -100, width: Ti.UI.SIZE, height: Ti.UI.SIZE, opacity: 0.0 });
		
		var menuLayer = null, menuBack = null, whole_menuView = null;
		menu.close = function(){
			menuBack.animate({ opacity: 0.0, duration: 100 });
			whole_menuView.animate({ bottom: -params.height, duration: 500 }, function(){
				if( layer != null ) layer.removeLayer(params.win, menuLayer);
				menuLayer = null;
				menu.isVisible = false;
				menu.origin.fireEvent('close');
			});
			if( params.close != null ) params.close(menuLayer);
		};
		
		menu.open = function(){
			menu.origin.fireEvent('open');
			menuLayer = layer.newLayer(params.win.origin);
			menuBack = Ti.UI.createView({
				width: Ti.UI.FILL,
				height: Ti.UI.FILL,
				backgroundColor: '#ffc07f',
				opacity: 0.0,
			});
			menuLayer.add(menuBack);
			menuBack.addEventListener('click', function(e){
				menu.close();
			});
			
			whole_menuView = Ti.UI[(OS_ANDROID)?'createView':'createScrollView']({
				width: params.width || '100%',
				height: params.height,
				backgroundColor: params.backgroundColor || '#ffffff',
				bottom: -params.height
			});
			menuLayer.add(whole_menuView);
			if( params.right ) whole_menuView.right = params.right;
			if( params.left ) whole_menuView.left = params.left;
			
			params.open(whole_menuView, menuLayer);
			
			menuBack.animate({ opacity: 0.5, duration: 100 });
			whole_menuView.animate({ bottom: 0, duration: 500 });
			
			menu.isVisible = true;
		};
		
		return menu;
	};
	
	return this;
}());