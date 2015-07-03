exports.run = function(){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win);
	frame.view.backgroundColor = '#ffc07f';
	
	var view = Ti.UI.createScrollView({
		width: Ti.UI.FILL,
		height: Ti.UI.FILL,
		scrollType: 'vertical',
	});
	frame.view.add(view);
	
	function createBox( color ){
		var box = _requires['util'].group();
		box.height = 35;
		box.width = 250;
		box.backgroundColor = color;
		
		return box;
	}
	
	var create = createBox('#ff8200');
	create.add(
		_requires['util'].makeLabel({
		    text: L('label_create'),
		    font:{ fontSize: 13 },
		    color: '#ffffff'
		})
	);
	create.top = 10;
	
	var policy = _requires['util'].group({
		'text1': _requires['util'].makeLabel({
		    text: L('label_privecypolicy'),
		    font:{ fontSize: 12 },
		    color: '#1111cc',
		    top: 0
		}),
		'text2': _requires['util'].makeLabel({
		    text: L('label_privecypolicy2'),
		    font:{ fontSize: 10 },
		    top: 15
		})
	});
	policy.top = 10;
	policy.addEventListener('click', function(){
		_windows['webview'].run({ path: 'privacypolicy.php?isDownload=false' });
	});
	
	var close = createBox('#a6a8ab');
	close.add(
		_requires['util'].makeLabel({
		    text: L('label_back'),
		    font:{ fontSize: 13 },
		    color: '#ffffff'
		})
	);
	close.top = 10;
	close.addEventListener('click', function(){
		win.close({transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT});
	});

	var create_group = _requires['util'].group({
		'logo': _requires['util'].makeImage({
		    image: '/images/icon_logo.png',
		    width: 70,
		    top: 0,
		}),
		'title': _requires['util'].makeLabel({
		    text: L('text_createnewwallet'),
		    font:{ fontSize: 12 },
		    top: 60,
		}),
		'password': _requires['util'].makeTextField({
			color: '#333300',
			hintText: L('label_hinttext_password'),
			borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			height: 35,
			width: 250,
			top: 10,
			backgroundColor: '#ffffff',
			passwordMask: true
		}),
		'password_confirm': _requires['util'].makeTextField({
			color: '#333300',
			hintText: L('label_hinttext_password_confirm'),
			borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
			height: 35,
			width: 250,
			top: 10,
			backgroundColor: '#ffffff',
			passwordMask: true
		}),
		'desc': _requires['util'].makeLabel({
			text: L('text_descript_password'),
			font:{ fontSize: 10 },
			textAlign: 'left',
			left: 0
		}),
		'policy': policy,
		'create': create,
		'close': close
	}, 'vertical');
	frame.view.add(create_group);
	
	var total = '';
	var crypto = require('vendor/crypto');
    getRandom = function (bits, seed) {
        var randomBytes = crypto.randomBytes(bits / 8, seed), random = [];
        for (var i = 0; i < (bits / 32); i++) {
            random.push(randomBytes.readUInt32BE(4 * i));
        }
        return random;
    };
	create_group.password.addEventListener('change', function(e){
		var val = e.value, s = 0;
		for(var i = 0; i < val.length; i++){
			total = (val.charCodeAt(Math.floor(Math.random() * val.length)) % 2) + total;
			total = total.substr(0, 256);
		}
	});
	create_group.password_confirm.addEventListener('change', function(e){
		var val = e.value, s = 0;
		for(var i = 0; i < val.length; i++){
			total = (val.charCodeAt(Math.floor(Math.random() * val.length)) % 2) + total;
			total = total.substr(0, 256);
		}
	});
	
	create.addEventListener('click', function(){
		var password  = create_group.password.value;
		
		_requires['inputverify'].set( new Array(
			{ name: L('label_hinttext_password'), type: 'password', target: create_group.password, over: 6 },
			{ name: L('label_hinttext_password_confirm'), type: 'password', target: create_group.password_confirm, equal: create_group.password }
		));
		
	    var result = null;
		if( (result = _requires['inputverify'].check()) == true ){
			globals.randomBytes = getRandom(128, parseInt(total, 2));
			globals.createAccount({ 'win': win.origin, 'passphrase': null, 'password': password });
		}
		else{
			_requires['util'].createDialog({
				message: result.message,
				buttonNames: [L('label_close')]
			}).show();
			
			result.target.focus();
		}
	});
	
	win.open({transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT});
};