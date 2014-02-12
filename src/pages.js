var Q = require("q");
var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGO_URI = process.env.MONGO_URI;

module.exports = {

    init: function(app){

    	// Homepage
        app.get("/",function(req,res){
            _getCampaignPledges().done(function(pledges){
                res.render("Campaign.ejs",{
                    pledges: pledges,
                    campaign: {
                        goal: 40000 // Hard coded
                    }
                });
            });
        });

        // Pledge Page
        app.get("/pledge",function(req,res){
            //_getCampaignPledges().done(function(stats){
            res.render("PledgeCreate.ejs",{
                //pledges: pledges,
                STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY
            });
            //});
        });

        // Just the campaign (test purposes)
        app.get("/campaign",function(req,res){
            res.render("Campaign.ejs",{
                pledges: [],
                campaign:{ goal:0 }
            });
        });

        // Helper - get stats
        var _getCampaignPledges = function(){
            var deferred = Q.defer();
            mongo.connect(MONGO_URI, function(err, db) {
                if(err){ db.close(); return console.error(err); }
                db.collection('pledges').find({cancelled:false}).toArray(function(err,pledges){
                    db.close();
                    if(err) { return console.error(err); }
                    deferred.resolve(pledges);
                });
            });
            return deferred.promise;
        }

    }

};