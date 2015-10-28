Template.layout.helpers({
	shouldShowMapTab: function(){
		return (Meteor.userId() && Session.get("submitted"))?true:false;
	}
});