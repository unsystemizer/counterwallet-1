exports.run = function(){
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: true, callback: function(){
		if( current_currency !== _requires['cache'].data.currncy ){
			is_save = true;
			globals.loadBalance();
		}
		if( is_save ) _requires['cache'].save();
	}});
	
	var info = globals.datas;
	var view = _requires['util'].group(null, 'vertical');
	frame.view.add(view);
	
	var is_save = false;
	
	function createDescBox(){
		var box = _requires['util'].group();
		box.width = '95%';
		
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
		box.width = '95%';
		box.backgroundColor = '#ffc07f';
		
		return box;
	}
	
	var box_user_name = createBox({ icon: 'icon_noimage.png', height: 80 });
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
					_requires['auth'].check(win, { title: L('text_confirmsend'), callback: function(e){
						if( e.success ){
							var loading = _requires['util'].showLoading(box_user_name, { width: Ti.UI.FILL, height: Ti.UI.FILL});
							_requires['network'].connect({
								'method': 'dbUpdate',
								'post': {
									id: _requires['cache'].data.id,
									type: 'user_name',
									value: inputText
								},
								'callback': function( result ){
									globals.user_name_top.text = label_user_name.text = globals.user_name = result.value;
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
					easy_box_hide();
					is_save = true;
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
						_requires['cache'].data.isTouchId = null;
						easy_box_show();
						is_save = true;
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
		
		var box_desc_touchid = createDescBox();
		box_desc_touchid.top = 3;
		var label_desc_touchid = _requires['util'].makeLabel({
			text: L('text_desc_fingerprint'),
			font:{ fontSize: 10 },
			textAlign: 'left',
			left: 0
		});
		box_desc_touchid.add(label_desc_touchid);
		view.add(box_desc_touchid);
	}
	
	var box_easypass = createBox({ icon: 'icon_settings_easypass.png', height: 50, arrow: false });
	box_easypass.top = 10;
	
	var label_easypass = _requires['util'].makeLabel({
		text: L('label_easypass'),
		font:{ fontSize: 14 },
		left: 60
	});
	box_easypass.add(label_easypass);
	
	var slider = _requires['util'].createSlider({
		init: (info.easypass != null)? true: false,
		on: function(){
			function setEasyPass( secound_password ){
	  			var easyInput = _requires['util'].createEasyInput({
					win: win.origin,
					type: 'reconfirm',
					callback: function( number ){
						_requires['cache'].data.easypass = number;
						is_save = true;
					},
					cancel: function(){
						if( slider.is ) slider.off();
						else slider.on();
					}
				});
				easyInput.open();
			}
			
			_requires['auth'].check(win, { title: L('label_easypass'), callback: function(e){
				if( e.success ) setEasyPass();
				else{
					if( slider.is ) slider.off();
					else slider.on();
				}
			}});
		},
		off: function(){
			_requires['auth'].check(win, { callback: function(e){
				if( e.success ){
					_requires['cache'].data.easypass = null;
					is_save = true;
				}
				else{
					if( slider.is ) slider.off();
					else slider.on();
				}
			}});
		}
	});
	slider.origin.right = 10;
	box_easypass.add(slider.origin);
	view.add(box_easypass);
	
	var box_desc_easypass = createDescBox();
	box_desc_easypass.top = 3;
	var label_desc_easypass = _requires['util'].makeLabel({
		text: L('text_desc_easypass'),
		font:{ fontSize: 10 },
		textAlign: 'left',
		left: 0
	});
	box_desc_easypass.add(label_desc_easypass);
	view.add(box_desc_easypass);
	
	var box_hidden = Ti.UI.createView({ backgroundColor: '#ffc07f', opacity: 0.8, width: Ti.UI.FILL, height: Ti.UI.FILL });
	function easy_box_hide(){
		box_desc_easypass.setOpacity(0.3);
		box_easypass.add(box_hidden);
	}
	function easy_box_show(){
		box_desc_easypass.setOpacity(1.0);
		box_easypass.remove(box_hidden);
	}
	if( _requires['cache'].data.isTouchId != null ) easy_box_hide();
	
	var box_identifier = createBox({ icon: 'icon_settings_identifier.png', height: 50 });
	box_identifier.top = 20;
	view.add(box_identifier);
	
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
	
	var box_currency = createBox({ icon: 'icon_settings_currency.png', height: 50 });
	box_currency.top = 20;
	view.add(box_currency);
	
	var current_currency = _requires['cache'].data.currncy;
	var label_current = _requires['util'].makeLabel({
		text: current_currency,
		font:{ fontSize: 15 },
		left: 60
	});
	box_currency.add(label_current);
	
	var picker = null;
	box_currency.addEventListener('click', function(){
		var data = []; var tikers = globals.tiker;
		data.push( Ti.UI.createPickerRow( { 'title': _requires['cache'].data.currncy } ));
		if( OS_IOS ){
			if( picker == null ){
				picker = Ti.UI.createPicker({ width: 150, left: 60, backgroundColor: 'transparent' });
				for( key in tikers ){
					if( key !== 'XCP' && key !== _requires['cache'].data.currncy ) data.push( Ti.UI.createPickerRow( { 'title': key } ));
				}
				picker.add(data);
				
				picker.addEventListener('change',function(e){
					label_current.text = _requires['cache'].data.currncy = e.selectedValue[0];
				});
				box_currency.add(picker);
			}
			else{
				box_currency.remove(picker);
				picker = null;
			}
		}
		else{
			data.push( L('label_cancel') );
			for( key in tikers ){
				if( key !== 'XCP' && key !== _requires['cache'].data.currncy ) data.push( key );
			}
			
			var dialog = Ti.UI.createOptionDialog();
			dialog.setOptions(data);
			dialog.setCancel(1);
			dialog.addEventListener('click',function(e){
				if(e.index >= 2) label_current.text = _requires['cache'].data.currncy = data[e.index];
			});
			dialog.show();
		}
	});
	if( _requires['cache'].data.isTouchId ) easy_box_hide();
	
	var box_passphrase = createBox({ icon: 'icon_settings_password.png', height: 50 });
	box_passphrase.top = 20;
	view.add(box_passphrase);
	
	var passphrase_group = _requires['util'].group();
	var label_passphrase = _requires['util'].makeLabel({
		text: '- - - - - - - - - - - -',
		font:{ fontSize: 12 },
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
				var dialog2 = _requires['util'].createDialog({
					title: 'Passphrase',
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
			}
		});
		dialog.show();
	});
	
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	return win.origin;
};