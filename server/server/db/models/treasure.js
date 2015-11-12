'use strict'

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    coords: {
        type: String,
        required: true
    },
    value: {
        type: String
    },
    hider: {
        type: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
    finder: {
        type: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    },
     time: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Treasure', schema);