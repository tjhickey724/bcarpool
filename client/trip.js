Template.tripinfo.helpers({
	trips: function(){
		var trips = Trips.find({uid: Meteor.userId()},{sort:{when:-1}});
		var res = [];
		trips.forEach(function(trip, index){
			trip.when = moment(trip.when).format('llll');
			res.push(trip);
		});
		return res;
	}
})
/*
Template.tripcell.events({
	"click .deltrip": function(){
		console.dir(this);
		Trips.remove(this._id);
	}
})
*/