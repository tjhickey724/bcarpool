Template.infoform.events({
	"submit #origin": function(event){
		
		event.preventDefault();
		var status1 = event.target.status.value;
		event.target.status.value=false;
		var direction = event.target.direction.value;
		event.target.direction.value="";
		var origin = event.target.origin.value;
		event.target.origin.value="";
		var destination = event.target.destination.value;
		event.target.destination.value="";
		var profile = Meteor.user().profile;

		var ride =
			{				
				uid:Meteor.userId(),  
				who:profile["firstName"]+" "+profile["lastName"], 
				status1:status1,
				direction:direction,
				location:(direction=="to")?origin:destination,
				when: new Date()
			};
		
		RideInfo.insert(ride);
		console.dir([status1,direction,origin,destination]);
		Router.go('rideinfo');

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
})