var Q = require("q");
var Pledge = require("../pledge");
var Email = require("../email");
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {

    init: function(app){

        // Create customer, then create pledge, and send user to page
        app.post("/pay/stripe",function(req,res){

            var stripeToken = req.body.stripeToken;
            stripe.customers.create({
                card: stripeToken,
                description: req.backer_email
            }).then(function(customer){

                Pledge.create({
                    backer_name: req.body.backer_name,
                    backer_email: req.body.backer_email,
                    pledge_split: req.body.pledge_split,
                    pledge_total: req.body.pledge_total,
                    payment_method: "stripe",
                    payment_data: {
                        customer: customer
                    }
                }).then(function(pledge){
                    Email.sendPledgeCreatedEmail(pledge); // Send email
                    res.redirect("/pledge/"+pledge._id); // Redirect to Pledge's Page
                });

            });

        });

    },

    refundPledge: function(pledge,options){
        // There's no refunding to do!
        // Credit Card will never take anything that's not claimed
        return Q(true);
    },

    claimPledge: function(pledge,stageName){
        
        // That stage and backer's card
        var chargeAmount = pledge.stages[stageName].amount;
        var customerID = pledge.payment.data.customer.id;

        // Promise to charge that backer that amount
        return stripe.charges.create({
            amount: chargeAmount * 100, // amount in cents, again
            currency: 'usd',
            customer: customerID
        });

    }

};