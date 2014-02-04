// Import Libraries
var Q = require('q');
var request = require('request');
var Pledge = require("../pledge");
var Email = require("../email");
var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGO_URI = process.env.MONGO_URI;

// Environment Variables

module.exports = {

    init: function(app){

        // Paypal - Instant Payment Notification
        app.post("/pay/paypal/ipn",function(req,res){

            console.log(req.query);
            console.log(req.body);

            // Verify that the coinbase secret is correct
            if(req.query.secret!=COINBASE_SECRET) return res.send("nice try");

            // Create pledge from this, and email backer
            // (not redirect, coz this is the IPN)
            var order = req.body.order;
            var custom = JSON.parse(order.custom);
            Pledge.create({
                backer_name: custom.backer_name,
                backer_email: custom.backer_email,
                pledge_split: custom.pledge_split,
                pledge_total: custom.pledge_total,
                payment_method: "coinbase",
                payment_data: {
                    order: order
                }
            }).then(function(pledge){
                Email.sendPledgeCreatedEmail(pledge); // Send email
                res.send("success!"); // let Coinbase know it was a success!
            });

        });

        // COINBASE - Get the pledge ID
        app.get("/pay/paypal/success",function(req,res){

            res.send("<pre>"+JSON.stringify(req.body,null,4)+"</pre>");

            /*var query = {"payment.data.order.id":req.query.order.id};
            mongo.connect(MONGO_URI,function(err,db){
                if(err){ return console.error(err); }
                db.collection('pledges').find(query).toArray(function(err,results){
                    
                    if(err){ return console.error(err); }
                    db.close();

                    var pledge = results[0];
                    if(pledge){
                        res.redirect("/pledge/"+pledge._id);
                    }else{
                        // If IPN ain't instant...
                        res.send(
                            "Woops! Either the servers are still proceessing your pledge, "+
                            "or I messed up the code. Probably both. Please check back later, "+
                            "check your email, and shoot me a message at "+process.env.REPLY_TO_EMAIL+" "+
                            "if shenanigans persist. Thank you!"
                        );
                    }
                    
                });
            });*/

        });

    },

    refundPledge: function(pledge,options){
        var deferred = Q.defer();
        // Promise it'll be refunded
        return deferred.promise;
    },

    claimPledge: function(pledge,stageName){
        // The upside with the escrow thing is there's nothing to do to claim it
        // since you, y'know, already have it.
        return Q(true);
    }

};