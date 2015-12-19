if (Meteor.isClient) {
    Tracker.autorun(function(computation){
      var currentUser=Meteor.user();
      if(currentUser){
        //console.log(Session.get("loggedIn"));
        Session.setPersistent("follow", true);
      }
      else if(!computation.firstRun){
        Session.set("role",null);
        Session.set("direction",null);
        Session.set("numSeats", null);
        Session.set("timechoice", null);
        Session.set("time", null);
        Session.set("ride", null);
        Session.set("submitted", false);
        Session.set("follow", false);
        Session.set("place", null);
        Session.set("place_location", null);
        //console.log(Session.get("loggedIn"));
      }
    });
}


AccountsTemplates.configure({
  negativeValidation: false,
  negativeFeedback: false,
  positiveValidation: false,
  positiveFeedback: false,
  homeRoutePath: '/welcome',
});

var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: 'email',
      type: 'email',
      required: true,
      displayName: "Brandeis Email",
      //re: /.+@(.+){2,}\.(.+){2,}/,
      re: /.+@brandeis\.edu/,
      errStr: 'Invalid Email',
  },
  pwd
]);

AccountsTemplates.addField({
    _id: "firstName",
    type: "text",
    displayName: "First Name",
    required: true,
});

AccountsTemplates.addField({
    _id: "lastName",
    type: "text",
    displayName: "Last Name",
    required: true,
});


AccountsTemplates.addField({
    _id: "gender",
    type: "radio",
    displayName: "Gender",
    select: [
        {
            text: "Male",
            value: "m",
        },
        {
            text: "Female",
            value: "f",
        },
    ],
    required: true,
});

AccountsTemplates.addField({
    _id: "XXX-XXX-XXXX",
    type: "text",
    displayName: "Phone",
    re: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    errStr: 'Invalid Phone Number',
    required: true,
});
