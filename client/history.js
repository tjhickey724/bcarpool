Template.historyinfo.helpers({
	historys: function(){
		return Historys.find({uid: Meteor.userId()},{sort:{when:-1}});
	}
})

Template.historyrow.events({
	"click .delhist": function(){
		console.dir(this);
		Historys.remove(this._id);
	}
})