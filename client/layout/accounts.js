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
    _id: "phone",
    type: "text",
    displayName: "Phone",
    required: true,
});

/*

Accounts.ui.config({
    requestPermissions: {},
    extraSignupFields: [{
        fieldName: 'firstName',
        fieldLabel: 'First name',
        inputType: 'text',
        visible: true,
        validate: function(value, errorFunction) {
          if (!value) {
            errorFunction("Please write your first name");
            return false;
          } else {
            return true;
          }
        }
    }, {
        fieldName: 'lastName',
        fieldLabel: 'Last name',
        inputType: 'text',
        visible: true,
    }, {
        fieldName: 'gender',
        showFieldLabel: false,      // If true, fieldLabel will be shown before radio group
        fieldLabel: 'Gender',
        inputType: 'radio',
        radioLayout: 'vertical',    // It can be 'inline' or 'vertical'
        data: [{                    // Array of radio options, all properties are required
            id: 1,                  // id suffix of the radio element
            label: 'Male',          // label for the radio element
            value: 'm'              // value of the radio element, this will be saved.
          }, {
            id: 2,
            label: 'Female',
            value: 'f',
            checked: 'checked'
        }],
        visible: true
    }, {
        fieldName: 'phone',
        fieldLabel: 'Phone Number',
        inputType: 'text',
        visible: true,
    }, {
        fieldName: 'terms',
        fieldLabel: 'I accept the terms and conditions',
        inputType: 'checkbox',
        visible: true,
        saveToProfile: false,
        validate: function(value, errorFunction) {
            if (value) {
                return true;
            } else {
                errorFunction('You must accept the terms and conditions.');
                return false;
            }
        }
    }]
});
*/

