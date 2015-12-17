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
	}
})

/*
Template.layout.rendered = function(){
	  var trigger = $('.hamburger'),
	      overlay = $('.overlay'),
	     isClosed = false;

	    trigger.click(function () {
	      hamburger_cross();      
	    });

	    function hamburger_cross() {

	      if (isClosed == true) {          
	        overlay.hide();
	        trigger.removeClass('is-open');
	        trigger.addClass('is-closed');
	        isClosed = false;
	      } else {   
	        overlay.show();
	        trigger.removeClass('is-closed');
	        trigger.addClass('is-open');
	        isClosed = true;
	      }
	  }
	  
	  $('[data-toggle="offcanvas"]').click(function () {
	        $('#wrapper').toggleClass('toggled');
	  });  

}*/