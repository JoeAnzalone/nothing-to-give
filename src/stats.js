// Import libraries
var mongo = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGO_URI = process.env.MONGO_URI;

module.exports = {
    init: function(app){

        // For campaign stats
        app.get("/api/campaign",function(req,res){
            mongo.connect(MONGO_URI, function(err, db) {
                if(err){ db.close(); return console.error(err); }
                db.collection('pledges').aggregate({
                    $group:{
                        _id:'campaign',
                        demo:{$sum:'$stages.demo.amount'},
                        alpha:{$sum:'$stages.alpha.amount'},
                        beta:{$sum:'$stages.beta.amount'},
                        done:{$sum:'$stages.done.amount'},
                        backers:{$sum:1}
                    }
                },function(err,results){
                    db.close();
                    if(err) { return console.error(err); }
                    var r = results[0];
                    res.send(JSON.stringify({
                        
                        goal: 40000, // Hard Coded
                        total: r.demo+r.alpha+r.beta+r.done,
                        backers: r.backers,

                        demo: r.demo,
                        alpha: r.alpha,
                        beta: r.beta,
                        done: r.done

                    }));
                });
            });
        });

    }
};