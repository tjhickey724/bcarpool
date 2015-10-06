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
		)},
	//receive: function(){ return Meteor.userId() == Session.get('sessionId')[1]}
})

Template.ridetorow.events({
	"click .delride": function(event){
		console.dir(this);
		RideInfo.remove(this._id);
	},
	"click .call": function(event){
		alert(this.phone);
	},
	"click .request": function(event){
		var request = {
			sessionId: [Meteor.userId(), this.uid],
			message: "Can you pick me up?"
		};
		//Session.set('sessionId', request.sessionId);
		//Request.insert(request);
		alert("Request sent.");
	}
})

Template.ridetorow.helpers({
	delete:function(){ return this.uid==Meteor.userId() },
	match: function(){ return this.location == Session.get('currentLocation') && this.uid != Meteor.userId()}
})