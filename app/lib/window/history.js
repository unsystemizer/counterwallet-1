exports.run = function(){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var frame = _requires['layer'].drawFrame(win, { back: true });
	frame.view.backgroundColor = '#ffe0c1';
	
	view = Ti.UI.createScrollView({ scrollType: 'vertical', height: '100%', layout: 'vertical', showVerticalScrollIndicator: true });
	view.top = 0;
	frame.view.add(view);
	
	function createList( result, bool ){
		view.removeAllChildren();
		if( result.transactions.length > 0 ){
			function createBox( params ){
				var box = _requires['util'].group();
				box.height = params.height;
				box.width = '95%';
				box.borderColor = '#deb887';
				box.borderRadius = 3;
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
				
				var message = _requires['util'].group({
					'category': _requires['util'].makeLabel({
						text: L('label_historytype_' + val.type),
						top: 0, left: 0,
						font:{ fontSize: 10 }
					}),
					'history': _requires['util'].makeLabel({
						text: history,
						top: 15, left: 10,
						font:{ fontSize: 12 },
						textAlign: 'left'
					}),
					'time': _requires['util'].makeLabel({
						text: val.date,
						top: 65, right: 10,
						font:{ fontSize: 8 }
					})
				});
				message.left = 10;
				message.width = '90%';
				
				box.add( message );
				view.add(box);
				
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
			if( bool ){
				_requires['layer'].addPullEvent(view, { parent: frame.view, callback: function(l){
					loadHistory(false, l);
				}});
			}
			
		}
		else{
			var history = _requires['util'].makeLabel({
				text: L('text_nohistory'),
				font:{ fontSize: 15 }
			});
			frame.view.add(history);
		}
	}
	
	function loadHistory(bool, l){
		var loading = l;
		if( bool ) loading = _requires['util'].showLoading(frame.view, { width: Ti.UI.FILL, height: Ti.UI.FILL});
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
				frame.view.add(history);
			},
			'always': function(){
				if( loading != null ) loading.removeSelf();
			}
		});
	}
	loadHistory(true);
	
	win.open({transition:Ti.UI.iPhone.AnimationStyle.CURL_DOWN});
	return win.origin;
};