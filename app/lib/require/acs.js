module.exports = (function() {
	var self = {};
	var Cloud = require('ti.cloud');
	
	function getDeviceToken( params ){
		var deviceToken = null;
		function receivePush(e) {
			var message;
			if( OS_IOS ) message = e.data.aps.alert;
			else{
				message = JSON.parse(e.payload).android.alert;
			}
			globals.requires['util'].createDialog({
				message: message,
				buttonNames: [L('label_close')]
			}).show();
		}
		function deviceTokenSuccess(e) {
			deviceToken = e.deviceToken;
			Cloud.PushNotifications.subscribe({
					channel: (OS_IOS)? 'ios': 'android',
					device_token: deviceToken, 
					type: (OS_IOS)? 'ios': 'gcm'
				},
				function (e) {
					if( params.isFirst ){
						globals.requires['network'].connect({
							'method': 'dbUpdate',
							'post': {
								id: params.id,
								data: JSON.stringify( [
									{ column: 'acs_id', value: params.acs_id },
									{ column: 'device_token', value: deviceToken },
									{ column: 'language', value: L('language') }
								])
							},
							'callback': function( result ){
								//
							},
							'onError': function(error){
								alert(error);
							}
						});
					}
				}
			);
		}
		function deviceTokenError(e) {
			Ti.API.info('Failed to register for push notifications! ' + e.error);
		}
		
		if( OS_IOS ){
			if (Ti.Platform.name == 'iPhone OS' && parseInt(Ti.Platform.version.split('.')[0]) >= 8) {
				Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {
					Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
					Ti.Network.registerForPushNotifications({
			            success: deviceTokenSuccess,
			            error: deviceTokenError,
			            callback: receivePush
			        });
			    });
			    Ti.App.iOS.registerUserNotificationSettings({
				    types: [
				        Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
				        Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
				        Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
				    ]
				});
			}
			else {
				Ti.Network.registerForPushNotifications({
					types: [
						Ti.Network.NOTIFICATION_TYPE_BADGE,
						Ti.Network.NOTIFICATION_TYPE_ALERT,
						Ti.Network.NOTIFICATION_TYPE_SOUND
					],
					success: deviceTokenSuccess,
					error: deviceTokenError,
					callback: receivePush
				});
			}
		}
		else{
			var CloudPush = require('ti.cloudpush');
			CloudPush.retrieveDeviceToken({
			    success: deviceTokenSuccess,
			    error: deviceTokenError
			});
			CloudPush.addEventListener('callback', function (e) {
			    receivePush(e);
			});
		}
	}
	
	self.login = function( params ){
		Cloud.Users.login({ 
		    login: params.id,
		    password: params.password
		}, function(e) {
		    if( e.success ){
		    	getDeviceToken({ id: params.id, isFirst: false });
		    }
		    else{
		    	var user = {
					username: params.id,
					password: params.password,
					password_confirmation: params.password
				};
				Cloud.Users.create(user, function(e) {
					if( e.success ){
						getDeviceToken({ id: params.id, acs_id: e.users[0].id, isFirst: true });
					}
					else{
						if( e.message.indexOf('Username is already taken') > 0 ){
							getDeviceToken({ id: params.id, isFirst: false });
						}
					}
				});
		    }
		});
	};
	
    return self;
}());