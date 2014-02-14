module.exports = function(){

	// Initialize an Express app & listen
    var express = require('express');
    var app = express();
    app.use('/', express.static('./static'));
    app.use(express.bodyParser());
    var port = process.env.PORT || 1337;
    app.listen(port);
    console.log("App running on http://localhost:"+port);

    // Pages - campaign, pledge creation
    require('./pages').init(app);

    // Pledge - pledge view, create, and cancel
    require('./pledge').init(app);

    // Admin - view all pledges & claim 'em
	require('./admin').init(app);

	// Payments - credit card, paypal, bitcoin
	require('./payments').init(app);

};