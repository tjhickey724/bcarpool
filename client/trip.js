var res = {};

Template.tripinfo.created = function () {
	res = this.data;
}

Template.tripinfo.helpers({
	driverInfo: function () {
		return res.driver;
	},
	psgInfo: function () {
		return res.passengers;
	},
	when: function () {
		return res.when;
	}
});

Template.tripinfo.events({
	"click .personInfo": function (event) {
		var data;
		var targetId = event.target.id;
		if (targetId == res.driver._id){
			data = res.driver;
		}	else {
			for (var i=0; i< res.passengers.length; i++){
				if (res.passengers[i]._id == targetId){
					data = res.passengers[i];
					break;
				}
			}
		}
		IonModal.open('personinfo', data);
	}
});
