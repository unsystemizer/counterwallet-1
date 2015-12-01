exports.run = function( params ){
	var _windows = globals.windows;
	var _requires = globals.requires;
	
	var win = _requires['layer'].createWindow();
	var main_view = Ti.UI.createView({ backgroundColor:'#ececec', width: Ti.UI.FILL, height: Ti.UI.FILL });
	win.origin.add(main_view);
	
	var top_bar = Ti.UI.createView({ backgroundColor:'#e54353', width: Ti.UI.FILL, height: 55 });
	top_bar.top = 0;
	win.origin.add(top_bar);
	
	var back_home = _requires['util'].makeLabel({
		text: L('label_asset_info'),
		color: 'white',
		font:{fontFamily:'Helvetica Neue', fontSize:10, fontWeight:'normal'},
		textAlign: 'right',
		top: 25, left:10
	});
	top_bar.add( back_home );
	
	back_home.addEventListener('click', function(){
		win.close();
	});
	
	var settings_title_center = _requires['util'].makeLabel({
		text:params.asset,
		color:"white",
		font:{fontFamily:'Helvetica Neue', fontSize:20, fontWeight:'normal'},
		textAlign: 'center',
		top: 25, center: 0
	});
	top_bar.add(  settings_title_center );
	
	var view = _requires['util'].group(null, 'vertical');
	view.top = 50;
	main_view.add(view);
	
	var info = globals.datas;
	var total_holders = 0;
	
	var loading = _requires['util'].showLoading(main_view, { width: Ti.UI.FILL, height: Ti.UI.FILL, message: L('loading_holders') });
	_requires['network'].connect({
		'method': 'get_holders',
		'post': {
			id: _requires['cache'].data.id,
			asset: params.asset
		},
		'callback': function( result ){
			total_holders = result.count;
			
			var title = _requires['util'].makeLabel({
				text: params.asset,
				top: 5,
				font:{ fontSize: 17 }
			});
			main_view.add(title);
			
			var count = _requires['util'].makeLabel({
				text: L('text_holdcount').format({'count': result.count}),
				top: 30,
				font:{ fontSize: 12 }
			});
			main_view.add(count);
			
			var view = Ti.UI.createScrollView({ scrollType: 'vertical', layout: 'vertical', backgroundColor: '#ececec', showVerticalScrollIndicator: true });
			view.top = 50;
			main_view.add(view);
			
			function createBox( params ){
				var box = _requires['util'].group();
				box.height = params.height;
				box.width = '100%';
				box.backgroundColor = '#ffffff';
				
				return box;
			}
			
			for( var i = 0; i < result.holders.length; i++ ){
				var val = result.holders[i];
				var box = createBox({ height: 70 });
				box.top = 10;
				box.add(
					_requires['util'].makeLabel({
						text: val.address,
						top: 10, left: 10,
						font:{ fontSize: 12 }
					})
				);
				box.add(
					_requires['util'].makeLabel({
						text: val.quantity,
						top: 25, left: 20,
						font:{ fontSize: 20 }
					})
				);
				box.add(
					_requires['util'].makeLabel({
						text: (val.ratio * 100).toFixed2() + '%',
						top: 50, right: 10,
						font:{ fontSize: 11 }
					})
				);
				view.add(box);
			}
		},
		'onError': function(error){
			alert(error);
		},
		'always': function(){
			loading.removeSelf();
		}
	});

	Ti.API.home_tab.open(win.origin,{animated:true});
	return win.origin;
};