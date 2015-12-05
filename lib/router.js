Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: '404',
	//layoutTemplate: 'ApplicationLayout',
	loadingTemplate: 'loading'
	//waitOn: function() {return true;}   // later we'll add more interesting things here .... 
});

Meteor.startup(function () {
  if (Meteor.isClient) {
    var location = Iron.Location.get();
    if (location.queryObject.platformOverride) {
      Session.set('platformOverride', location.queryObject.platformOverride);
    }
    GoogleMaps.load({v:'3.22', key: 'AIzaSyA-dw_b_tu3Y-BYBS9B6WV0zHK2_OuN0QI', libraries: 'geometry,places'});
    //GoogleMaps.load({key: 'AIzaSyA-dw_b_tu3Y-BYBS9B6WV0zHK2_OuN0QI', libraries: 'geometry,places'});
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
		  	//this.next();
		    this.layout(Router.lookupLayoutTemplate());
		    this.next();
		  }
		}
	});
	this.route('/where');
	this.route('/when');
	this.route('/done');
	this.route('/map', {
		template: 'map',
		waitOn: function() {
			return [Meteor.subscribe("rideinfo"),
					Meteor.subscribe("requests"),
      				Meteor.subscribe("statuses"),
      				Meteor.subscribe("trips"),
      				Meteor.subscribe("geolocations"),
      				Meteor.subscribe("destinations")
			];
		}
	});
	this.route('/historyinfo');
	this.route('/about');
	this.route('/chat');
	this.route('/rideinfo');
});
