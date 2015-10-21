ChatLines = new Meteor.Collection('chatlines');
RideInfo = new Meteor.Collection('rideinfo');
Requests = new Meteor.Collection('requests');
Statuses = new Meteor.Collection('statuses');
//Geolocations = new Mongo.Collection('geolocations').createIndex({uid: 1, loc: "2dsphere" });
Geolocations = new Mongo.Collection('geolocations');