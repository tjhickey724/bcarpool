Template.layout.helpers({
	shouldShowMap: function(){
		return (Meteor.userId() && Session.get("submitted"))?true:false;
	}
});