Template.tripinfo.helpers({
	trips: function(){
		var sts = Statuses.find({driverId:Meteor.userId()}, {sort:{when:-1}});
		sts.forEach(function(st, index){
			var passengerInfo = RideInfo.findOne({uid:st.riderId}, {});
			var destination = Destinations.findOne({uid:st.riderId}, {});
			var trip = {name: passengerInfo.who, 
					phone: passengerInfo.phone, 
					dest: destination.destAddress, 
					when: st.when};
			Trips.insert(trip);
			Statuses.remove(st._id);
		});
		return Trips.find({},{sort:{when:-1}});
	}
})

Template.triprow.events({
	"click .deltrip": function(){
		console.dir(this);
		Trips.remove(this._id);
	}
})

Template.tripinfo.rendered = function(){
	if (Session.get("geolocInfoId") !== null || Session.get("geolocInfoId") != undefined){
    	 Geolocations.remove(Session.get("geolocInfoId"));
    	 Session.set("geolocInfoId", null);
    }
    if (Session.get("destInfoId") !== null || Session.get("destInfoId") != undefined){
    	Destinations.remove(Session.get("destInfoId"));
    	Session.set("destInfoId", null);
    }
    if (Session.get("reqId") !== null || Session.get("reqId") != undefined){
		Requests.remove(Session.get("reqId"));
		Session.set("reqId", null);
	}
}