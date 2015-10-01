Template.rideinfo.helpers({
	rideto: function(){
		return RideInfo.find(
			{direction:"to"},
			{sort:{location:1,status1:1}}
		)},
	ridefrom: function(){
		return RideInfo.find(
			{direction:"from"},
			{sort:{location:1,status1:1}}
		)}
	
})

Template.ridetorow.events({
	"click .delride": function(event){
		console.dir(this);
		RideInfo.remove(this._id);
	}
})