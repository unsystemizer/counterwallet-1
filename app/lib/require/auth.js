module.exports = (function() {
	var self = {};
	
	var TiTouchId;
	var cache = require('require/cache');
	if( OS_IOS ) TiTouchId = require('ti.touchid');
	
	self.REASON_CANCEL				= -1;
	self.REASON_EASY 				= 0;
	self.REASON_SECONDEPASSWORD 	= 1;
	self.REASON_PASSWORD 			= 2;
	self.REASON_TOUCHID 			= 3;
	
	self.check = function( win, v ){
		function input_password(){
			var util = require('require/util');
			var info = globals.datas;
			if( info.easypass != null ){
				var easyInput = util.createEasyInput({
					type: 'confirm',
					callback: function( number ){
						v.callback({ success: true, reason: self.REASON_EASY, inputText: number });
					},
					cancel: function(){
						v.callback({ success: false, reason: self.REASON_CANCEL });
					}
				});
				easyInput.open();
			}
			else{
				function input(){
					var message = L('text_inputpass');
					var dialog = util.createInputDialog({
						title: v.title,
						message: message,
						passwordMask: true,
						buttonNames: [L('label_cancel'), L('label_ok')]
					});
					dialog.origin.addEventListener('click', function(e){
						var inputText = (OS_ANDROID)?dialog.androidField.value: e.text;
					  	if( e.index == 1 ){
					  		if( cache.data.password === inputText ){
								v.callback({ success: true, reason: self.REASON_PASSWORD, inputText: inputText });
							}
							else{
								var dialog2 = util.createDialog({
									message: L('text_wrongpass'),
									buttonNames: [L('label_close')]
								});
								dialog2.addEventListener('click', function(e){
									input();
								});
								dialog2.show();
							}
						}
						else{
							v.callback({ success: false, reason: self.REASON_CANCEL });
						}
					});
					dialog.origin.show();
				}
				input();
			}
		}
		
		if( OS_ANDROID ) input_password();
		else{
			if( cache.data.isTouchId != null ){
				var done = function(params){
					Ti.App.removeEventListener('auth', done);
					if( params.e.success ) v.callback({ success: true, reason: self.REASON_TOUCHID });
					else{
						if( params.e.code == TiTouchId.ERROR_USER_CANCEL ) v.callback({ success: false, reason: self.REASON_CANCEL });
						else input_password();
					}
				};
				Ti.App.addEventListener('auth', done);
				
				TiTouchId.authenticate({
			        reason: L('text_pleasefingerprint'),
			        callback: function(e){ Ti.App.fireEvent('auth', { e: e }); }
			    });
			}
			else input_password();
		}
	};
	
	self.useTouchID = function(v){
		var done = function(params){
			Ti.App.removeEventListener('usetouchid', done);
			if( params.e.success ) v.callback({ success: true });
			else v.callback({ success: false });
		};
		Ti.App.addEventListener('usetouchid', done);
		
		TiTouchId.authenticate({
	        reason: L('text_pleasefingerprint'),
	        callback: function(e){ Ti.App.fireEvent('usetouchid', { e: e }); }
	    });
	};
	
    return self;
}());