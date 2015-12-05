Template.timepickermodal.onRendered(function(){
	this.$('.datetimepicker').datetimepicker({
		icons: {
			up: 'ion-chevron-up',
			down: 'ion-chevron-down'
		},
		inline: true,
		format: 'LT'
	});
	this.$('.datetimepicker').data("DateTimePicker").minDate(new Date(), moment(new Date()), 'LT');
});

Template.timepickermodal.events({
	"click #set": function(){
		var time = $('.datetimepicker').data("DateTimePicker").date();
		Session.setPersistent('time', time.toDate());
		$('#complete-info').attr('disabled', false);
		IonModal.close('timepickermodal');
	},
	"click #cancel": function(){
		IonModal.close('timepickermodal');
	}
});