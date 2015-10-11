var cursor = Requests.find();
cursor.observeChanges({
	added: function(id, object) {
		if (object.receiverId == Meteor.userId()) {
				if (object.theStatus == "pending") {
					var name = RideInfo.findOne({uid:object.senderId}, {}).who;
					var acceptance = confirm(name + " send you a request: \n" + object.message);
					if (acceptance) {
						object.theStatus = "confirmed";
						if (object.senderIsRider) {
							var sts = {
								requestId: id,
								driverId: object.receiverId,
								riderId: object.senderId,
								theStatus: "riding",
								when: new Date()
							};
							var driverInfo = RideInfo.findOne({uid: object.receiverId}, {});
						} else {
							var sts = {
								requestId: id,
								driverId: object.senderId,
								riderId: object.receiverId,
								theStatus: "riding",
								when: new Date()
							};
							var driverInfo = RideInfo.findOne({uid: object.senderId}, {});
						}
						Statuses.insert(sts);

						var driverId = driverInfo._id;
							delete driverInfo['_id'];
							driverInfo.carSpace -= 1;
							RideInfo.update({_id:driverId}, {$set:driverInfo});

					} else {
						object.theStatus = "rejected";
						if (object.senderIsRider) {
							var driverInfo = RideInfo.findOne({uid: object.receiverId}, {});
						} else {
							var driverInfo = RideInfo.findOne({uid: object.senderId}, {});
						}

						var driverId = driverInfo._id;
							delete driverInfo['_id'];
							driverInfo.carSpace += 1;
							RideInfo.update({_id:driverId}, {$set:driverInfo});
					}
					object.when = new Date();
					Requests.update({_id:id}, {$set:object});
				}
			
		}
	}
})


Template.statusinfo.helpers({
	statuses: function(){return Statuses.find({},{sort:{when:-1}})}
})

Template.statusrow.events({
	"click .delstatus": function() {
		console.dir(this);
		Statuses.remove(this._id);
	}
})


Template.requestinfo.helpers({
	received: function() {return typeof Requests.findOne({receiverId: Meteor.userId()}, {}) != "undefined" || typeof Requests.findOne({senderId: Meteor.userId()}, {}) != "undefined"},
	//received: function() {return Session.get("confirmed")},
	receivedContent: function(){
			var request1 = Requests.find({receiverId: Meteor.userId()}, {sort:{when:-1}});
			var request2 = Requests.find({senderId: Meteor.userId()}, {sort:{when:-1}});
			if (request1.count() != 0) {
				return request1;
			} else if (request2.count() != 0){
				return request2;
			} else {
				return null;
			}
	}
})

Template.requestrow.helpers({
	shouldShowComplete: function(){
		if ((Meteor.userId() == this.receiverId && this.senderIsRider && this.theStatus == "confirmed") || (Meteor.userId() == this.senderId && !this.senderIsRider && this.theStatus == "confirmed")){
			return true;
		} else {
			return false;
		}
	}
})

Template.requestrow.events({
	"click .delrequest": function(event){
		console.dir(this);
		Requests.remove(this._id);
	},
	"click .complete": function(event){
		var sts = Statuses.findOne({requestId: this._id}, {});
		sts.theStatus = "completed";
		var statusId = sts._id;
		delete sts["_id"];
		Statuses.update({_id: statusId}, {$set:sts});

		if (this.senderIsRider) {
			var driverInfo = RideInfo.findOne({uid: this.receiverId}, {});
		} else {
			var driverInfo = RideInfo.findOne({uid: this.senderId}, {});
		}

		var driverId = driverInfo._id;
		delete driverInfo['_id'];
		driverInfo.carSpace += 1;
		RideInfo.update({_id:driverId}, {$set:driverInfo});

	}

})


Template.rideinfo.helpers({
	isLeaving:function() {return Session.get("direction")=="from"},
	isComing: function() {return  Session.get("direction")=="to"},
	rideto: function(){
		return RideInfo.find(
			{direction:"to"},
			
			{sort:{location:1,status1:1,when:-1}}
		)},
	ridefrom: function(){
		return RideInfo.find(
			{direction:"from"},
			
			{sort:{location:1,status1:1,when:-1}}
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
		var msg = "";
		var senderIsRider = true;
		if (this.status1 == "driver") {
			msg = "Can you pick me up?";
			senderIsRider = true;
		} else if (this.status1 == "rider") {
			msg = "I want to pick you up.";
			senderIsRider = false;
			var driverInfo = RideInfo.findOne({uid: Meteor.userId()}, {});
			if (driverInfo.carSpace > 0) {
				driverInfo.carSpace -= 1;
			} else {
				driverInfo.carSpace = 0;
			}
			var driverId = driverInfo._id;
			delete driverInfo["_id"];
			RideInfo.update({_id: driverId}, {$set:driverInfo});
		}
		var request = {
			senderId: Meteor.userId(),
			receiverId: this.uid,
			message: msg,
			senderIsRider: senderIsRider,
			theStatus: "pending",
			when: new Date()
		};
		//Session.set('sessionId', request.sessionId);
		Requests.insert(request);
		alert("Request sent.");
	}
})

Template.ridetorow.helpers({
	delete:function(){ return this.uid==Meteor.userId() },
	match: function(){ 
		if (typeof RideInfo.findOne({uid:Meteor.userId()}, {}) != "undefined") {
			var currentLocation = RideInfo.findOne({uid:Meteor.userId()}, {}).location;
			return this.location == currentLocation && this.uid != Meteor.userId();
		}
		else
			return false;
	},
	shouldShowRequest: function() {
		if (Session.get("role") == "driver") {
			var riderId = this.uid;
			var driverId = Meteor.userId();
		} else if (Session.get("role") == "rider") {
			var riderId = Meteor.userId();
			var driverId = this.uid;
		}
		if (Session.get("role") == "driver") {
			if (this.status1 == "rider") {
				if (Requests.find({$and: [{senderId: Meteor.userId()}, {receiverId: this.uid}, {theStatus: "pending"}]}, {}).count() != 0 || Statuses.find({$and: [{riderId: this.uid}, {driverId: Meteor.userId()}, {theStatus: "riding"}]}, {}).count() != 0) {
					return false;
				} else {
					return true;
				}
			}else {
				return false
			}
		} else if (Session.get("role") == "rider") {
			if (Requests.find({$and: [{senderId: Meteor.userId()}, {theStatus: "pending"}]}, {}).count() != 0 || Statuses.find({$and: [{riderId: Meteor.userId()}, {theStatus: "riding"}]}, {}).count() != 0){
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	},
	shouldShowPhone: function() {
		if (Session.get("role") == "driver") {
			var riderId = this.uid;
			var driverId = Meteor.userId();
		} else if (Session.get("role") == "rider") {
			var riderId = Meteor.userId();
			var driverId = this.uid;
		}

		if (Requests.find({$and: [{senderId: Meteor.userId()}, {receiverId: this.uid}, {theStatus: "pending"}]}, {}).count() != 0 || Statuses.find({$and: [{riderId: riderId}, {driverId: driverId}, {theStatus: "riding"}]}, {}).count() != 0){
			return true;
		} else {
			return false;
		}
	}
})


Meteor.methods({
});