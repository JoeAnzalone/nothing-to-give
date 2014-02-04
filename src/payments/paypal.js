// Import Libraries
var Q = require('q');
var request = require('request');
var Pledge = require("../pledge");
var Email = require("../email");
//var ipn = require('paypal-ipn');
var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGO_URI = process.env.MONGO_URI;

// Environment Variables
var PAYPAL_ENDPOINT = process.env.PAYPAL_ENDPOINT;
var PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
var PAYPAL_SECRET = process.env.PAYPAL_SECRET;
var DOMAIN_NAME = process.env.DOMAIN_NAME;

module.exports = {

    init: function(app){

        // Because Paypal sucks.
        var _tempStorage = {};

        // Paypal - Pledge What You Want
        app.post("/pay/paypal",function(req,res){

            // Vars to save because the Paypal REST API sucks SO MUCH
            var params = {
                backer_name: req.body.backer_name,
                backer_email: req.body.backer_email,
                pledge_total: req.body.pledge_total,
                pledge_split: req.body.pledge_split
            };

            // Get payment page & redirect to it.
            Q.fcall(_getOAuthToken).then(function(accessToken){

                // Save this for later. It's valid for 8 hours
                params.accessToken = accessToken;

                var deferred = Q.defer();
                request.post({
                    url: PAYPAL_ENDPOINT+"/v1/payments/payment",
                    headers: {
                        'Authorization': 'Bearer '+accessToken
                    },
                    json: {
                        "intent":"sale",
                        "redirect_urls":{
                            "return_url": DOMAIN_NAME + "/pay/paypal/success",
                            "cancel_url": DOMAIN_NAME
                        },
                        "payer":{
                            "payment_method":"paypal"
                        },
                        "transactions":[
                            {
                                "amount":{
                                    "total": req.body.pledge_total,
                                    "currency": "USD"
                                },
                                "description":"Nothing To Hide Backer"
                            }
                        ]
                    }
                },function(error,response,body){
                    if(error) return res.send("paypal error");
                    deferred.resolve(body);
                });
                return deferred.promise;

            }).then(function(sale){
                
                // Save params
                var paymentID = sale.id;
                var link = sale.links[1].href;
                var token = link.substr(link.indexOf("&token=")+7);
                params.paymentID = paymentID;
                _tempStorage[token] = params;

                // Redirect user
                res.redirect(link);

            });

        });

        // Paypal - Execute Payment & Create Pledge
        app.get("/pay/paypal/success",function(req,res){

            // Load them params
            var params = _tempStorage[req.query.token];

            // 1) Execute payment
            Q.fcall(function(){

                var deferred = Q.defer();
                request.post({
                    url: PAYPAL_ENDPOINT+"/v1/payments/payment/"+params.paymentID+"/execute/",
                    headers: {
                        "Authorization": "Bearer "+params.accessToken
                    },
                    json: {
                        "payer_id": req.query.PayerID
                    }
                },function(error,response,body){
                    if(error) return res.send("paypal error");
                    deferred.resolve(body);
                });
                return deferred.promise;

            // 2) Create pledge
            }).then(function(payment){
                return Pledge.create({
                    backer_name: params.backer_name,
                    backer_email: params.backer_email,
                    pledge_split: params.pledge_split,
                    pledge_total: params.pledge_total,
                    payment_method: "paypal",
                    payment_data: payment
                });

            // 3) Email & Redirect to pledge's page
            }).then(function(pledge){
                Email.sendPledgeCreatedEmail(pledge); // Send email
                res.redirect("/pledge/"+pledge._id);
            });

        });

    },

    refundPledge: function(pledge,options){
        
        var deferred = Q.defer();

        // Add up all the unclaimed stages
        var s = pledge.stages;
        var refundAmount = 0;
        refundAmount += s.demo.claimed ? 0 : s.demo.amount;
        refundAmount += s.alpha.claimed ? 0 : s.alpha.amount;
        refundAmount += s.beta.claimed ? 0 : s.beta.amount;
        refundAmount += s.done.claimed ? 0 : s.done.amount;
        refundAmount = refundAmount.toFixed(2);

        // The sale ID
        var saleID = pledge.payment.data.transactions[0].related_resources[0].sale.id;

        // Partial refund
        Q.fcall(_getOAuthToken).then(function(accessToken){
            request.post({
                url: PAYPAL_ENDPOINT+"/v1/payments/sale/"+saleID+"/refund",
                headers: {
                    'Authorization': 'Bearer '+accessToken
                },
                json: {
                    "amount": {
                        "total": refundAmount,
                        "currency": "USD"
                    }
                }
            },function(error,response,body){
                console.log(body);
                if(body.state!="completed") return;
                deferred.resolve(body);
            })
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

var _getOAuthToken = function(){
    var deferred = Q.defer();
    request.post({
        url: PAYPAL_ENDPOINT+"/v1/oauth2/token",
        auth:{
            user:PAYPAL_CLIENT_ID,
            pass:PAYPAL_SECRET,
            sendImmediately:true
        },
        form: {
            "grant_type": "client_credentials"
        }
    },function(error,response,body){
        if(error) return res.send("oauth error");
        var creds = JSON.parse(body);
        deferred.resolve(creds.access_token);
    });
    return deferred.promise;
};