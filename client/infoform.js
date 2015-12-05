Template.infoform.rendered = function(){
	if (Session.get("role") == "driver") {
		$('#driver').prop('checked', true);
		$('#role-next').attr('disabled', false);
		$('#numSeats').show();
		if($('#numSeats').val().length > 0){
			$('#role-next').attr('disabled', false);
		}else{
			$('#role-next').attr('disabled', true);
		}
	} else if (Session.get("role") == "rider") {
		$('#rider').prop('checked', true);
		$('#role-next').attr('disabled', false);
		$('#numSeats').hide();
	} else {
		$('#role-next').attr('disabled', true);
		$('#numSeats').hide();
	}

	$('#numSeats').bind('input propertychange', function() {
		if($(this).val().length > 0){
			$('#role-next').attr('disabled', false);
		}else{
			$('#role-next').attr('disabled', true);
		}
	});
	/*
	if (Session.get("geolocInfoId") !== null || Session.get("geolocInfoId") != undefined){
    			//console.log(Session.get("geolocInfoId"));
		    	 Geolocations.remove(Session.get("geolocInfoId"));
		    	 Session.set("geolocInfoId", null);
		    }
		    if (Session.get("destInfoId") !== null || Session.get("destInfoId") != undefined){
		    	Destinations.remove(Session.get("destInfoId"));
		    	Session.set("destInfoId", null);
		    }
	*/
}


Template.infoform.helpers({
	isDriver:function() {return Session.get("role")=="driver"},
	isLeaving:function() {return Session.get("direction")=="from"},
	isComing: function() {return  Session.get("direction")=="to"},
	formComplete:function(){return Session.get("role")!=null && Session.get("direction")!=null}
});

Template.infoform.events({
	"click #reset": function(event){
		Session.set("role",null);
		Session.set("direction",null);
	},
	"click #driver": function(event){
		Session.setPersistent("role","driver");
		$('#numSeats').show();
		if($('#numSeats').val().length > 0){
			$('#role-next').attr('disabled', false);
		}else{
			$('#role-next').attr('disabled', true);
		}
	},
	"click #rider": function(event){
		Session.setPersistent("role","rider");
		$('#numSeats').hide();
		$('#numSeats').val('');
		$('#role-next').attr('disabled', false);
	},
	"click #role-next": function(event){
		if (Session.get("role") == "driver"){
			Session.setPersistent("numSeats", $("#numSeats").val());
		}
	}
});



Template.where.rendered = function(){
	if (Session.get("direction") == "to") {
		$('#coming').prop('checked', true);
		$('#where-next').attr('disabled', false);
	} else if (Session.get("direction") == "from") {
		$('#leaving').prop('checked', true);
		$('#where-next').attr('disabled', false);
	} else {
		$('#where-next').attr('disabled', true);
	}
}


Template.where.events({
	"click #leaving": function(event){
		Session.setPersistent("direction","from");
		$('#where-next').attr('disabled', false);
	},
	"click #coming": function(event){
		Session.setPersistent("direction","to");
		$('#where-next').attr('disabled', false);
	}
});


Template.when.rendered = function(){
	if (Session.get("time") == "now") {
		$('#now').prop('checked', true);
		$('#complete-info').attr('disabled', false);
	} else if (Session.get("time") == "later") {
		$('#now').prop('checked', true);
		$('#complete-info').attr('disabled', false);
	} else {
		$('#complete-info').attr('disabled', true);
	}
}

Template.when.events({
	"click #now": function(event){
		Session.setPersistent("timechoice", "now");
		Session.setPersistent("time", null);
		$('#complete-info').attr('disabled', false);
	},
	"click #later": function(event){
		Session.setPersistent('timechoice', "later");
		$('#complete-info').attr('disabled', true);
		IonModal.open('timepickermodal');
	},
	"click #complete-info": function(event){
		console.log("submitted");
		Session.setPersistent("submitted", true);
		var time;
		
		//event.preventDefault();

		if (Session.get("direction")==null || Session.get("role")==null){
			// generate an error message/warning on the page ...
			return;
		}

		if (Session.get("timechoice") == "now"){
			time = moment().toDate();
		} else {
			time = Session.get("time");
		}
		console.log(time);

		//var location = event.target.location.value;
		
		//event.target.location.value="";
		var profile = Meteor.user().profile;

		var ride =
			{				
				uid:Meteor.userId(),  
				who:profile["firstName"]+" "+profile["lastName"], 
				phone:profile["phone"],
				carSpace:Session.get("numSeats"),
				status1:Session.get("role"),
				direction:Session.get("direction"),
				when:time
			};

        Meteor.apply('checkAndUpdateRideInfo', [ride], {wait:true}, function(err, result){
        	if (!err) {
        		Session.setPersistent("rideInfoId", result);
        		Session.setPersistent("ride", ride);
				console.dir(ride);
        	}
        });
	}
});


