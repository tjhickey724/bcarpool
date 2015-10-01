Template.chat.events({
	"submit #chatform": function(event){
		
		event.preventDefault();
		
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
	}
});

Template.chat.helpers({
	chatlines: function(){
		return ChatLines.find({},{limit:10, sort:{when:-1}});
	},
	numchats: function(){
		return ChatLines.find().count();
	}
});