Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: '404'
	//layoutTemplate: 'ApplicationLayout',
	//loadingTemplate: 'loading',
	//waitOn: function() {return true;}   // later we'll add more interesting things here .... 
});

Meteor.startup(function () {
  if (Meteor.isClient) {
    var location = Iron.Location.get();
    if (location.queryObject.platformOverride) {
      Session.set('platformOverride', location.queryObject.platformOverride);
    }
  }
});



Router.map(function(){
	this.route('/', {
		name: 'welcome',
		onBeforeAction: function(pause) {
			if (! Meteor.userId()) {
		    this.layout(null);
		    this.render('login');
		    //this.render('register');
		    //this.render('register');
		    //pause();
		  } else {
		  	this.next();
		    this.layout(Router.lookupLayoutTemplate());
		    //this.next();
		  }
		}
	});
	this.route('/where');
	this.route('/done');
	this.route('/map');
	this.route('/tripinfo');
	this.route('/about');
	this.route('/chat');
	this.route('/rideinfo');
});
