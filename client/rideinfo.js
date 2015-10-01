Template.rideinfo.helpers({
	rideto: function(){return RideInfo.find({direction:"to"})},
	ridefrom: function(){return RideInfo.find({direction:"from"})}
	
})
