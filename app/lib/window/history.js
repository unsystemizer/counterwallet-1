var theWindow =  Ti.UI.createWindow({
	title: L('label_tab_3'),
	backgroundColor:'#ececec',
	orientationModes: [Ti.UI.PORTRAIT],
	navBarHidden: true
});
if( OS_IOS ) theWindow.statusBarStyle = Ti.UI.iPhone.StatusBar.LIGHT_CONTENT;
exports.run = function(){

	var _windows = globals.windows;
    var _requires = globals.requires;
    
    var view = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	theWindow.add(view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 55 });
	top_bar.top = 0;
	theWindow.add(top_bar);
	
	var history_title_center = _requires['util'].makeLabel({
		text: L('label_tab_history'),
		color:"white",
		font:{ fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 25, center: 0
	});
	top_bar.add(  history_title_center );
	
	var scroll_view = Ti.UI.createScrollView({ scrollType: 'vertical', height: _requires['util'].getDisplayHeight() - 105, layout: 'vertical', showVerticalScrollIndicator: true });
	scroll_view.top = 50;
	view.add(scroll_view);
	
	var loading = null, history_error = null;
	function createList( result, bool ){
		try{
			scroll_view.removeAllChildren();
			if( history_error != null ){
				view.remove(history_error);
				history_error = null;
			}
			if( result.transactions.length > 0 ){
				Ti.API.historyLoad = 'YES';
				function createBox( params ){
					var box = _requires['util'].group();
					box.height = params.height;
					box.width = '100%';
					box.backgroundColor = '#ffffff';
					
					return box;
				}
				
				for( var i = 0; i < result.transactions.length; i++ ){
					var val = result.transactions[i];
					var box = createBox({ height: 90 });
					box.top = 10;
					
					var history = ''; var address = null;
					
					if( val.type === 'order' ){
						history = L('text_history_order').format({ 'give_quantity': val.give_quantity, 'give_asset': val.give_asset, 'get_quantity': val.get_quantity, 'get_asset': val.get_asset});
					}
					else if( val.type === 'send' ){
						if(val.category === 'Send'){
							val.type = 'send';
							history = L('text_history_send').format({ 'quantity': Number(val.quantity), 'asset': val.asset, 'target': val.destination });
							address = val.destination;
						}
						else{
							val.type = 'receive';
							history = L('text_history_receive').format({ 'quantity': Number(val.quantity), 'asset': val.asset, 'target': val.source });
							address = val.source;
						}
					}
					else if( val.type === 'issuance' ){
						history = L('text_history_issuance').format({ 'quantity': val.quantity, 'asset': val.asset, 'description': val.description });
					}
					else if( val.type === 'dividend' ){
						history = L('text_history_dividend').format({ 'dividend_asset': val.dividend_asset, 'asset': val.asset, 'quantity_per_unit': (val.quantity_per_unit * 100) });
					}
					else if( val.type === 'get_dividend' ){
						history = L('text_history_get_dividend').format({ 'dividend_asset': val.dividend_asset, 'asset': val.asset, 'quantity_per_unit': (val.quantity_per_unit * 100) });
					}
					
					var color = '#6db558';
					if(val.type == 'send') color = '#e54353';
					if(val.type == 'order') color = '#4265d7';
					
					var message = _requires['util'].group({
						'category': _requires['util'].makeLabel({
							text: L('label_historytype_' + val.type),
							top: 0, left: 0,
							font:{fontFamily:'Helvetica Neue', fontSize:13, fontWeight:'bold'},
							color:color
						}),
						'history': _requires['util'].makeLabel({
							text: history,
							top: 15, left: 60,
							font:{ fontSize:12, fontWeight:'normal'},
							textAlign: 'left'
						}),
						'time': _requires['util'].makeLabel({
							text: val.date,
							textAlign: 'right',
							top: 0, right: 10,
							font:{fontFamily:'Helvetica Neue', fontSize:8, fontWeight:'bold'}
						})
					});
					
					_requires['util'].putTokenIcon({
						info: val, parent: message,
						width: 40, height: 40,
						top: 20, left: 4
					});
					
					message.left = 10;
					message.width = '90%';
					
					box.add( message );
					scroll_view.add(box);
					
					if( address != null ){
						box.addEventListener('click', (function(address) {
							return function(){
								Ti.UI.Clipboard.setText( address );
								_requires['util'].createDialog({
									title: L('text_copied'),
									message: L('text_copied_message') + '\n' + address,
									buttonNames: [L('label_close')]
								}).show();
							};
						})(address), false);
					}
				}
				if( bool ) _requires['layer'].addPullEvent(scroll_view, { parent: view, margin_top: 70, callback: function(l){ loadHistory(false, l); }});
			}
			else{
				Ti.API.historyLoad = 'NO';
				view.removeAllChildren();
				if( history_error == null ){
					history_error = _requires['util'].makeLabel({
						text: L('text_nohistory'),
						font:{ fontSize: 15 }
					});
					view.add(history_error);
				}
			}
		}
		catch(e){
			if( loading != null ) loading.removeSelf();
		}
	}
	
	function loadHistory(bool, l){
		loading = l;
		if( bool ) loading = _requires['util'].showLoading(view, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('loading_history')});
		_requires['network'].connect({
			'method': 'getHistory',
			'post': {
				id: _requires['cache'].data.id
			},
			'callback': function( result ){
				createList( result, bool );
			},
			'onError': function(error){
				var history = _requires['util'].makeLabel({
					text: L('text_history_error'),
					font:{ fontSize: 15 }
				});
				view.add(history);
			},
			'always': function(){
				if( loading != null ) loading.removeSelf();
			}
		});
	}
	loadHistory(true);
};
Ti.API.history_win = theWindow;