'use strict';
var router = require('express').Router();
var User = require('mongoose').model('User');
var Maps = require('mongoose').model('Maps');
var _ = require('lodash');

var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};


//signup a new user - directed here from signupController
router.post('/signup', function(req, res, next){
	User.create(req.body)
	.then(function(user){
		res.status(201).json(user);
	})
	.then(null, next);
})

router.param('id', function(req, res, next, id){
	User.findById(id).populate('found').exec(function(err, user){
			 if (err){
				next(err);
			} else {
			req.user = user;
			next();
			}
		})
		// .catch(next(error));
		.then(null, next);
})

router.get('/:id/found', function(req, res, next){
	console.log("req.user", req.user);
	res.json(req.user.found);
})

router.get('/:id/publishedMaps', function(req, res, next){
	Maps.find({'auther': req.user._id}).populate('treasure').exec(function(err, maps){
		if (err){
			next(err);
		} else {
			res.json(maps);
		}
	})
})

router.get('/:id/donatedMaps', function(req, res, next){
	Maps.find({'recipients': req.user._id}).populate('treasure').exec(function(err, maps){
		if (err){
			next(err);
		} else {
			res.json(maps);
		}
	})
})



module.exports = router;