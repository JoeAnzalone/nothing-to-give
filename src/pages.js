var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGO_URI = process.env.MONGO_URI;

module.exports = {

    init: function(app){

    	// Homepage
        app.get("/",function(req,res){
            mongo.connect(MONGO_URI, function(err, db) {
                if(err){ return console.error(err); }
                db.collection('pledges').find({cancelled:false}).toArray(function(err,pledges){
                    if(err) { return console.error(err); }
                    db.close();
                
                    res.render("Campaign.ejs",{
                        pledges: pledges,
                        campaign: {
                            goal: 40000 // Hard coded
                        }
                    });

                });
            });
        });

        // Just the campaign (test purposes)
        app.get("/campaign",function(req,res){
            res.render("Campaign.ejs",{
                pledges: [],
                campaign:{ goal:0 }
            });
        });

        // Pledge Page
        app.get("/pledge",function(req,res){
    		res.render("PledgeCreate.ejs",{
                STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY
            });
        });

    }

};