module.exports = (function() {
	this.getTiker = function( params ){
		var _requires = globals.requires;
		_requires['network'].connect({
			'method': 'getTiker',
			'post': {},
			'callback': function( result ){
				globals.tiker = result;
				if( params && params.callback ) params.callback(result);
			},
			'onError': function(error){
			}
		});
	};
	
	this.to = function( type, quantity, currency, isUpdate ){
		if( type === 'XCP' ){
			var price = globals.tiker[currency].last;
			var symbol = globals.tiker[currency].symbol;
			var xcp_btc = globals.tiker['XCP'].last;
			return '{0}{1}'.format(symbol, (quantity * price * xcp_btc).toFixed2());
		}
		else{
			var price = globals.tiker[currency].last;
			var symbol = globals.tiker[currency].symbol;
			return '{0}{1}'.format(symbol, (quantity * price).toFixed2());
		}
	};
	
	return this;
}());