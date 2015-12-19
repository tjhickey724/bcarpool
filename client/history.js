var historys;

Template.historyinfo.created = function(){
	historys = Historys.find({},{sort:{when:-1}});
}

Template.historyinfo.helpers({
	historys: function(){
		return historys;
	}
})


Template.historycell.events({
	"click .delhist": function(){
		var self = this;
		IonPopup.confirm({
			      title: 'Delete',
			      template: "Are you sure you want to delete this record?",
			      onOk: function() {
			      		console.dir(self);
						Meteor.apply('removeHistory', [self._id], [], function(err, result){
								if(!err){
									console.log('removed');//do something
							}
						});
			      }
		});
	}
})
