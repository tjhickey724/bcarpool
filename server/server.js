Meteor.startup(function() {
  //Geolocations._ensureIndex({loc: "2dsphere"})
});

if (Meteor.isServer) {
  // This code only runs on the server
   Meteor.publish("rideinfo", function (som) {
   	//var uids = findRelevantUID(this.userId);
   	//console.log(this.userId + ' ' + RideInfo.find({uid: {$in:uids}}, {}).fetch().length);
    //return RideInfo.find({uid: {$in:uids}});
    var self = RideInfo.findOne({uid: this.userId}, {});
    if (self != undefined){
    	return RideInfo.find({$or:[{$and:[
	   		{status1: {$ne: self.status1}},
	   		{direction: self.direction}
	   		]}, {uid: this.userId}]});
  	} else {
  		return []
  	}
  });

   Meteor.publish("requests", function () {
    return Requests.find({$or:
    		[{senderId: this.userId},
    		{receiverId: this.userId}]
    	});
  });

   Meteor.publish("trips", function () {
    return Trips.find({$or:
    		[{driverId: this.userId},
    		{passengerIds: {$in: [this.userId] }}]});
  });

   Meteor.publish("historys", function () {
    return Historys.find({uid: this.userId});
  });

   Meteor.publish("geolocations", function (som) {
   	var uids = findRelevantUID(this.userId);
    return Geolocations.find({uid:{$in:uids}}, {});
  });

   Meteor.publish("destinations", function () {
   	var uids = findRelevantUID(this.userId);
    return Destinations.find({uid:{$in:uids}}, {});
  });

   function findRelevantUID(userId){
   	var self = RideInfo.findOne({uid: userId}, {});
   	var uids = [];
   	if (self != undefined){
	   	var rides = RideInfo.find({$and:[
	   		{status1: {$ne: self.status1}},
	   		{direction: self.direction}
	   		]},{});
	   	rides.forEach(function(ride, index){
	   		uids.push(ride.uid);
	   	});
	   	uids.push(userId);
	}
   	return uids
   }
}

Meteor.methods({
	getRideInfo: function (userId) {
		if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
		return RideInfo.findOne({uid:userId}, {});
	},
	getDestInfo: function (userId) {
		if (! Meteor.userId()) {
	       throw new Meteor.Error("not-authorized");
	    }
		return Destinations.findOne({uid: userId}, {});
	},
	getTrip: function (driverId){
		if (! Meteor.userId()) {
	       throw new Meteor.Error("not-authorized");
	    }
	    return Trips.findOne({driverId: driverId}, {});
	},
    updateGeoloc: function (geoloc) {
      // Make sure the user is logged in before inserting a task
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      var geolocId;
	  if (typeof Geolocations.findOne({uid: Meteor.userId()}, {}) != "undefined" ) {
			  var geolocation = Geolocations.findOne({uid: Meteor.userId()}, {});
			  geolocId = geolocation._id;
			  Geolocations.update({_id: geolocation._id}, {$set: geoloc});
			//Geolocations.update({_id: "h7jbTPQebyweWZQq3"}, {$set: {uid: "o7SXY5X5qKxx5YE7K", loc:{type: "Point", coordinates:[42.3, -71.1]}}});
		  } else {
			  geolocId = Geolocations.insert(geoloc);

		  }
	  return geolocId;
	 },
	 updateDest: function (destination) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	     var destId;
	 	if (typeof Destinations.findOne({uid: Meteor.userId()}, {}) != "undefined" ) {
	          var dest = Destinations.findOne({uid: Meteor.userId()}, {});
	          destId = dest._id;
	          Destinations.update({_id: dest._id}, {$set: destination});
	       } else {
	           destId = Destinations.insert(destination);
	      }
	     return destId;
	 },
	 updateRideInfo: function (id, ride) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	     RideInfo.update({_id:id}, {$set:ride});
	     return id;
	 },
	 updateTrip: function(id, trip){
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	      Trips.update({_id:id}, {$set:trip});
	 },
	 checkAndUpdateRideInfo: function (ride) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	     var rideId;
	    if (typeof RideInfo.findOne({uid:Meteor.userId()}, {}) != "undefined"){
	       rideId = RideInfo.findOne({uid:Meteor.userId()}, {})._id;
           RideInfo.update({_id:rideId}, {$set:ride});
        } else {
           rideId = RideInfo.insert(ride);
        }
        return rideId;
	 },
	 updateRequest: function (id, request) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	    Requests.update({_id:id}, {$set:request});
	    return id;
	 },
	 insertRequest: function (request) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	     var reqId = Requests.insert(request);
	     return reqId;
	 },
	 insertTrip: function (trip) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	     var tripId = Trips.insert(trip);
	     return tripId;
	 },
	 insertHistory: function (history) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	     var historyId = Historys.insert(history);
	    return historyId;
	 },
	 insertStatus: function (sts) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	     var stsId = Statuses.insert(sts);
	    return stsId;
	 },
	 logoutClear: function (ids) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	    if (ids.length == 5) {
		    RideInfo.remove(ids[0]);
	        Geolocations.remove(ids[1]);
	        Destinations.remove(ids[2]);
	        Requests.remove(ids[3]);
	        Statuses.remove(ids[4]);
	        return "success";
    	} else {
    		return "fail";
    	}

	 },
   removeRideInfo: function(id) {
     if (! Meteor.userId()) {
 	        throw new Meteor.Error("not-authorized");
 	    }
      RideInfo.remove(id);
      return "success";
   },
	 removeGeoloc: function (id) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	      Geolocations.remove(id);
	      return "success";
	 },
	 removeDest: function (id) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	      Destinations.remove(id);
	      return "success";
	 },
	 removeRequest: function (id) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	      Requests.remove(id);
	      return "success";
	 },
	 removeStatus: function (id) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	      Statuses.remove(id);
	      return "success";
	 },
	 removeTrip: function (id) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	    Trips.remove(id);
	    return "success";
	 },
	 removeHistory: function (id) {
	 	if (! Meteor.userId()) {
	        throw new Meteor.Error("not-authorized");
	      }
	    Historys.remove(id);
	    return "success";
	 }
});
