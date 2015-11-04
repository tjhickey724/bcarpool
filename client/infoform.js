Template.infoform.rendered = function(){
	$('body').removeClass('login-body');
	$('a[title]').tooltip();

    $('.btn-submit').on('click', function(e) {

        var formname = $(this).attr('name'); 
        var tabname = $(this).attr('href');
        
        if ($('#' + formname)[0].checkValidity()) { /* Only works in Firefox/Chrome need polyfill for IE9, Safari. http://afarkas.github.io/webshim/demos/ */
            e.preventDefault();
            $('ul.nav li a[href="' + tabname + '"]').parent().removeClass('disabled');
            $('ul.nav li a[href="' + tabname + '"]').trigger('click');
        }

    });

    $('ul.nav li').on('click', function(e) {
        if ($(this).hasClass('disabled')) {
            e.preventDefault();
            return false;
        }
    });
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
	},
	"click #rider": function(event){
		Session.setPersistent("role","rider");
	},
	"click #leaving": function(event){
		Session.setPersistent("direction","from");
	},
	"click #coming": function(event){
		Session.setPersistent("direction","to");
	},
	"click #role_submit": function(event){
		if (Session.get("role") == "driver"){
			Session.setPersistent("numSeats", $("#numSeats").val());
		}
	},
	"click #complete_submit": function(event){
		console.log("submitted");
		Session.setPersistent("submitted", true);
		
		event.preventDefault();

		if (Session.get("direction")==null || Session.get("role")==null){
			// generate an error message/warning on the page ...
			return;
		}

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
				destGeoloc:null,
				destAddress:null,
				when: new Date()
			};

		if (! Meteor.userId()) {
	      throw new Meteor.Error("not-authorized");
	    }

	    if (typeof RideInfo.findOne({uid:Meteor.userId()}, {}) != "undefined")
           RideInfo.update({_id:RideInfo.findOne({uid:Meteor.userId()}, {})._id}, {$set:ride});
        else
           RideInfo.insert(ride);

        Session.setPersistent("rideinfoId", RideInfo.findOne({uid:Meteor.userId()}, {})._id);

		Session.setPersistent("ride", ride);
		console.dir(ride);
		//Meteor.call("insertRideInfo", ride);
		Router.go('map');

		/*
		var x = $("#chatinput").val()
		
		$("#chatinput").val("");

		var profile = Meteor.user().profile;
		
		var chatline = 
		  	{
				uid:Meteor.userId(),  
				who:profile["firstName"]+" "+profile["lastName"], 
				what:x,
				when: new Date()
			};
			
		console.dir(chatline);
		
		ChatLines.insert(chatline);
		*/
	}
});
