module.exports = (function() {
	var self = {};
	
	self.getTiker = function( params ){
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
	
	self.to = function( type, quantity, currency, digit ){
		if( digit == null ) digit = 2;
		if( type === 'XCP' ){
			var price = globals.tiker[currency].last;
			var symbol = globals.tiker[currency].symbol;
			var xcp_btc = globals.tiker['XCP'].last;
			return '{0}{1}'.format(symbol, (quantity * price * xcp_btc).toFixed2(digit));
		}
		else{
			var price = globals.tiker[currency].last;
			var symbol = globals.tiker[currency].symbol;
			return '{0}{1}'.format(symbol, (quantity * price).toFixed2(digit));
		}
	};
	
	return self;
}());