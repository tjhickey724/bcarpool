/*
Template.historyinfo.onCreated(function(){
	Meteor.subscribe('historys');
})
*/

Template.historyinfo.helpers({
	historys: function(){
		//var hists = Historys.find({uid: Meteor.userId()},{sort:{when:-1}});
		var hists = Session.get('historys');
		var res = [];
		hists.forEach(function(hist, index){
			hist.when = moment(hist.when).format('llll');
			res.push(hist);
		});
		return res;
	}
})


Template.historycell.events({
	"click .delhist": function(){
		IonPopup.confirm({
			      title: 'Delete',
			      template: "Are you sure you want to delete this record?",
			      onOk: function() {
			      		console.dir(this);
						Meteor.apply('removeHistory', [this._id], [], function(err, result){
								if(!err){
									console.log('removed');//do something
							}
						});
			      }
		});
	}
})