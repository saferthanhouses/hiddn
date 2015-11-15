'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	title: String,
    auther: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    treasure: [{type: mongoose.Schema.Types.ObjectId, ref: 'Treasure'}],
    recipients: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    time: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Maps', schema);