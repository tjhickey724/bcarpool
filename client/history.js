Template.historyinfo.onCreated(function(){
	Meteor.subscribe('historys');
})

Template.historyinfo.helpers({
	historys: function(){
		var hists = Historys.find({uid: Meteor.userId()},{sort:{when:-1}});
		var res = [];
		hists.forEach(function(hist, index){
			hist.when = moment(hist.when).format('llll');
			res.push(hist);
		});
		return res;
	}
})


Template.historyrow.events({
	"click .delhist": function(){
		console.dir(this);
		Historys.remove(this._id);
	}
})