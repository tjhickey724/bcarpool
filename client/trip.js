Template.tripinfo.helpers({
	trips: function(){
		return Trips.find({uid: Meteor.userId()},{sort:{when:-1}});
	}
})

Template.triprow.events({
	"click .deltrip": function(){
		console.dir(this);
		Trips.remove(this._id);
	}
})