// Import Libraries
var Q = require('q');
var request = require('request');
var Pledge = require("../pledge");
var Email = require("../email");
var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGO_URI = process.env.MONGO_URI;

// Environment Variables
var COINBASE_API_KEY = process.env.COINBASE_API_KEY;
var COINBASE_SECRET = process.env.COINBASE_SECRET;
var DOMAIN_NAME = process.env.DOMAIN_NAME;

module.exports = {

    init: function(app){

        // COINBASE - Pledge What You Want
        app.post("/pay/coinbase",function(req,res){

            request.post({
                url: "https://coinbase.com/api/v1/buttons",
                json: {
                    "api_key": COINBASE_API_KEY,
                    "button": {
                        
                        // Campaign info
                        "name": "Nothing To Hide",
                        "description": "Your progress pledge for the Nothing To Hide fundraiser",
                        "type": "buy_now",
                        "style": "custom_large",

                        // Pledge info
                        "price_string": req.body.pledge_total,
                        "price_currency_iso": "USD",
                        "custom": JSON.stringify(req.body),

                        // URLs
                        "callback_url": DOMAIN_NAME+"/pay/coinbase/ipn?secret="+COINBASE_SECRET, // IPN
                        "success_url": DOMAIN_NAME+"/pay/coinbase/success" // Redirect backer

                    }
                }
            },function(error,response,body){
                if(error||!body.success){
                    console.log(error);
                    console.log(body);
                    return res.send("error!");
                }
                res.redirect("https://coinbase.com/checkouts/"+body.button.code);
            });

        });

        // COINBASE - Instant Payment Notification
        app.post("/pay/coinbase/ipn",function(req,res){

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
        app.get("/pay/coinbase/success",function(req,res){

            var query = {"payment.data.order.id":req.query.order.id};
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
            });

        });

    },

    refundPledge: function(pledge,options){

        var deferred = Q.defer();

        // The specified return address
        var bitcoinAddress = options.bitcoin_address;

        // Add up all the unclaimed stages
        var s = pledge.stages;
        var refundAmount = 0;
        refundAmount += s.demo.claimed ? 0 : s.demo.amount;
        refundAmount += s.alpha.claimed ? 0 : s.alpha.amount;
        refundAmount += s.beta.claimed ? 0 : s.beta.amount;
        refundAmount += s.done.claimed ? 0 : s.done.amount;

        // Send/Refund the USD EQUIVALENT to that address
        request.post({
            url: "https://coinbase.com/api/v1/transactions/send_money",
            json:{
                "api_key": COINBASE_API_KEY,
                "transaction": {
                    
                    "to": bitcoinAddress,
                    "notes": "Cancelled Pledge - refund of unclaimed pledge amount",

                    // SWEET JEEZUS, DO NOT MESS THIS UP. IT'S US DOLLARS. 
                    "amount_string": refundAmount,
                    "amount_currency_iso": "USD"

                }
            }
        }, function(error,response,body){
            if(!body.success){ return console.log("=== ERROR ==="); }
            deferred.resolve(body);
        });

        // Promise it'll be refunded
        return deferred.promise;

    },

    claimPledge: function(pledge,stageName){
        // The upside with the escrow thing is there's nothing to do to claim it
        // since you, y'know, already have it.
        return Q(true);
    }

};