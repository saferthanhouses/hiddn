'use strict';
var router = require('express').Router();
var Treasure = require('mongoose').model('Treasure')
var _ = require('lodash');

var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};

// add Authentication to routes

router.param('id', function(req, res, next, id){
	Treasure.findById(id)
		.then(function(treasure){
			if (!treasure) {
				throw new Error('not found')
			}
			req.treasure = treasure;
			next();
		})
		// .catch(next(error));
		.then(null, next);
})


router.get('/', function (req, res, next) {
	console.log("session?", req.session);
	Treasure.find({}).then(function(treasure){
		console.log("Treaure", treasure);
		res.json(treasure)
		next();
	})
});

router.get('/:id', function(req, res, next){
	res.json(req.treasure);
})

router.put('/:id', function(req, res, next){
	_.extend(req.treasure, req.body);
	req.treasure.save()
		.then(function(data){
			res.json(data);
		})
		// .catch(next(error));
	.then(null, next);
})

router.post('/', function(req, res, next){
	Treasure.create(req.body)
		.then(function(data){
			console.log("treasure created", data);
			res.status(201).json(data);
		})
	.then(null, next);
})

router.delete('/:id', function(req, res, next){
	req.treasure.remove()
		.then(function() {
			res.status(204);
			res.end()
		})
		// .catch(next(error));
	.then(null, next);
})

module.exports = router;