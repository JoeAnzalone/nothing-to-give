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
            from: process.env.REPLY_TO_EMAIL,
            subject: 'Thank you for backing Nothing To Hide!',
            text: 'Howdy '+pledge.backer.name+',\n\n'+
                'I\'m glad you\'re on board for this adventure in open source, open design, and open funding. '+
                'Exciting things are coming your way, so keep your eyes peeled! Although not literally.\n\n'+
                'Feel free to reply to me, if you\'ve got questions or just want to say hi.\n\n'+
                'Your progress pledge page: '+DOMAIN_NAME+'/pledge/'+pledge._id+'\n\n'+
                'Cheers,\n~Nicky Case'
        });
    },

    sendPledgeClaimedEmail: function(pledge){
		return Email.sendEmail({
            to: pledge.backer.email,
            from: process.env.REPLY_TO_EMAIL,
            subject: 'Part of your Progress Pledge for Nothing To Hide has been claimed.',
            text: 'Howdy '+pledge.backer.name+',\n\n'+
                'The "End of Campaign" stage of your pledge has been claimed! '+
                'Thanks for sticking with me, I promise this\'ll be great. Feel free to reply anytime!\n\n'+
                'Your Progress Pledge page: '+DOMAIN_NAME+'/pledge/'+pledge._id+'\n\n'+
                'Cheers,\n~Nicky Case'
        });
    }

};
module.exports = Email;