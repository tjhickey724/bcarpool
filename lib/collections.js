/*_id | uid | who | phone | carSpace | status1 | direction | when*/
RideInfo = new Meteor.Collection('rideinfo');

/*_id | senderId | receiverId | message | senderIsRider | theStatus | when*/
Requests = new Meteor.Collection('requests');

/*_id | requestId | driverId | riderId | theStatus | when*/
Statuses = new Meteor.Collection('statuses');

/*_id | uid | partnerId | name | phone | dest | when*/
/*_id | driverId | passengerIds | when*/
Trips = new Meteor.Collection('trips');

/*_id | uid | partnerId | name | role | phone | dest | when*/
/*_id | uid | tripIds*/
Historys = new Meteor.Collection('historys');

/*_id | uid | loc*/
Geolocations = new Meteor.Collection('geolocations');

/*_id | uid | destGeoloc | destAddress | when*/
Destinations = new Meteor.Collection('destinations');

//Geolocations = new Mongo.Collection('geolocations').createIndex({uid: 1, loc: "2dsphere" });