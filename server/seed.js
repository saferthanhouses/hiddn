/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');
var User = Promise.promisifyAll(mongoose.model('User'));
var Treasure = Promise.promisifyAll(mongoose.model('Treasure'));

var seedUsers = function () {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            password: 'potus'
        }
    ];

    return User.createAsync(users);

};

var seedTreasure = function() {
    var treasure = [
        {
            coords: "40.7051951 -74.0090403",
            value: "GOLD"
        },
        {
            coords: "41.7051951 -74.0090403",
            value: "SILVER"
        }
    ]

    return Treasure.createAsync(treasure);
}

connectToDb.then(function (db) {
    db.db.dropDatabase()
    .then(function(){
        return seedUsers();
    }).then(function(){
        return seedTreasure();
    }).then(function(treasure){
        // this.reviews = _indexBy(reviews, '')
        console.log("db seeded");
        process.exit(0);
    }).catch(function(err){
        console.log(err);
        process.exit(1);
    });
});