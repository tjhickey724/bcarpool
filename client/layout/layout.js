Template.layout.created = function (){
	//Meteor.subscribe('trips');
}

Template.layout.helpers({
	userName: function(){
		var name;
		if(Meteor.user()){
			name = Meteor.user().profile['firstName'] + ' '+ Meteor.user().profile['lastName'];
		} else {
			name = "Loading...";
		}
		return name;
	},
	trips: function(){
		return Session.get("trip");
	},
	shouldShowMapTab: function(){
		return (Meteor.userId() && Session.get("submitted"))?true:false;
	}
});

Template.layout.events({
	"click .logout": function(event){
		event.preventDefault();
		Meteor.apply('logoutClear',
            [[Session.get("rideInfoId"),
             Session.get("geolocInfoId"),
             Session.get("destInfoId"),
             Session.get("reqId"),
             Session.get("statusInfoId")]
            ],
            {wait:true},
            function(err, result){
                if (!err) {
                    console.log(result);
                    Session.set("rideInfoId", null);
                    Session.set("geolocInfoId", null);
                    Session.set("destInfoId", null);
                    Session.set("reqId", null);
                    Session.get("statusInfoId", null);
                }
            });
		Meteor.logout();
		Router.go('welcome');
	},
	"click #trip-popover": function(){
		//console.log($('#trip-popover'));
			var trips = Trips.find().fetch();
			var driver;
			var psgs = [];
			var when;
			var res = {};
			if (trips.length != 0){
			trips.forEach(function(trip, index){
				Meteor.apply('getRideInfo', [trip.driverId], {wait:true}, function(err, result){
						if(!err){
							driver = result;
							trip.passengerIds.forEach(function(psgId, index){
								Meteor.apply('getRideInfo', [psgId], {wait:true}, function(err, result){
									if(!err){
										psgs.push(result);
										if (index == trip.passengerIds.length - 1){
											when = moment(trip.when).format('llll');
											res = {driver: driver, passengers: psgs, when: when};
											IonPopover.show('tripinfo', res, '#trip-popover');
										}
									}
								});
							});
						}
				});
			});
		} else {
			IonPopover.show('tripinfo', res, '#trip-popover');
		}
	}
});
