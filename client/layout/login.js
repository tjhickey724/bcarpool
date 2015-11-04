Template.login.rendered = function(){
    $('body').addClass('login-body');
}


Template.login.events({
    "submit #login-form": function(event) {
        event.preventDefault();
        var emailVar = event.target.loginEmail.value;
        var passwordVar = event.target.loginPassword.value;
        Meteor.loginWithPassword(emailVar, passwordVar, function(err){
        	if(err == "undefined"){
        		Router.go("welcome");
        	}
        });
    }
});

Template.login.rendered = function(){
    $('body').addClass('login-body');
}

Template.register.events({
	"submit #register-form": function(event){
		event.preventDefault();
		var emailVar = event.target.registerEmail.value;
		var fNameVar = event.target.firstName.value;
        var lNameVar = event.target.lastName.value;
        var phoneVar = event.target.phone.value;
        var genderVar = event.target.gender.value;
        var passwordVar = event.target.registerPassword.value;
        var confirmpswdVar = event.target.confirmPassword.value;
        var profileVar = {
        	firstName: fNameVar,
        	lastName: lNameVar,
        	gender: genderVar,
        	phone: phoneVar
        }
        Accounts.createUser({
            email: emailVar,
            password: passwordVar,
            profile: profileVar
        });
        Router.go("welcome");
		console.log("Form");
	}
})