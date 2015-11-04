Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: '404'
	//layoutTemplate: 'ApplicationLayout',
	//loadingTemplate: 'loading',
	//waitOn: function() {return true;}   // later we'll add more interesting things here .... 
});

Router.route('/', {
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
	  }
	}
});
Router.route('/map');
Router.route('/tripinfo');
Router.route('/about');
Router.route('/chat');
Router.route('/rideinfo');
Router.route('/register', {
	name: 'register',
	onBeforeAction: function(pause){
		if (! Meteor.userId()) {
		    this.layout(null);
		    this.render('register');
		    //this.next();
		    //this.render('register');
		    //this.render('register');
		    //pause();
		  } else {
		    this.layout(Router.lookupLayoutTemplate());
		  }
		}
});
