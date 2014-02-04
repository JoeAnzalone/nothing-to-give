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
                    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
                    campaign: campaign
                });
        	});
        });

    }

};