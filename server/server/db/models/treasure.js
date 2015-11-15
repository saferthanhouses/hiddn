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
    hider: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    finder: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
     time: {
        type: Date,
        default: Date.now
    },
    map: {type: mongoose.Schema.Types.ObjectId, ref: 'Maps'}
});

mongoose.model('Treasure', schema);