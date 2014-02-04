module.exports = {
	init:function(app){
	    require('./payments/stripe').init(app);
	    require('./payments/coinbase').init(app);
	}
};