var Email = require("./email");
var Q = require("q");
var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGO_URI = process.env.MONGO_URI;

module.exports = {

    init: function(app){

        // For extra security, don't allow this when it's online
        if(process.env.ALLOW_ADMIN!=="yes") return;

    	// Admin Account
        var express = require('express');
        var auth = express.basicAuth(function(user, pass) {
            return user===process.env.ADMIN_USER && pass===process.env.ADMIN_PASS;
        });

        // Admin Dashboard: All pledges
        app.get("/admin",auth,function(req,res){
            
            mongo.connect(MONGO_URI, function(err, db) {
                if(err) { return console.error(err); }
                db.collection('pledges').find().sort({timestamp:-1}).toArray(function(err,pledges){
                    if(err) return console.error(err);
                    res.render("AdminDashboard.ejs",{
                        pledges: pledges
                    });
                    db.close();
                });
            });

        });

        // Admin: Get All Entries
        app.get("/admin/api",auth,function(req,res){

            // Include payment data?...
            var fields = req.query.paymentData ? {} : {"payment.data":0};

            // Return all of 'em
            mongo.connect(MONGO_URI, function(err,db) {
                if(err) { return console.error(err); }
                db.collection('pledges').find({},fields).sort({_id:-1}).toArray(function(err,pledges){
                    if(err) return console.error(err);
                    res.send("<pre>"+JSON.stringify(pledges,null,4)+"</pre>");
                    db.close();
                });
            });
        });

        // Admin: Charge a pledge
        app.get("/admin/claim/:id",auth,function(req,res){

            var _id = new ObjectID(req.params.id);
            var query = {_id:_id};
            var stageName = req.query.stage;

            mongo.connect(MONGO_URI, function(err, db) {
                if(err){ return console.error(err); }
                
                db.collection('pledges').find(query).toArray(function(err,results){
                    if(err) { return console.error(err); }
                    
                    var pledge = results[0];
                    if(!pledge){
                        db.close();
                        return res.send("no such pledge");
                    }

                    // Only if pledge is not cancelled, and stage unclaimed
                    if(pledge.cancelled){
                        db.close();
                        return res.send("pledge already cancelled");
                    }
                    var stage = pledge.stages[stageName];
                    if(stage.claimed){
                        db.close();
                        return res.send("pledge already claimed");
                    }

                    // Pledge claim with that processor
                    var paymentClass = require('./payments/'+pledge.payment.method);
                    paymentClass.claimPledge(pledge,stageName).then(function(){

                        // The update query
                        var updateQuery = { $set:{} };
                        updateQuery["$set"]["stages."+stageName+".claimed"] = true;

                        // Mark as claimed
                        db.collection('pledges').update(
                            query, updateQuery,
                            function(err){
                                if(err) return db.close();

                                // Email the backer
                                Email.sendPledgeClaimedEmail(pledge);

                                // Show page
                                var chargeAmount = pledge.stages[stageName].amount;
                                res.send(pledge.backer.name+" has been charged $"+chargeAmount.toFixed(2)+"! <pre></pre>");

                            }
                        );

                    });

                });
            });

        });

    }

};