var theWindow =  Ti.UI.createWindow({
	title:L('label_tab_settings'),
	backgroundColor:'#ececec',
	orientationModes: [Ti.UI.PORTRAIT],
	navBarHidden: true
});
if( OS_IOS ) theWindow.statusBarStyle = Ti.UI.iPhone.StatusBar.LIGHT_CONTENT;

exports.run = function(){

	var _windows = globals.windows;
    var _requires = globals.requires;
    var currenciesArray = [];
    var main_view = Ti.UI.createScrollView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	main_view.top = 15;
	theWindow.add(main_view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 55 });
	top_bar.top = 0;
	theWindow.add(top_bar);
	
	var settings_title_center = _requires['util'].makeLabel({
		text:L('label_tab_settings'),
		color:"white",
		font:{ fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 25, center: 0
	});
	top_bar.add( settings_title_center );
	
	var view = _requires['util'].group(null, 'vertical');
	main_view.add(view);
	
	var info = globals.datas;
	
	function createDescBox(text){
		var box = _requires['util'].group();
		box.width = '95%';
		box.top = 3;
		box.left = 5;
		
		var label = _requires['util'].makeLabel({
			text: text,
			color: '#999999',
			font:{ fontSize: 10 },
			textAlign: 'left',
			left: 0
		});
		box.add(label);
		
		return box;
	}
	function createBox( params ){
		var box = _requires['util'].group({
			icon: _requires['util'].makeImage({
			    image: '/images/'+params.icon,
			    height: 40,
			    left: 6
			})
		});
		
		if( params.arrow == null || params.arrow == true ){
			box.add( _requires['util'].makeImage({
			    image: '/images/img_settings_arrow.png',
			    height: 15,
			    right: 20
			}));
		}
		
		box.height = params.height;
		box.width = '100%';
		box.backgroundColor = 'white';
		
		return box;
	}
	
	function createMailDialog(){
		var emailDialog = Ti.UI.createEmailDialog();
		emailDialog.subject = 'To Support.';
		emailDialog.toRecipients = ['support@indiesquare.me'];
		emailDialog.messageBody = L('label_mail_desc') + '\n\n\<' + L('label_mail_name') + '\>\n\<' + L('label_mail_device') + '\>\n\<' + L('label_mail_id') + '\>' + _requires['cache'].data.id + '\n\<' + L('label_mail_os') + '\>' + Ti.Platform.name + ' ' + Ti.Platform.version + '\n\<' + L('label_mail_happens') + '\>';
		emailDialog.open();
	}
	
	var section = _requires['util'].makeLabel({
		text: L('text_section_basic'),
		font:{ fontSize: 13 },
		top: 50
	});
	view.add(section);
	
	var box_user_name = createBox({ icon: 'icon_noimage.png', height: 40 });
	box_user_name.top = 10;
	var label_user_name = _requires['util'].makeLabel({
		text: globals.user_name || L('text_noregisted'),
		font:{ fontSize: 15 },
		left: 60
	});
	
	box_user_name.add(label_user_name);
	box_user_name.addEventListener('click', function(){
		var dialog = _requires['util'].createInputDialog({
			title: L('label_rename'),
			message: L('text_rename'),
			value: ( label_user_name.text != null )? label_user_name.text: '',
			buttonNames: [L('label_close'), L('label_ok')]
		});
		dialog.origin.addEventListener('click', function(e){
			var inputText = (OS_ANDROID)?dialog.androidField.getValue():e.text;
			if( e.index == 1 ){
				if( inputText.length > 0 && inputText !== info.user_name ){
					_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
						if( e.success ){
							var loading = _requires['util'].showLoading(box_user_name, { width: Ti.UI.FILL, height: Ti.UI.FILL});
							_requires['network'].connect({
								'method': 'dbupdate',
								'post': {
									id: _requires['cache'].data.id,
									updates: JSON.stringify( [
										{ column: 'username', value: inputText }
									])
								},
								'callback': function( result ){
									label_user_name.text = globals.user_name = inputText;
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
			}
		});
		dialog.origin.show();
	});
	view.add(box_user_name);
	view.add(createDescBox(L('text_desc_username')));
	
	var display_height = _requires['util'].getDisplayHeight();
	
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
	var picker_toolbar = Ti.UI.createView({
		width: '100%',
		height: (OS_ANDROID)? 50: 40,
		backgroundColor: '#e54353'
	});
	picker_toolbar.add(close);
	
	var currencies = _requires['util'].createTableList({
		backgroundColor: 'white',
		width: '100%', height: 350,
		top:0,
		rowHeight: 50
	});
	currencies.addEventListener('click', setCurrency);
	var picker1 = _requires['util'].group({
		"toolbar": picker_toolbar,
		"picker": currencies
	}, 'vertical');
	if(OS_ANDROID) picker1.top = display_height;
	else picker1.bottom = -390;
	
	close.addEventListener('click',function() {
		picker1.animate(slide_out);
	});
	
	theWindow.add(picker1);
	
	function addCurrencies() {
		var tikers = globals.tiker;
		currenciesArray = [];
		Titanium.API.log(tikers);
		currencies.setRowDesign(tikers, function(row, val) { //why is key visible here?
			if( key !== 'XCP' ) {
				currenciesArray.push(key);
			var label = Ti.UI.createLabel({
				text : key,
				font : {
					fontFamily : 'HelveticaNeue-Light',
					fontSize : 20,
					fontWeight : 'normal'
				},
				color : 'black',
				width : 'auto',
				height : 'auto',
				left :10
			});
			row.add(label);
			return row;
			}
		});
	};
	
	addCurrencies();
	var slide_in;
	var slide_out;
	if( OS_ANDROID ){
		slide_in = Ti.UI.createAnimation({top: display_height - 400, duration:200});
		slide_out = Ti.UI.createAnimation({top: display_height, duration:200});
	}
	else {
		slide_in = Ti.UI.createAnimation({bottom: 0, duration:200});
		slide_out = Ti.UI.createAnimation({bottom: -390, duration:200});
	}

	var box_currency = createBox({ icon: 'icon_settings_currency.png', height: 45 });
	box_currency.top = 10;
	view.add(box_currency);
	view.add(createDescBox(L('text_desc_fiat')));
	
	var current_currency = _requires['cache'].data.currncy;
	var label_current = _requires['util'].makeLabel({
		text: current_currency,
		font:{ fontSize: 15 },
		left: 60
	});
	box_currency.add(label_current);

	box_currency.addEventListener('click', function(){
		addCurrencies();
		picker1.animate(slide_in);
	
	});
	
	function setCurrency(e) {
		var selected_currency = currenciesArray[e.index];
		Titanium.API.log(selected_currency);
		label_current.text = _requires['cache'].data.currncy = selected_currency;
		globals.loadBalance();
		if( globals.getOrders != null ) globals.getOrders();
		_requires['cache'].save();
		picker1.animate(slide_out);
	}
	var box_passphrase = createBox({ icon: 'icon_settings_password.png', height: 45 });
	box_passphrase.top = 10;
	view.add(box_passphrase);
	view.add(createDescBox(L('text_desc_passphrase')));
	
	var passphrase_group = _requires['util'].group();
	var label_passphrase = _requires['util'].makeLabel({
		text: L('label_passphrase'),
		font:{ fontSize: 14 },
		textAlign: 'left', left: 0
	});
	passphrase_group.left = 60;
	passphrase_group.width = '60%';
	passphrase_group.add(label_passphrase);
	
	box_passphrase.add(passphrase_group);
	box_passphrase.addEventListener('click', function(){
		var dialog = _requires['util'].createDialog({
			title: 'Passphrase',
			message: L('text_passphrase_q'),
			buttonNames: [L('label_close'), L('label_show')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index == 1 ){
				_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
					if( e.success ){
						var time = (OS_ANDROID)? 1000: 1;
						setTimeout(function(){
							var dialog2 = _requires['util'].createDialog({
								title: L('label_passphrase'),
								message: _requires['cache'].data.passphrase,
								buttonNames: [L('label_close'), L('label_copy')]
							});
							dialog2.addEventListener('click', function(e){
								if( e.index == 1 ){
									Ti.UI.Clipboard.setText( _requires['cache'].data.passphrase );
									_requires['util'].createDialog({
										title: L('label_copied'),
										message: L('text_copied'),
										buttonNames: [L('label_close')]
									}).show();
								}
							});
							dialog2.show();
						}, time);
					}
				}});
			}
		});
		dialog.show();
	});
	
	if( OS_IOS ){
		var box_touchid = createBox({ icon: 'icon_settings_touchid.png', height: 50, arrow: false });
		box_touchid.top = 10;
		
		var label_touchid = _requires['util'].makeLabel({
			text: L('label_fingerprint'),
			font:{ fontSize: 14 },
			left: 60
		});
		box_touchid.add(label_touchid);
		
		var t_slider = _requires['util'].createSlider({
			init: (_requires['cache'].data.isTouchId != null)? true: false,
			on: function(){
				function conn(){
					_requires['cache'].data.isTouchId = true;
					_requires['cache'].data.easypass = null;
					_requires['cache'].save();
				}
				_requires['auth'].useTouchID({ callback: function(e){
					if( e.success ) conn();
					else{
						_requires['util'].createDialog({
							title: L('label_adminerror'),
							message: L('text_adminerror'),
							buttonNames: [L('label_close')]
						}).show();
						if( t_slider.is ) t_slider.off();
						else t_slider.on();
					}
				}});
			},
			off: function(){
				_requires['auth'].useTouchID({ callback: function(e){
					if( e.success ){
						var easyInput = _requires['util'].createEasyInput({
							win: theWindow.origin,
							type: 'reconfirm',
							callback: function( number ){
								_requires['cache'].data.easypass = number;
								_requires['cache'].data.isTouchId = null;
								_requires['cache'].save();
							},
							cancel: function(){
								if( slider.is ) slider.off();
								else slider.on();
							}
						});
						easyInput.open();
					}
					else{
						if( t_slider.is ) t_slider.off();
						else t_slider.on();
					}
				}});
			}
		});
		t_slider.origin.right = 10;
		box_touchid.add(t_slider.origin);
		view.add(box_touchid);
		
		view.add(createDescBox(L('text_desc_fingerprint')));
	}
	
	var box_review = createBox({ icon: 'icon_settings_review.png', height: 45 });
	box_review.top = 10;
	var label_review = _requires['util'].makeLabel({
		text: L('label_review'),
		font:{ fontSize: 14 },
		left: 60
	});
	box_review.add(label_review);
	view.add(box_review);
	view.add(createDescBox(L('text_desc_review')));
	box_review.addEventListener('click', function(){
		
		var dialog = _requires['util'].createDialog({
			title: L('text_support_title'),
			message: L('text_support'),
			buttonNames: [L('text_support_yes'), L('text_support_no'), L('text_review_no')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index == 0 ) createMailDialog();
			else if( e.index == 1 ){
				var dialog2 = _requires['util'].createDialog({
					title: L('text_review_title'),
					message: L('text_review'),
					buttonNames: [L('text_review_yes'), L('text_review_no')]
				});
				dialog2.addEventListener('click', function(e){
					if( e.index == 0 ){
						var url = (OS_IOS)? 'itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?type=Purple+Software&id=977972108': 'market://details?id=inc.lireneosoft.counterparty';
						Ti.Platform.openURL(url);
					}
				});
				dialog2.show();
			}
		});
		dialog.show();
	});
	
	var section = _requires['util'].makeLabel({
		text: L('text_section_account'),
		font:{ fontSize: 13 },
		top: 20
	});
	view.add(section);
	
	var box_identifier = createBox({ icon: 'icon_settings_identifier.png', height: 50 });
	box_identifier.top = 15;
	view.add(box_identifier);
	view.add(createDescBox(L('text_desc_identifier')));
	
	var identifier_group = _requires['util'].group();
	var label_identifier = _requires['util'].makeLabel({
		text: _requires['cache'].data.id,
		font:{ fontSize: 12 },
		textAlign: 'left', left: 0
	});
	identifier_group.left = 60;
	identifier_group.width = '60%';
	identifier_group.add(label_identifier);
	
	box_identifier.add(identifier_group);
	box_identifier.addEventListener('click', function(){
		var dialog = _requires['util'].createDialog({
			title: 'Identifier',
			message: L('text_identifier'),
			buttonNames: [L('label_close'), L('label_copy')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index == 1 ){
				Ti.UI.Clipboard.setText( _requires['cache'].data.id );
				_requires['util'].createDialog({
					title: L('label_copied'),
					message: L('text_copied'),
					buttonNames: [L('label_close')]
				}).show();
			}
		});
		dialog.show();
	});
	
	var box_password = createBox({ icon: 'icon_settings_easypass.png', height: 45 });
	box_password.top = 10;
	view.add(box_password);
	view.add(createDescBox(L('text_desc_password')));
	
	var password_group = _requires['util'].group();
	var label_password = _requires['util'].makeLabel({
		text: L('label_password'),
		font:{ fontSize: 14 },
		textAlign: 'left', left: 0
	});
	password_group.left = 60;
	password_group.width = '60%';
	password_group.add(label_password);
	
	box_password.add(password_group);
	box_password.addEventListener('click', function(){
		var dialog = _requires['util'].createDialog({
			title: L('label_password'),
			message: L('text_password_q'),
			buttonNames: [L('label_close'), L('label_show')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index == 1 ){
				_requires['auth'].check({ title: L('text_confirmsend'), callback: function(e){
					if( e.success ){
						var time = (OS_ANDROID)? 1000: 1;
						setTimeout(function(){
							var dialog2 = _requires['util'].createDialog({
								title: L('label_password'),
								message: _requires['cache'].data.password,
								buttonNames: [L('label_close'), L('label_copy')]
							});
							dialog2.addEventListener('click', function(e){
								if( e.index == 1 ){
									Ti.UI.Clipboard.setText( _requires['cache'].data.password );
									_requires['util'].createDialog({
										title: L('label_copied'),
										message: L('text_copied'),
										buttonNames: [L('label_close')]
									}).show();
								}
							});
							dialog2.show();
						}, time);
					}
				}});
			}
		});
		dialog.show();
	});
	
	var box_linkage = createBox({ icon: 'icon_settings_linkage.png', height: 45 });
	box_linkage.top = 10;
	var label_linkage = _requires['util'].makeLabel({
		text: L('label_linkage'),
		font:{ fontSize: 14 },
		left: 60
	});
	box_linkage.add( label_linkage );
	view.add( box_linkage );
	view.add(createDescBox(L('text_desc_linkage')));
	
	box_linkage.addEventListener('click', function(){
		
		_requires['util'].openScanner({
			'callback': function(e){
				var str = e.barcode;
				globals._parseArguments(str, true);
			}
		});
		
	});
	
	var section = _requires['util'].makeLabel({
		text: L('text_section_other'),
		font:{ fontSize: 13 },
		top: 20
	});
	view.add(section);
	
	var box_about = createBox({ icon: 'icon_settings_about.png', height: 45 });
	box_about.top = 10;
	var label_about = _requires['util'].makeLabel({
			text: L('label_about'),
			font:{ fontSize: 14 },
			left: 60
		});
		box_about.add(label_about);
	view.add(box_about);
	box_about.addEventListener('click', function(){
	
		var dialog = _requires['util'].createDialog({
			title: L('appname'),
			message: 'ver' + Ti.App.version + '\n\n' + globals.copyright + ((Alloy.CFG.isDevelopment)? '\nDevelopment':''),
			buttonNames: [L('label_close')]
		}).show();
	
	});
	
	var box_support = createBox({ icon: 'icon_settings_support.png', height: 45 });
	box_support.top = 10;
	var label_support = _requires['util'].makeLabel({
		text: L('label_support'),
		font:{ fontSize: 14 },
		left: 60
	});
	box_support.add(label_support);
	view.add(box_support);
	box_support.addEventListener('click', function(){
		
		var dialog = _requires['util'].createDialog({
			title: L('text_support_title'),
			message: L('text_support'),
			buttonNames: [L('text_support_yes'), L('text_review_no')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index == 0 ) createMailDialog();
		});
		dialog.show();
	});
	
	var box_signout = createBox({ icon: 'icon_settings_signout.png', height: 45 });
	box_signout.top = 10;
	var label_signout = _requires['util'].makeLabel({
		text: L('label_signout'),
		font:{ fontSize: 14 },
		left: 60
	});
	box_signout.add(label_signout);
	view.add(box_signout);
	box_signout.addEventListener('click', function(){
		
		var dialog = _requires['util'].createDialog({
			title: L('label_signout'),
			message: L('text_signout'),
			buttonNames: [L('label_cancel'), L('label_ok')]
		});
		dialog.addEventListener('click', function(e){
			if( e.index == 1 ){
				_requires['cache'].init();
				_requires['cache'].load();
				globals.tabGroup.closeAllTab();
				if( globals.timer_shapshiftupdate != null ) clearInterval(globals.timer_shapshiftupdate);
				_windows['login'].run();
			}
		});
		dialog.show();
	});
	
	Ti.API.settingsLoad = 'YES';
};
Ti.API.settings_win = theWindow;