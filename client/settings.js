Template.settings.helpers({
  tipschecked: function(){
    return Session.get('tips');
  }
});

Template.settings.events({
  "click #tips-toggle": function(event){
    Session.setPersistent('tips', event.target.checked);
  }
});
