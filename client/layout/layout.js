Template.layout.helpers({
	userName: function(){
		var name;
		if(Meteor.user()){
			name = Meteor.user().profile['firstName'] + Meteor.user().profile['lastName'];
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