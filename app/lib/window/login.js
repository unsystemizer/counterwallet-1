module.exports.run = function(){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var main_view = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	win.origin.add(main_view);
	
	var view = Ti.UI.createScrollView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL,
		scrollType: 'vertical',
	});
	main_view.add(view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 20 });
	top_bar.top = 0;
	win.origin.add(top_bar);
	
	function createBox(){
		var box = _requires['util'].group();
		box.height = 35;
		box.width = 250;
		box.backgroundColor = '#e54353';
		
		return box;
	}
	
	var login = createBox();
	login.add(
		_requires['util'].makeLabel({
		    text: L('label_login'),
		    font:{ fontSize: 12 },
		    color: '#ffffff'
		})
	);
	login.top = 10;
	
	var create = createBox();
	create.add(
		_requires['util'].makeLabel({
		    text: L('text_createnewwallet'),
		    font:{ fontSize: 13 },
		    color: '#ffffff'
		})
	);
	create.top = 10;
	create.addEventListener('click', function(){
		_windows['newwallet'].run();
	});
	
	var login_group = _requires['util'].group({
		'logo': _requires['util'].makeImage({
		    image: '/images/icon_logo.png',
		    width: 100,
		    top: 0,
		}),
		'title': _requires['util'].makeLabel({
		    text: '- ' + L('text_loginasuser') + ' -',
		    font:{ fontSize: 12 },
		    top: 10,
		}),
		'passphrase': _requires['util'].makeTextField({
			color: '#333300',
			hintText: L('label_passphrase'),
			border: 'hidden',
			height: 35,
			width: 250,
			top: 10,
			font:{fontFamily:'Helvetica Neue', fontSize:15, fontWeight:'normal'},
			paddingLeft:5, 
			backgroundColor: '#ffffff',
			passwordMask: true,
		}),
		'password': _requires['util'].makeTextField({
			color: '#333300',
			hintText: L('label_hinttext_password'),
			border: 'hidden',
			height: 35,
			width: 250,
			top: 10,
			font:{fontFamily:'Helvetica Neue', fontSize:15, fontWeight:'normal'},
			paddingLeft:5,
			backgroundColor: '#ffffff',
			passwordMask: true,
		}),
		'desc': _requires['util'].makeLabel({
			text: L('text_descript_password'),
			font:{ fontSize: 10 },
			textAlign: 'left',
			left: 0
		}),
		'loginbutton': login,
		'title2': _requires['util'].makeLabel({
		    text: '- ' + L('text_newcommer') + ' -',
		    font:{ fontSize: 12 },
		    top: 20,
		}),
		'create': create,
	}, 'vertical');
	view.add(login_group);
	
	globals.createAccount = function( params ){
		var rsa_info = _requires['cache'].load_rsa();
		var passphrase = params.passphrase;
		var password = params.password;
		
		if( passphrase === 'demo' && password === 'demo3728' ){
			globals.DEMO = true;
		}
		
		var loading = _requires['util'].showLoading(params.win, { width: Ti.UI.FILL, height: Ti.UI.FILL, style: 'dark' });
		_requires['network'].connect({
			'method': 'getKey',
			'post': {},
			'callback': function( key ){
				try{
					if( globals.useRSA ){
						require('require/jsdeferred');
						Deferred.define();
						
						Deferred.next(function () {
							globals.generateRSAKey = false;
							var crypt = require('crypt/api');
							if( !rsa_info.already ){
								var PASS = key + params.password;
								var RSAkey = globals.Crypt_key = crypt.generateRSAKey(PASS, 1024);
								
								rsa_info.already = true;
								rsa_info.a = RSAkey.toString();
								_requires['cache'].save_rsa(rsa_info);
							}
						})
						.next(function(){
							globals.generateRSAKey = true;
						});
					}
					
					var address, pubkey;
					if( globals.DEMO ){
						passphrase = 'DemoPassphrase';
						address = '1TestWalletAddress';
						pubkey = '02TestWalletPublicKey';
					}
					else{
						passphrase = _requires['bitcore'].getpassphrase(passphrase);
						_requires['bitcore'].init(passphrase);
						address = _requires['bitcore'].getAddress();
						pubkey = _requires['bitcore'].getPublicKey();
					}
					
					var b = require('crypt/bcrypt');
					bcrypt = new b();
					
					bcrypt.hashpw(password, bcrypt.gensalt(10), function(pass_hash) {
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
								
								var timer = setInterval(function(){
									if( globals.generateRSAKey ){
										_requires['cache'].save();
										clearInterval(timer);
									}
								}, 100);
								
								globals.createTab();
								
								_windows['home'].run();
								//win.origin.close();
								
								if(Ti.API.new_wallet_win !== undefined) Ti.API.new_wallet_win.close();
								
								function record(){
									function registEasyPass(){
										var dialog = _requires['util'].createDialog({
											title: L('label_easypass'),
											message: L('text_easypass'),
											buttonNames: [L('label_cancel'), L('label_ok')]
										});
										dialog.addEventListener('click', function(e){
											if( e.index == 1 ){
												var easyInput = _requires['util'].createEasyInput({
													type: 'reconfirm',
													callback: function( number ){
														_requires['cache'].data.easypass = number;
														_requires['cache'].save();
													},
													cancel: function(){}
												});
												easyInput.open();
											}
										});
										dialog.show();
									}
									
									if( OS_IOS ){
										var dialog = _requires['util'].createDialog({
											title: L('label_fingerprint'),
											message: L('text_fingerprint'),
											buttonNames: [L('label_cancel'), L('label_ok')]
										});
										dialog.addEventListener('click', function(e){
											if( e.index == 1 ){
												_requires['auth'].useTouchID({ callback: function(e){
													if( e.success ){
														_requires['cache'].data.isTouchId = true;
														_requires['cache'].save();
													}
													else{
														var dialog = _requires['util'].createDialog({
															title: L('label_adminerror'),
															message: L('text_adminerror'),
															buttonNames: [L('label_close')]
														});
														dialog.addEventListener('click', function(e){
															registEasyPass();
														});
														dialog.show();
													}
												}});
											}
											else registEasyPass();
										});
										dialog.show();
									}
									else registEasyPass();
								}
								
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
										record();
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
			},
			'onError': function(error){
				loading.removeSelf();
			}
		});
	};
	
	login.addEventListener('click', function(){
		var passphrase  = login_group.passphrase.value;
		var password  = login_group.password.value;
		
		_requires['inputverify'].set( new Array(
			{ name: L('label_passphrase'), type: 'password', target: login_group.passphrase, over: 0 },
			{ name: L('label_password'), type: 'password', target: login_group.password, over: 6 }
		));
		
	    var result = null;
		if( (result = _requires['inputverify'].check()) == true ){
		    globals.createAccount({ 'win': win.origin, 'passphrase': passphrase, 'password': password });
		}
		else{
			_requires['util'].createDialog({
				message: result.message,
				buttonNames: [L('label_close')]
			}).show();
			
			result.target.focus();
		}
	});
	
	win.open();
	
	return win.origin;
};