module.exports.run = function(){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var main_view = Ti.UI.createView({ width: Ti.UI.FILL, height: Ti.UI.FILL });
	win.origin.add( main_view );
	
	var crypt = require('crypt/api');
	var rsa_info = globals.requires['cache'].load_rsa();
	
	var password = '';
	for (var i = 0; i < 12; i++){
		var random = Math.random() * 16 | 0;
		password += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
	}
	
	var view = Ti.UI.createScrollView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL,
		scrollType: 'vertical',
		backgroundColor:'#e54353'
	});
	main_view.add(view);
	
	function createBox(){
		var box = _requires['util'].group();
		box.height = 35;
		box.width = 250;
		box.backgroundColor = '#e54353';
		
		return box;
	}
	
	var logo = _requires['util'].makeImage({
	    image: '/images/icon_logo_white.png',
	    width: 150,
	    top: 0
	});
	
	var newwallet = _requires['util'].group({
		'label': _requires['util'].makeLabel({
		    text: L('label_newwallet'),
		    font:{ fontSize: 25 },
		    color: '#ffffff'
		})
	});
	newwallet.addEventListener('touchstart', function(){
		whole_group.opacity = policy.opacity = 0.0;
		if(OS_ANDROID) view.remove( policy );
		
		icon_drawing.opacity = draw_leftup.opacity = draw_rightdown.opacity = 0.5;
		progress.opacity = back_button.opacity = 1.0;
		view.addEventListener('touchmove', touchEvent);
	});
	newwallet.top = 50;
	newwallet.height = 50;
	newwallet.width = '90%';
	newwallet.backgroundColor = '#E45C61';
	
	var signin = _requires['util'].group({
		'label': _requires['util'].makeLabel({
		    text: L('label_signin'),
		    font:{ fontSize: 25 },
		    color: '#ffffff'
		})
	});
	signin.addEventListener('touchstart', function(){
		var passphrase  = field_passphrase.value;
		_requires['inputverify'].set( new Array(
			{ name: L('label_passphrase'), type: 'password', target: field_passphrase, over: 0 }
		));
		
		var result = null;
		if( (result = _requires['inputverify'].check()) == true ){
		    createAccount({ 'passphrase': passphrase });
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
	signin.top = 210;
	signin.height = 50;
	signin.width = '90%';
	signin.opacity = 0.0;
	signin.backgroundColor = '#E45C61';
	
	var signin_dammy = _requires['util'].group();
	signin_dammy.top = 210;
	signin_dammy.height = 50;
	signin_dammy.width = '90%';
	signin_dammy.opacity = 0.0;
	
	var hasuser_button = _requires['util'].group({
		'hasuser': _requires['util'].makeLabel({
		    text: L('text_loginasuser'),
		    font:{ fontSize: 15 },
		    color: '#ffffff'
		})
	});
	hasuser_button.height = 35;
	hasuser_button.width = '90%';
	hasuser_button.top = 120;
	hasuser_button.backgroundColor = '#E45C61';
	
	hasuser_button.addEventListener('touchstart', function(){
		newwallet.animate({ top: 0, opacity: 0.0, duration: 300 }, function(){
			if( OS_ANDROID ) signin_group.removeView({'newwallet':newwallet });
		});
		signin.animate({ top: 210, opacity: 1.0, duration: 300 });
		
		hasuser_button.opacity = 0.0;
		button_group_each.opacity = 0.0;
		field_group.opacity = 1.0;
		button_group.opacity = 1.0;
		
		if( OS_ANDROID ){
			signin_group.addView({'signin':signin });
			signin_group.removeView({'hasuser_button':hasuser_button });
			field_group.removeView({'button_group_each':button_group_each });
			field_group.addView({'button_group':button_group });
			signin_group.addView({'field_group':field_group });
		}
		
		init_passphrase();
	});
	
	var field_passphrase = _requires['util'].makeTextField({
		color: '#333300',
		hintText: L('label_passphrase'),
		border: 'hidden',
		font:{ fontSize:15, fontWeight:'normal' },
		height: 35, width: 250,
		top: 0, paddingLeft:5, 
		backgroundColor: '#ffffff',
		passwordMask: true,
	});
	
	var view_each_1 = Ti.UI.createView({ width: '100%', height: Ti.UI.SIZE, top: 0 });
	var view_each_2 = Ti.UI.createView({ width: '100%', height: Ti.UI.SIZE, top: 0 });
	
	var word_num = _requires['util'].makeLabel({
	    text: '',
	    font:{ fontSize: 20 },
	    color: '#ffffff',
	    top: 40
	});
	
	var field_each = []; var each_num = -1;
	for( var i = 0; i < 12; i++ ){
		field_each[i] = _requires['util'].makeTextField({
			color: '#333300',
			border: 'hidden',
			font:{ fontSize: 15, fontWeight: 'normal' },
			height: 35, width: 150,
			top: 0, paddingLeft:5, 
			backgroundColor: '#ffffff',
			passwordMask: true
		});
	}
	
	var text_inputbyeach = _requires['util'].makeLabel({
	    text: L('text_inputbyeach'),
	    font:{ fontSize: 15 },
	    color: '#ffffff',
	    right: 10
	});
	text_inputbyeach.addEventListener('touchstart', function(){
		signin.opacity = button_group.opacity = 0.0;
		
		word_num.opacity = 1.0;
		button_group_each.opacity = 1.0;
		
		if( OS_ANDROID ){
			signin_group.removeView({'signin':signin });
			field_group.removeView({'button_group':button_group });
			signin_group.addView({'word_num':word_num});
			field_group.addView({'button_group_each':button_group_each });
		}
		
		move_next();
	});
	
	function init_passphrase( passphrase ){
		each_num = -1;
		
		field_passphrase.value = passphrase || '';
		if( passphrase == null ){
			for( var i = 0; i < 12; i++ ) field_each[i].value = '';
		}
		view_each_1.removeAllChildren();
		view_each_1.add(field_passphrase);
		view_each_1.opacity = 1.0;
		view_each_1.left = view_each_1.right = null;
		
		view_each_2.opacity = 0.0;
		view_each_2.removeAllChildren();
	}
	
	var is_moving = false;
	function move_next(){
		if( each_num < 11 ){
			if( !is_moving ){
				var new_view, old_view;
				if( each_num % 2 == 0 ){
					new_view = view_each_1;
					old_view = view_each_2;
				}
				else{
					new_view = view_each_2;
					old_view = view_each_1;
				}
				
				function move(){
					var field = field_each[++each_num];
					word_num.text = L('text_word_num').format({'num': each_num + 1});
					new_view.add(field);
					
					is_moving = true;
					
					old_view.left = 0;
					old_view.animate({ left: -200, opacity: 0.0, duration: 300 }, function(){
						old_view.left = old_view.right = null;
						old_view.removeAllChildren();
					});
					
					new_view.opacity = 0.0;
					new_view.right = -200;
					
					new_view.animate({ right: 0, opacity: 1.0, duration: 300 }, function(){
						new_view.left = new_view.right = null;
						new_view.opacity = 1.0;
						is_moving = false;
					});
					
					if( each_num <= 0 ) text_inputbyeach_prev.opacity = 0.5;
					else if( each_num == 1 ) text_inputbyeach_prev.opacity = 1.0;
				}
				
				if( each_num >= 0 ){
					_requires['inputverify'].set( new Array(
						{ name: L('label_passphrase'), type: 'password', target: old_view.children[0], over: 0 }
					));
					var result = null;
					if( (result = _requires['inputverify'].check()) == true ){
					    move();
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
				else move();
			}
		}
		else{
			var passphrase = '';
			for( var i = 0; i < 12; i++ ){
				passphrase += field_each[i].value.toLowerCase();
				if( i < 11 ) passphrase += ' ';
			}
			
			signin.opacity = field_group.opacity = button_group.opacity = 1.0;
			word_num.opacity = button_group_each.opacity = 0.0;
			
			if( OS_ANDROID ){
				signin_group.addView({'field_group':field_group });
				signin_group.addView({'signin':signin });
				signin_group.removeView({'word_num':word_num});
				field_group.addView({'button_group':button_group });
				field_group.removeView({'button_group_each':button_group_each });
			}
			
			init_passphrase( passphrase );
		}
	}
	
	function move_prev(){
		if( each_num > 0 && !is_moving ){
			var new_view, old_view;
			if( each_num % 2 == 0 ){
				new_view = view_each_1;
				old_view = view_each_2;
			}
			else{
				new_view = view_each_2;
				old_view = view_each_1;
			}
			
			var field = field_each[--each_num];
			word_num.text = L('text_word_num').format({'num': each_num + 1});
			new_view.add(field);
			
			is_moving = true;
			
			old_view.right = 0;
			old_view.animate({ right: -200, opacity: 0.0, duration: 300 }, function(){
				old_view.left = old_view.right = null;
				old_view.removeAllChildren();
			});
			
			new_view.opacity = 0.0;
			new_view.left = -200;
			new_view.animate({ left: 0, opacity: 1.0, duration: 300 }, function(){
				new_view.left = new_view.right = null;
				new_view.opacity = 1.0;
				is_moving = false;
			});
			
			if( each_num <= 0 ) text_inputbyeach_prev.opacity = 0.5;
		}
	}
	
	var text_inputbyeach_next = _requires['util'].makeLabel({
	    text: L('text_inputbyeach_next'),
	    font:{ fontSize: 15 },
	    color: '#ffffff',
	    left: 10
	});
	text_inputbyeach_next.addEventListener('touchstart', function(){
		move_next();
	});
	
	var label_each_cancel = _requires['util'].makeLabel({
	    text: L('label_login_cancel'),
	    font:{ fontSize: 15 },
	    color: '#ffffff'
	});
	label_each_cancel.addEventListener('touchstart', function(){
		newwallet.opacity = 0.0;
		newwallet.animate({ top: 50, opacity: 1.0, duration: 300 });
		signin.animate({ top: 210, opacity: 0.0, duration: 300 }, function(){
			if( OS_ANDROID ) signin_group.removeView({'signin':signin });
		});
		
		word_num.opacity = 0.0;
		hasuser_button.opacity = 1.0;
		field_group.opacity = 0.0;
		button_group.opacity = 0.0;
		button_group_each.opacity = 0.0;
		
		if( OS_ANDROID ){
			signin_group.addView({'newwallet':newwallet });
			signin_group.addView({'hasuser_button':hasuser_button });
			signin_group.removeView({'word_num':word_num});
			signin_group.removeView({'field_group':field_group });
			field_group.removeView({'button_group':button_group });
			field_group.removeView({'button_group_each':button_group_each });
		}
		
		init_passphrase();
	});
	
	var text_inputbyeach_prev = _requires['util'].makeLabel({
	    text: L('text_inputbyeach_prev'),
	    font:{ fontSize: 15 },
	    color: '#ffffff',
	    right: 10
	});
	text_inputbyeach_prev.addEventListener('touchstart', function(){
		move_prev();
	});
	
	var button_group_each = _requires['util'].group({
		'text_inputbyeach_prev': text_inputbyeach_prev,
		'separator1': _requires['util'].makeLabel({
		    text: ' | ',
		    font:{ fontSize: 15 },
		    color: '#ffffff',
		}),
		'label_back': label_each_cancel,
		'separator2': _requires['util'].makeLabel({
		    text: ' | ',
		    font:{ fontSize: 15 },
		    color: '#ffffff',
		}),
		'text_inputbyeach_next': text_inputbyeach_next
	}, 'horizontal');
	button_group_each.top = 50;
	button_group_each.opacity = 0.0;
	
	var label_back = _requires['util'].makeLabel({
	    text: L('label_login_back'),
	    font:{ fontSize: 15 },
	    color: '#ffffff',
	    left: 10
	});
	label_back.addEventListener('touchstart', function(){
		newwallet.opacity = 0.0;
		newwallet.animate({ top: 50, opacity: 1.0, duration: 300 });
		signin.animate({ top: 210, opacity: 0.0, duration: 300 }, function(){
			if( OS_ANDROID ) signin_group.removeView({'signin':signin });
		});
		
		hasuser_button.opacity = 1.0;
		field_group.opacity = 0.0;
		button_group.opacity = 0.0;
		button_group_each.opacity = 0.0;
		
		if( OS_ANDROID ){
			signin_group.addView({'newwallet':newwallet });
			signin_group.addView({'hasuser_button':hasuser_button });
			signin_group.removeView({'field_group':field_group });
			field_group.removeView({'button_group':button_group});
			field_group.removeView({'button_group_each':button_group_each});
		}
		
		init_passphrase();
	});
	
	var button_group = _requires['util'].group({
		'text_inputbyeach': text_inputbyeach,
		'separator': _requires['util'].makeLabel({
		    text: ' | ',
		    font:{ fontSize: 15 },
		    color: '#ffffff',
		}),
		'label_back': label_back
	}, 'horizontal');
	button_group.top = 50;
	
	var field_group = _requires['util'].group({
		'view_each_1': view_each_1, 'view_each_2': view_each_2,
	});
	if( OS_IOS ){
		field_group.addView({
			'button_group': button_group,
			'button_group_each': button_group_each
		});
	}
	field_group.width = '100%';
	field_group.opacity = 0.0;
	field_group.top = 120;
	
	var signin_group = _requires['util'].group({
		'newwallet': newwallet,
		'hasuser_button': hasuser_button,
	});
	if( OS_IOS ){
		signin_group.addView({
			'word_num': word_num,
			'field_group': field_group,
			'signin': signin
		});
	}
	if(OS_ANDROID){
		signin_group.addView({
			'signin_dammy': signin_dammy
		});
	}
	signin_group.top = 50;
	
	var createAccount = function( params ){
		var rsa_info = _requires['cache'].load_rsa();
		var passphrase = params.passphrase;
		
		if( passphrase === 'demo' ){
			password = 'demo3728';
			globals.DEMO = true;
		}
		
		var loading = _requires['util'].showLoading( win.origin, { width: Ti.UI.FILL, height: Ti.UI.FILL, style: 'dark', message: L('loading_createaccount') });
		try{
			var address, pubkey;
			if( globals.DEMO ){
				passphrase = 'DemoPassphrase';
				address = '1TestWalletAddress';
				pubkey = '02TestWalletPublicKey';
			}
			else{
				passphrase = _requires['bitcore'].getpassphrase( passphrase );
				_requires['bitcore'].init( passphrase );
				address = _requires['bitcore'].getAddress();
				pubkey = _requires['bitcore'].getPublicKey();
			}
			
			var b = require('crypt/bcrypt');
			bcrypt = new b();
			
			bcrypt.hashpw(password, bcrypt.gensalt(10), function( pass_hash ) {
				_requires['network'].connect({
					'method': 'createAccount',
					'post': {
						address: address,
						pubkey: pubkey,
						code: pass_hash
					},
					'callback': function( result ){
						_requires['cache'].data.id = result.id;
						_requires['cache'].data.address = address;
						_requires['cache'].data.passphrase = passphrase;
						_requires['cache'].data.pass_hash = pass_hash;
						_requires['cache'].data.password = password;
						if( L('language') === 'ja' ) _requires['cache'].data.currncy = 'JPY';
						else _requires['cache'].data.currncy = 'USD';
						_requires['cache'].save();
						
						globals.createTab();
						globals.keepRegister = true;
						_windows['home'].run();
						if( OS_IOS ) win.origin.close();
						
						if( Ti.API.new_wallet_win !== undefined ) Ti.API.new_wallet_win.close();
						
						var dialog = _requires['util'].createDialog({
							title: L('label_passphrase_title'),
							message: L('text_passphrase').format({'passphrase': passphrase}),
							buttonNames: [L('label_passphrase_ok')]
						});
						dialog.addEventListener('click', function(e){
							var dialog2 = _requires['util'].createDialog({
								message: L('text_passphrase_re'),
								buttonNames: [L('label_ok')]
							});
							dialog2.addEventListener('click', function(e){
								globals.keepRegisterStart = true;
							});
							dialog2.show();
						});
						dialog.show();
					},
					'onError': function( message ){
						alert(message);
					},
					'always': function(){
						loading.removeSelf();
					}
				});
			});
		}
		catch(e){
			loading.removeSelf();
			_requires['util'].createDialog({
				message: e.message,
				buttonNames: [ L('label_close') ]
			}).show();
		}
	};
	
	/*
	 Drawing to create account.
	 * */
	var draw_leftup = _requires['util'].makeImage({
	    image: '/images/draw_leftup.png',
	    width: 60,
	    top: 50, left: 10,
	    opacity: 0.0
	});
	view.add(draw_leftup);
	
	var draw_rightdown = _requires['util'].makeImage({
	    image: '/images/draw_rightdown.png',
	    width: 60,
	    bottom: 50, right: 10,
	    opacity: 0.0
	});
	view.add(draw_rightdown);
	
	var icon_drawing = _requires['util'].makeImage({
	    image: '/images/icon_drawing.png',
	    width: 250,
	    opacity: 0.0
	});
	view.add(icon_drawing);
	
	var max = 256;
	var crypto = require('vendor/crypto');
    getRandom = function (bits, seed) {
        var randomBytes = crypto.randomBytes(bits / 8, seed), random = [];
        for (var i = 0; i < (bits / 32); i++) {
            random.push(randomBytes.readUInt32BE(4 * i));
        }
        return random;
    };
    
    var progress = _requires['util'].group({
    	'explain': _requires['util'].makeLabel({
		    text: L('draw_explain'),
		    font:{ fontSize: 12 },
		    color: '#ffffff'
		}),
    	'bar': Ti.UI.createProgressBar({
			value : 0,
			min : 0, max : max,
			width : '100%', top : 10,
			style : Ti.UI.iPhone.ProgressBarStyle.PLAIN
		}),
		'per': _requires['util'].makeLabel({
		    text: '0%',
		    font:{ fontSize: 15 },
		    color: '#ffffff',
		    top: 10
		})
    }, 'vertical');
    progress.width = '80%';
    progress.bar.show();
	progress.opacity = 0.0;
	view.add(progress);
	
	var back_button = _requires['util'].group({
		'label': _requires['util'].makeLabel({
		    text: L('label_login_back'),
		    font:{ fontSize: 15 },
		    color: '#ffffff'
		})
	});
	back_button.height = 40;
	back_button.width = '100%';
	back_button.bottom = 0;
	back_button.opacity = 0.0;
	
	back_button.addEventListener('touchstart', function(){
		whole_group.opacity = policy.opacity = 1.0;
		if( OS_ANDROID ) view.add( policy );
		icon_drawing.opacity = draw_leftup.opacity = draw_rightdown.opacity = 0.0;
		
		progress.opacity = back_button.opacity = 0.0;
		view.removeEventListener('touchmove', touchEvent);
	});
	view.add( back_button );
	
	var val = 0, s = '';
	var touchEvent = function(e){
		val++;
		if( val < max ){
			progress.bar.value = val;
			progress.per.text = parseInt(((val / max) * 100)) + '%';
			s += (parseInt(e.x) * parseInt(e.y) + parseInt(globals.Accelerometer)) % 2;
		}
		else{
			progress.bar.value = max;
			progress.per.text = 'OK!';
			
			globals.randomBytes = getRandom(128, parseInt(s, 2));
			view.removeEventListener('touchmove', touchEvent);
			Ti.Accelerometer.removeEventListener('update', getAccelerometer);
			createAccount({ 'passphrase': null });
		}
	};
	
	var whole_group = _requires['util'].group({
		'logo': logo
	}, 'vertical');
	view.add(whole_group);
	
	win.open();
	
	var loading = _requires['util'].showLoading(view, { color: '#ffffff', message: L('label_loading') });
	loading.bottom = 30;
	
	if( !rsa_info.already ){
		var PASS = password;
		var RSAkey = globals.Crypt_key = crypt.generateRSAKey(PASS, 1024);
		
		rsa_info.already = true;
		rsa_info.a = RSAkey.toString();
		globals.requires['cache'].save_rsa(rsa_info);
	}
	loading.removeSelf();
	
	whole_group.addView({ 'signin_group': signin_group });
	
	var policy = _requires['util'].group({
		'text1': _requires['util'].makeLabel({
		    text: L('label_privecypolicy'),
		    font:{ fontSize: 12 },
		    color: '#ffffff',
		    top: 0
		}),
		'text2': _requires['util'].makeLabel({
		    text: L('label_privecypolicy2'),
		    font:{ fontSize: 8 },
		    color: '#ffffff',
		    top: 15
		})
	});
	policy.bottom = 15;
	policy.addEventListener('click', function(){
		_windows['webview'].run({ path: 'terms' });
	});
	view.add( policy );
	
	function getAccelerometer(e){
		var a = 0;
		if( e.timestamp % 3 == 0 ) a = e.x * e.y;
		else if( e.timestamp % 3 == 1 ) a = e.y * e.z;
		else if( e.timestamp % 3 == 2 ) a = e.z * e.x;
		globals.Accelerometer = a * 100000000;
	}
	Ti.Accelerometer.addEventListener('update', getAccelerometer);
	
	if (Ti.Platform.name === 'android'){
		Ti.Android.currentActivity.addEventListener('pause', function(e) {
			Ti.Accelerometer.removeEventListener('update', accelerometerCallback);
		});
		Ti.Android.currentActivity.addEventListener('resume', function(e) {
			Ti.Accelerometer.addEventListener('update', accelerometerCallback);
		});
  	}
  	
	return win.origin;
};