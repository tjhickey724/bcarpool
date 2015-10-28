Template.tripinfo.helpers({
	trips: function(){
		var sts = Statuses.find({driverId:Meteor.userId()}, {sort:{when:-1}});
		sts.forEach(function(st, index){
			var passengerInfo = RideInfo.findOne({uid:st.riderId}, {});
			var trip = {name: passengerInfo.who, 
					phone: passengerInfo.phone, 
					dest: passengerInfo.destAddress, 
					when: st.when};
			Trips.insert(trip);
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