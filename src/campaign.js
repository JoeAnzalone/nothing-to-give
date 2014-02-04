var Q = require("q");
var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGO_URI = process.env.MONGO_URI;

module.exports = {

    getStats: function(app){

		var deferred = Q.defer();

		mongo.connect(MONGO_URI, function(err, db) {
            if(err){ return console.error(err); }
            
            db.collection('pledges').aggregate([
                {$match: {cancelled:false}},
                {$group: {
                    _id:'campaign',
                    demo:{$sum:'$stages.demo.amount'},
                    alpha:{$sum:'$stages.alpha.amount'},
                    beta:{$sum:'$stages.beta.amount'},
                    done:{$sum:'$stages.done.amount'},
                    backers:{$sum:1}
                }}
            ],function(err,results){
            	
                if(err) { return console.error(err); }
                db.close();
            
                var campaign = results[0] || {};
                campaign.goal = 40000; // HARD CODED
                deferred.resolve(campaign);

            });

        });

        return deferred.promise;

    }

};