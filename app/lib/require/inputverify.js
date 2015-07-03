module.exports = (function() {
	this.set = function( verifies ){
		this.verifies = verifies;
	};
	
	this.push = function( verify ){
		if( this.verifies == null ) this.verifies = new Array();
		this.verifies.push(verify);
	};
	
	this.unshift = function( verify ){
		if( this.verifies == null ) this.verifies = new Array();
		this.verifies.unshift(verify);
	};
	
	this.check = function(){
		for(var i = 0; i < this.verifies.length; i++ ){
			var verify = this.verifies[i];
			if( verify.type === 'number' ){
				if( isNaN(verify.target.value) ){
					return {target: verify.target, message: L('text_inputverify_number').format({ 'name': verify.name })};
				}
			}
			if( 'equal' in verify ){
				if( verify.target.value != verify.equal.value ) return {target: verify.target, message: L('text_inputverify_equal').format({ 'name': verify.name })};
			}
			if( 'over' in verify ){
				if( verify.over == 0 && verify.target.value.length <= 0 ){
					return {target: verify.target, message: L('text_inputverify_empty').format({ 'name': verify.name })};
				}
				if( verify.target.value.length < verify.over ){
					return {target: verify.target, message: L('text_inputverify_more').format({ 'name': verify.name, 'over': verify.over })};
				}
			}
			if( 'shouldvalue' in verify ){
				if( verify.target.value <= 0 ){
					return {target: verify.target, message: L('text_inputverify_shouldvalue').format({ 'name': verify.name })};
				}
			}
		}
		return true;
	};
	
	return this;
}());