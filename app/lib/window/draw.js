exports.run = function(){
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: false });
	
	var max = 512;
	var crypto = require('vendor/crypto');
    getRandom = function (bits, seed) {
        var randomBytes = crypto.randomBytes(bits / 8, seed), random = [];
        for (var i = 0; i < (bits / 32); i++) {
            random.push(randomBytes.readUInt32BE(4 * i));
        }
        return random;
    };
    
    var paint = require('ti.paint');
	var paintView = paint.createPaintView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		backgroundColor : '#ffffff',
		strokeColor : '#ff0000',
		strokeAlpha : 255,
		strokeWidth : 5
	});
	frame.view.add(paintView);
    
    var progress = _requires['util'].group({
    	message: _requires['util'].makeLabel({
		    text: L('draw_something').format({pic: L('draw_' + Math.floor( Math.random() * 10 ))}),
		    font:{ fontSize: 12 },
		    color: '#000000',
		    top: 0
		}),
		per: _requires['util'].makeLabel({
		    text: '0%',
		    font:{ fontSize: 14 },
		    color: '#000000',
		    right: 0, top: 10
		}),
		bar: Ti.UI.createProgressBar({
			value : 0,
			min : 0, max : max,
			width : 200, top : 10,
			style : Ti.UI.iPhone.ProgressBarStyle.PLAIN
		})
    }, 'vertical');
    progress.top = 50;
    progress.width = '80%';
	progress.bar.show();
	frame.view.add(progress);
	
	var val = 0, s = '';
	var touchEvent = function(e){
		val++;
		if( val < max ){
			progress.bar.value = val;
			progress.per.text = parseInt(((val / max) * 100)) + '%';
			s += (parseInt(e.x) * parseInt(e.y)) % 2;
		}
		else{
			progress.bar.value = max;
			progress.per.text = 'OK!';
			if( globals.generateRSAKey ){
				globals.randomBytes = getRandom(128, parseInt(s, 2));
				frame.view.removeEventListener('touchmove', touchEvent);
				globals.continueCreateAccount();
				win.close({transition:Ti.UI.iPhone.AnimationStyle.CURL_UP});
			}
		}
	};
	frame.view.addEventListener('touchmove', touchEvent);
	
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	return win.origin;
};