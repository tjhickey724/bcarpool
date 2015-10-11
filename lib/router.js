Router.configure({
	layoutTemplate: 'layout',
	//layoutTemplate: 'ApplicationLayout',
	//loadingTemplate: 'loading',
	//waitOn: function() {return true;}   // later we'll add more interesting things here .... 
});

Router.route('/', {name: 'welcome'});
Router.route('/map');
Router.route('/about');
Router.route('/chat');
Router.route('/rideinfo');
