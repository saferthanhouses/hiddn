'use strict';
var router = require('express').Router();

var _ = require('lodash');

var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};


router.param('id', function(req, res, next, id){
	User.findById(id).populate('found')
		.then(function(user){
			if (!user) {
				throw new Error('not found')
			}
			req.user = user;
			next();
		})
		// .catch(next(error));
		.then(null, next);
})


router.get('/:id/treasure', function(req, res, next){
	req.json(req.user);
})

router.get('/secret-stash', ensureAuthenticated, function (req, res) {
});

module.exports = router;