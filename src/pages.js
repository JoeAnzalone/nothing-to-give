var Campaign = require("./campaign");

module.exports = {

    init: function(app){

    	// Homepage
        app.get("/",function(req,res){
        	Campaign.getStats().done(function(campaign){
        		res.render("Campaign.ejs",{
                    campaign: campaign
                });
        	});
        });

        // Pledge Page
        app.get("/pledge",function(req,res){
        	Campaign.getStats().done(function(campaign){
        		res.render("PledgeCreate.ejs",{
                    DOMAIN_NAME: process.env.DOMAIN_NAME,
                    PAYPAL_API: process.env.PAYPAL_API,
                    PAYPAL_EMAIL: process.env.PAYPAL_EMAIL,
                    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
                    campaign: campaign
                });
        	});
        });

    }

};