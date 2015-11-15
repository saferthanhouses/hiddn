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
var Maps = Promise.promisifyAll(mongoose.model('Maps'));

var seedUsers = function (treasure) {

    var users = [
        {
            email: 'testing@fsa.com',
            password: 'password',
            found: treasure
        },
        {
            email: 'obama@gmail.com',
            password: 'potus',
            found: treasure
        }
    ];

    return User.createAsync(users);

};

var seedTreasure = function(user) {
    var treasure = [
        {
            coords: "40.7051951 -74.0090403",
            value: "GOLD",
        },
        {
            coords: "41.7051951 -74.0090403",
            value: "SILVER"
        }
    ]

    return Treasure.createAsync(treasure);
}

var seedMaps = function(treasure, user) {
    console.log("treasure", treasure)
    var map = 
        [{
            title: "testMap",
            auther: user[0]._id,
            treasure: treasure,
            recipients: [user[1]._id]
        }]

    return Maps.createAsync(map);
}

var treasures = {};

connectToDb.then(function (db) {
    var users;
    db.db.dropDatabase()
    .then(function(){
        return seedTreasure();
    }).then(function(treasure){
        treasures.treasure = treasure.map(function(t){
            return t._id;
        })
        console.log("treasure", treasures.treasure);
        return seedUsers(users);
    }).then(function(users){
        return seedMaps(treasures.treasure, users)
    }).then(function(){
        console.log("db seeded");
        process.exit(0);
    }).catch(function(err){
        console.log(err);
        process.exit(1);
    });
});