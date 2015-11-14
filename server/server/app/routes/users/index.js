'use strict';
var router = require('express').Router();
var User = require('mongoose').model('User');
var _ = require('lodash');

var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};


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

module.exports = router;