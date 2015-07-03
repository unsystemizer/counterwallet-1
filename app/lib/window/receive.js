exports.run = function(){
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: true });
	
	var address = _requires['cache'].data.address;
	var scheme = 'cwallet://address='+address;
	
	var text_title = _requires['util'].group({
		title: _requires['util'].makeLabel({
			text: L('label_bitcoinaddress'),
			top: 0,
			font:{ fontSize: 12 }
		}),
		address: _requires['util'].makeLabel({
			text: address,
			top: 20,
			font:{ fontSize: 12 }
		})
	});
	text_title.top = 0;
	
	function showQRcode( qr_data ){
		var view_qr = _requires['util'].group({
			'img_qrcode': _requires['util'].makeImageButton({
			    image: qr_data,
			    width: 250,
			    left: 0,
			    top: 20,
			    listener: function(){
					Ti.UI.Clipboard.setText( address );
					_requires['util'].createDialog({
						title: L('text_copied'),
						message: L('text_copied_message'),
						buttonNames: [L('label_close')]
					}).show();
				}
			}),
			title: text_title,
			line: _requires['util'].makeImageButton({
			    image: '/images/icon_line.png',
			    width: 60,
			    left: 230,
			    top: 50,
			    listener: function(){
			    	_requires['util'].createDialog(
						{
							title: L('text_use_line'),
							cancel: 1,
							buttonNames: [L('label_cancel'), L('label_ok')]
						},
						function(e){
							if( e.index == 1 ){
								var scheme_line = 'line://msg/text/' + scheme;
						    	var uri_line = globals.uri_line + scheme;
						    	if( OS_ANDROID ){
						    		if( !Ti.Platform.openURL(scheme_line) ) Ti.Platform.openURL(uri_line);
						    	}
						    	else{
							        if( Ti.Platform.canOpenURL(scheme_line) ) Ti.Platform.openURL(scheme_line);
							        else Ti.Platform.openURL(uri_line);
								}
							}
						}
					).show();
			    }
			}),
			mail: _requires['util'].makeImageButton({
			    image: '/images/icon_mail.png',
			    width: 60,
			    left: 230,
			    top: 115,
			    listener: function(){
			    	_requires['util'].createDialog(
						{
							title: L('text_use_mail'),
							cancel: 1,
							buttonNames: [L('label_cancel'), L('label_ok')]
						},
						function(e){
							if( e.index == 1 ){
								var emailDialog = Ti.UI.createEmailDialog();
						    	emailDialog.setMessageBody(scheme);
								emailDialog.setSubject(L('label_bitcoinaddress'));
								emailDialog.open();
							}
						}
					).show();
			    }
			}),
			clipboard: _requires['util'].makeImageButton({
			    image: '/images/icon_clipboard.png',
			    width: 60,
			    left: 230,
			    top: 180,
			    listener: function(){
			    	Ti.UI.Clipboard.setText( address );
					_requires['util'].createDialog({
						title: L('text_copied'),
						message: L('text_copied_message'),
						buttonNames: [L('label_close')]
					}).show();
			    }
			})
		});
		frame.view.add(view_qr);
	}
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'qr_address.png');
	if( !_requires['cache'].data.qrcode ){
		_requires['network'].connect({
			'method': 'getQRcode',
			'binary': true,
			'post': {
				id: _requires['cache'].data.id
			},
			'callback': function( result ){
				_requires['cache'].data.qrcode = true;
				_requires['cache'].save();
				
				f.write( result );
				showQRcode(f);
			},
			'onError': function( error ){
				alert(error);
			}
		});
	}
	else showQRcode(f);
	
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	
	return win.origin;
};