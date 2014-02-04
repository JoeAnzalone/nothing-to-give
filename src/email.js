var sendgrid  = require('sendgrid')( process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD );
var DOMAIN_NAME = process.env.DOMAIN_NAME;
var Email = {

    sendEmail: function(email){
    	sendgrid.send(email, function(err, message) {
            if(err) console.log(message);
        });
    },

    sendPledgeCreatedEmail: function(pledge){
        return Email.sendEmail({            
            to: pledge.backer.email,
            from: 'nick@ncase.me',
            subject: 'Thank you for backing Nothing To Hide',
            text: 'Your progress pledge page: '+DOMAIN_NAME+'/pledge/'+pledge._id
        });
    },

    sendPledgeClaimedEmail: function(pledge){
		return Email.sendEmail({
            to: pledge.backer.email,
            from: 'nick@ncase.me',
            subject: 'Part of your Progress Pledge has been claimed.',
            text: 'The upfront stage of your pledge has been claimed!\n\n'+
                'Your card has been charged $'+pledge.stages.demo.amount.toFixed(2)+'\n\n'+
                'Details: '+DOMAIN_NAME+'/pledge/'+pledge._id
        });
    }

};
module.exports = Email;