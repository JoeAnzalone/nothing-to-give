// Import libraries
var Q = require("q");
var crypto = require('crypto');
var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGO_URI = process.env.MONGO_URI;

// Env Vars
var CRYPTO_SALT = process.env.CRYPTO_SALT;

module.exports = {

    init: function(app){

    	// Get Pledge data
        app.get("/pledge/:id",function(req,res){

            var _id = new ObjectID(req.params.id);
            var query = {_id:_id};

            mongo.connect(MONGO_URI, function(err, db) {
                if(err){ return console.error(err); }
                db.collection('pledges').find(query).toArray(function(err,results){
                    if(err || results.length==0){ return res.send("no such pledge") }
                    var pledge = results[0];
                    res.render("PledgeView.ejs",{
                        pledge: pledge
                    });
                    db.close();
                });
            });

        });

        // Cancel Pledge
        app.post("/pledge/cancel/:id",function(req,res){

            var _id = new ObjectID(req.params.id);
            var query = {_id:_id};

            mongo.connect(MONGO_URI, function(err,db){
                if(err){ return console.error(err); }

                // Find that pledge
                db.collection('pledges').find(query).toArray(function(err,results){
                    if(err || results.length==0) { return console.error(err); }
                    var pledge = results[0];

                    // If already cancelled, then no
                    if(pledge.cancelled){
                        res.send("pledge already cancelled");
                        return db.close();
                    }

                    // Pledge refund with that processor
                    var paymentClass = require('./payments/'+pledge.payment.method);
                    paymentClass.refundPledge(pledge,req.body).then(function(){
                
                        // Change pledge status to Cancelled
                        db.collection('pledges').update(
                            query, { $set:{"cancelled":true} },
                            function(err){
                                if(err) deferred.reject(err);
                                db.close();

                                // Redirect to your dead pledge
                                res.redirect("/pledge/"+req.params.id);

                            }
                        );

                    });
                });
            });
        });

    },

    create: function(config){

        // Random hex for ID, to prevent guessing.
        var randomID = crypto.randomBytes(12).toString('hex');

        // Pledge to save
        var pledge = {
            _id: new ObjectID(randomID),
            timestamp: new ObjectID(),
            cancelled: false
        };

        // Backer data
        var backer = {
            name: config.backer_name,
            email: config.backer_email
        };
        pledge.backer = backer;

        // Payment
        var payment = {
            method: config.payment_method,
            data: config.payment_data
        };
        pledge.payment = payment;

        // Stages & amounts
        var ratios;
        //var isEscrow = (payment.method!="stripe"); // Paypal & Coinbase require escrow
        var stages = {
            demo: {amount:0, claimed:false}, //, paid:isEscrow },
            alpha: {amount:0, claimed:false}, //, paid:isEscrow },
            beta: {amount:0, claimed:false}, //, paid:isEscrow },
            done: {amount:0, claimed:false} //, paid:isEscrow }
        };
        switch(config.pledge_split){
            case "quarter": ratios = { demo:0.25, alpha:0.25, beta:0.25, done:0.25 }; break;
            case "half": ratios = { demo:0.50, alpha:0.00, beta:0.00, done:0.50 }; break;
            case "all": ratios = { demo:1.00, alpha:0.00, beta:0.00, done:0.00 }; break;
        }
        var total = parseFloat(config.pledge_total);
        stages.demo.amount = Math.round((ratios.demo*total)*100)/100;
        stages.alpha.amount = Math.round((ratios.alpha*total)*100)/100;
        stages.beta.amount = Math.round((ratios.beta*total)*100)/100;
        stages.done.amount = Math.round((ratios.done*total)*100)/100;
        pledge.stages = stages;

        // Promise to save this pledge
        var deferred = Q.defer();
        mongo.connect(MONGO_URI, function(err, db) {
            if(err) { return deferred.reject(err); }
            // Insert new entry
            db.collection('pledges').insert(pledge,function(err,inserted){
                if(err) { return deferred.reject(err); }
                deferred.resolve(pledge);
                db.close();
            });
        });
        return deferred.promise;

    }

};