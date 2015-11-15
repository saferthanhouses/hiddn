'use strict';
var router = require('express').Router();
var User = require('mongoose').model('User');
var Maps = require('mongoose').model('Maps');
var _ = require('lodash');


router.param('id', function(req, res, next, id){
	Maps.findById(id).populate('treasure').exec(function(err, map){
			 if (err){
				next(err);
			} else {
			req.map = map;
			next();
			}
		})
		// .catch(next(error));
		.then(null, next);
})

router.get('/:id/treasure', function(req, res, next){
	console.log("req.map", req.map);
	res.json(req.map);
})

module.exports = router;