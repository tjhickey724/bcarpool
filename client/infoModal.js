var rideInfo;
var destInfo;

Template.infomodal.created = function (){
	rideInfo = this.data[0];
	destInfo = this.data[1];
}

Template.infomodal.onCreated(function(){
	Meteor.subscribe('requests');
	Meteor.subscribe('destinations');
	Meteor.subscribe('rideinfo');
});



Template.infomodal.helpers({
	personInfo:function () {
        if (destInfo == undefined) {
        	if (Session.get("direction") == "to"){
        		destInfo = {destAddress: "Brandeis University", when: rideInfo.when};
        	} else {
        		destInfo = {destAddress: "N/A", when: "N/A"};
        	}
        }
        return {name: rideInfo.who, go: destInfo.destAddress, phone: rideInfo.phone, carSpace: RideInfo.findOne({uid:rideInfo.uid}, {}).carSpace, time: moment.duration(moment(rideInfo.when).diff(moment())).humanize(true)}	
    },
    isDriver: function(){
    	return rideInfo.status1 == "driver";
    },
    isSelf: function(){
    	return Meteor.userId() == rideInfo.uid;
    },
	requestButtonValue: function(){
		if(rideInfo.status1 == "rider"){
			return "Pick Up";
		} else {
			return "Get A Ride";
		}
	},
	shouldShowPhone: function(){
		if (Requests.find({$and: [{senderId: Meteor.userId()}, {receiverId: rideInfo.uid}, {theStatus: "confirmed"}]}, {}).count() != 0 || Requests.find({$and: [{senderId: rideInfo.uid}, {receiverId: Meteor.userId()}, {theStatus: "confirmed"}]}, {}).count() != 0){
				return true;
			} else {
				return false;
			}
	},
	shouldShowRequest: function(){
		if (Requests.find({$and: [{senderId: Meteor.userId()}, {receiverId: rideInfo.uid}, {theStatus: "confirmed"}]}, {}).count() != 0 || Requests.find({$and: [{senderId: rideInfo.uid}, {receiverId: Meteor.userId()}, {theStatus: "confirmed"}]}, {}).count() != 0){
				return false;
			} else if (Requests.find({$and: [{senderId: Meteor.userId()}, {receiverId: rideInfo.uid}, {theStatus: "pending"}]}, {}).count() != 0 || Requests.find({$and: [{senderId: rideInfo.uid}, {receiverId: Meteor.userId()}, {theStatus: "pending"}]}, {}).count() != 0){
				return false;
			} else {
				return true;
			}
	}
});


Template.infomodal.events({
	"click #request": function(){
		var msg = "";
		var senderIsRider = true;
		if (rideInfo.status1 == "driver") {
			msg = "Can you pick me up?";
			senderIsRider = true;
			var driverInfo = RideInfo.findOne({uid: rideInfo.uid}, {});
		} else if (rideInfo.status1 == "rider") {
			msg = "I want to pick you up.";
			senderIsRider = false;
			var driverInfo = RideInfo.findOne({uid: Meteor.userId()}, {});
		}
		/*	
		if (driverInfo.carSpace > 0) {
			driverInfo.carSpace -= 1;
		} else {
			driverInfo.carSpace = 0;
		}*/

		var space = 0;
		if (driverInfo.carSpace > 0) {
			space = driverInfo.carSpace - 1;
		}
		var driverId = driverInfo._id;

		Meteor.apply('updateRideInfo', [driverId, {carSpace: space}], [], function(err, result){
			if (!err) {
				// do something
			}
		});

		var request = {
			senderId: Meteor.userId(),
			receiverId: rideInfo.uid,
			message: msg,
			senderIsRider: senderIsRider,
			theStatus: "pending",
			when: new Date()
		};
		//Session.set('sessionId', request.sessionId);
		Meteor.apply('insertRequest', [request], [], function(err, result){
			if (!err) {
				Session.setPersistent("reqId", result);
				console.log(result + 'result');
				IonPopup.alert({
			      title: 'Success',
			      template: 'Request Sent!',
			      okText: 'Ok'
			    });
			}
		});
	},
	/*
	"click #phone": function(){
		IonPopup.alert({
	      title: rideInfo.who + '\'s' + " phone number",
	      template: rideInfo.phone,
	      okText: 'Got It.'
	    });
	},*/
	"click #dest": function(){

	}
});