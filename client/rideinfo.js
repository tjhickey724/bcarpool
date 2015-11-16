var MAP_ZOOM = 15;

Meteor.startup(function() { 
  GoogleMaps.load({v:'3', key: 'AIzaSyA-dw_b_tu3Y-BYBS9B6WV0zHK2_OuN0QI', libraries: 'geometry,places'});
  //Geolocations._ensureIndex({loc: "2dsphere"})
});

var cursor = Requests.find();
cursor.observeChanges({
	added: function(id, object) {
		if (object.receiverId == Meteor.userId()) {
				if (object.theStatus == "pending") {
					var name = RideInfo.findOne({uid:object.senderId}, {}).who;
					IonPopup.confirm({
				      title: 'Request',
				      template: "<strong>" + name + "</strong>" + " send you a request: \n" + object.message,
				      onOk: function() {
				      	object.theStatus = "confirmed";
						if (object.senderIsRider) {
							var sts = {
								requestId: id,
								driverId: object.receiverId,
								riderId: object.senderId,
								theStatus: "riding",
								when: new Date()
							};
						} else {
							var sts = {
								requestId: id,
								driverId: object.senderId,
								riderId: object.receiverId,
								theStatus: "riding",
								when: new Date()
							};
							//var driverInfo = RideInfo.findOne({uid: object.senderId}, {});
						}
						var stsId = Statuses.insert(sts);
						Session.setPersistent("statusInfoId", stsId);
						object.when = new Date();
						Requests.update({_id:id}, {$set:object});
				      },
				      onCancel: function() {
				        object.theStatus = "rejected";
						if (object.senderIsRider) {
							var driverInfo = RideInfo.findOne({uid: object.receiverId}, {});
						} else {
							var driverInfo = RideInfo.findOne({uid: object.senderId}, {});
						}

						var driverId = driverInfo._id;
						delete driverInfo['_id'];
						driverInfo.carSpace += 1;
						RideInfo.update({_id:driverId}, {$set:driverInfo});
						object.when = new Date();
						Requests.update({_id:id}, {$set:object});
				      }
				    });
				}
			
		}
	}
});

/*getter functions merged from rideinfo*/

//status info helpers
function statusHelpers(){
	this.statuses = function (){
		return Statuses.find({},{sort:{when:-1}})
	};
}

//requestinfo helpers
function requestinfoHelpers(){
	this.received = function (){
		return typeof Requests.findOne({receiverId: Meteor.userId()}, {}) != "undefined" || typeof Requests.findOne({senderId: Meteor.userId()}, {}) != "undefined"
	};

	this.receivedContent = function (){
		var request1 = Requests.find({receiverId: Meteor.userId()}, {sort:{when:-1}});
		var request2 = Requests.find({senderId: Meteor.userId()}, {sort:{when:-1}});
		if (request1.count() != 0) {
			return request1;
		} else if (request2.count() != 0){
			return request2;
		} else {
			return null;
		}
	};
}

//requestrow helpers
function requestrowHelper(){
	this.shouldShowComplete = function (){
		if ((Meteor.userId() == this.receiverId && this.senderIsRider && this.theStatus == "confirmed") || (Meteor.userId() == this.senderId && !this.senderIsRider && this.theStatus == "confirmed")){
			return true;
		} else {
			return false;
		}
	};
}

//rideinfo helpers
function rideinfoHelpers(){
	this.isLeaving = function (){return Session.get("direction")=="from"};
	this.isComing = function (){return  Session.get("direction")=="to"};
	this.rideto = function (){
		return RideInfo.find(
				{direction:"to"},
				
				{sort:{destAddress:1,status1:1,when:-1}}
			)
	};

	this.ridefrom = function (){
		return RideInfo.find(
				{direction:"from"},
				
				{sort:{destAddress:1,status1:1,when:-1}}
			)
	};
}

//ridetorow helpers
function ridetorowHelpers(rowInfo){
	this.shouldShowDelete = function (){
		return rowInfo.uid==Meteor.userId()
	};


	this.match = function (){
		if (typeof RideInfo.findOne({uid:Meteor.userId()}, {}) != "undefined") {
			var currentLocation = RideInfo.findOne({uid:Meteor.userId()}, {}).location;
			return rowInfo.location == currentLocation && rowInfo.uid != Meteor.userId();
		}
		else
			return false;
	};

	this.shouldShowRequest = function (){
		if (Session.get("role") == "driver") {
				var riderId = rowInfo.uid;
				var driverId = Meteor.userId();
			} else if (Session.get("role") == "rider") {
				var riderId = Meteor.userId();
				var driverId = rowInfo.uid;
			}
			if (Session.get("role") == "driver") {
				if (rowInfo.status1 == "rider") {
					if (Requests.find({$and: [{senderId: Meteor.userId()}, {receiverId: rowInfo.uid}, {theStatus: "pending"}]}, {}).count() != 0 || Statuses.find({$and: [{riderId: rowInfo.uid}, {driverId: Meteor.userId()}, {theStatus: "riding"}]}, {}).count() != 0) {
						console.log("here");
						return false;
					} else {
						return true;
					}
				}else {
					return false
				}
			} else if (Session.get("role") == "rider") {
				if (Requests.find({$and: [{senderId: Meteor.userId()}, {theStatus: "pending"}]}, {}).count() != 0 || Statuses.find({$and: [{riderId: Meteor.userId()}, {theStatus: "riding"}]}, {}).count() != 0){
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
	};

	this.shouldShowPhone = function (){
		if (Session.get("role") == "driver") {
				var riderId = rowInfo.uid;
				var driverId = Meteor.userId();
			} else if (Session.get("role") == "rider") {
				var riderId = Meteor.userId();
				var driverId = rowInfo.uid;
			}

			if (Requests.find({$and: [{senderId: Meteor.userId()}, {receiverId: rowInfo.uid}, {theStatus: "pending"}]}, {}).count() != 0 || Statuses.find({$and: [{riderId: riderId}, {driverId: driverId}, {theStatus: "riding"}]}, {}).count() != 0){
				return true;
			} else {
				return false;
			}
	};
}

function ridetorowEvents(rowInfo){
	this.clickDelete = function (){
		console.dir(rowInfo);
		RideInfo.remove(rowInfo._id);
	};

	this.clickCall = function(){
		 IonPopup.alert({
	      title: "<strong>" + rowInfo.who + "</strong>" + '\'s' + " phone number",
	      template: rowInfo.phone,
	      okText: 'Got It.'
	    });
	};

	this.clickRequest = function (){
		var msg = "";
		var senderIsRider = true;
		if (rowInfo.status1 == "driver") {
			msg = "Can you pick me up?";
			senderIsRider = true;
			var driverInfo = RideInfo.findOne({uid: rowInfo.uid}, {});
		} else if (rowInfo.status1 == "rider") {
			msg = "I want to pick you up.";
			senderIsRider = false;
			var driverInfo = RideInfo.findOne({uid: Meteor.userId()}, {});
		}
			
		if (driverInfo.carSpace > 0) {
			driverInfo.carSpace -= 1;
		} else {
			driverInfo.carSpace = 0;
		}
		var driverId = driverInfo._id;
		delete driverInfo["_id"];
		RideInfo.update({_id: driverId}, {$set:driverInfo});

		var request = {
			senderId: Meteor.userId(),
			receiverId: rowInfo.uid,
			message: msg,
			senderIsRider: senderIsRider,
			theStatus: "pending",
			when: new Date()
		};
		//Session.set('sessionId', request.sessionId);
		var reqId = Requests.insert(request);
		Session.setPersistent("reqId", reqId);
		 IonPopup.alert({
	      title: 'Success',
	      template: 'Request Sent!',
	      okText: 'Ok'
	    });
	}
}


//rideinfo.js
Template.statusinfo.helpers({
	statuses: function(){return Statuses.find({},{sort:{when:-1}})}
})

Template.statusrow.events({
	"click .delstatus": function() {
		console.dir(this);
		Statuses.remove(this._id);
	}
})


Template.requestinfo.helpers({
	received: function() {return typeof Requests.findOne({receiverId: Meteor.userId()}, {}) != "undefined" || typeof Requests.findOne({senderId: Meteor.userId()}, {}) != "undefined"},
	//received: function() {return Session.get("confirmed")},
	receivedContent: function(){
			var request1 = Requests.find({receiverId: Meteor.userId()}, {sort:{when:-1}});
			var request2 = Requests.find({senderId: Meteor.userId()}, {sort:{when:-1}});
			if (request1.count() != 0) {
				return request1;
			} else if (request2.count() != 0){
				return request2;
			} else {
				return null;
			}
	}
})

Template.requestrow.helpers({
	shouldShowComplete: function(){
		if ((Meteor.userId() == this.receiverId && this.senderIsRider && this.theStatus == "confirmed") || (Meteor.userId() == this.senderId && !this.senderIsRider && this.theStatus == "confirmed")){
			return true;
		} else {
			return false;
		}
	}
})

Template.requestrow.events({
	"click .delrequest": function(event){
		console.dir(this);
		Requests.remove(this._id);
	},
	"click .complete": function(event){
		var sts = Statuses.findOne({requestId: this._id}, {});
		sts.theStatus = "completed";
		var statusId = sts._id;
		delete sts["_id"];
		Statuses.update({_id: statusId}, {$set:sts});

		if (this.senderIsRider) {
			var driverInfo = RideInfo.findOne({uid: this.receiverId}, {});
		} else {
			var driverInfo = RideInfo.findOne({uid: this.senderId}, {});
		}

		var driverId = driverInfo._id;
		delete driverInfo['_id'];
		driverInfo.carSpace += 1;
		RideInfo.update({_id:driverId}, {$set:driverInfo});

	}

})


Template.rideinfo.helpers({
	isLeaving:function() {return Session.get("direction")=="from"},
	isComing: function() {return  Session.get("direction")=="to"},
	rideto: function(){
		return RideInfo.find(
			{direction:"to"},
			
			{sort:{destAddress:1,status1:1,when:-1}}
		)},
	ridefrom: function(){
		return RideInfo.find(
			{direction:"from"},
			
			{sort:{destAddress:1,status1:1,when:-1}}
		)},
	//receive: function(){ return Meteor.userId() == Session.get('sessionId')[1]}
})

Template.ridetorow.events({
	"click .delride": function(event){
		console.dir(this);
		RideInfo.remove(this._id);
	},
	"click .call": function(event){
		alert(this.phone);
	},
	"click .request": function(event){
		var msg = "";
		var senderIsRider = true;
		if (this.status1 == "driver") {
			msg = "Can you pick me up?";
			senderIsRider = true;
			var driverInfo = RideInfo.findOne({uid: this.uid}, {});
		} else if (this.status1 == "rider") {
			msg = "I want to pick you up.";
			senderIsRider = false;
			var driverInfo = RideInfo.findOne({uid: Meteor.userId()}, {});
		}
		
		if (driverInfo.carSpace > 0) {
			driverInfo.carSpace -= 1;
		} else {
			driverInfo.carSpace = 0;
		}
		var driverId = driverInfo._id;
		delete driverInfo["_id"];
		RideInfo.update({_id: driverId}, {$set:driverInfo});

		var request = {
			senderId: Meteor.userId(),
			receiverId: this.uid,
			message: msg,
			senderIsRider: senderIsRider,
			theStatus: "pending",
			when: new Date()
		};
		//Session.set('sessionId', request.sessionId);
		Requests.insert(request);
		alert("Request sent.");
	}
})


Template.ridetorow.helpers({
	delete:function(){ return this.uid==Meteor.userId() },
	match: function(){ 
		if (typeof RideInfo.findOne({uid:Meteor.userId()}, {}) != "undefined") {
			var currentLocation = RideInfo.findOne({uid:Meteor.userId()}, {}).location;
			return this.location == currentLocation && this.uid != Meteor.userId();
		}
		else
			return false;
	},
	shouldShowRequest: function() {
		if (Session.get("role") == "driver") {
			var riderId = this.uid;
			var driverId = Meteor.userId();
		} else if (Session.get("role") == "rider") {
			var riderId = Meteor.userId();
			var driverId = this.uid;
		}
		if (Session.get("role") == "driver") {
			if (this.status1 == "rider") {
				if (Requests.find({$and: [{senderId: Meteor.userId()}, {receiverId: this.uid}, {theStatus: "pending"}]}, {}).count() != 0 || Statuses.find({$and: [{riderId: this.uid}, {driverId: Meteor.userId()}, {theStatus: "riding"}]}, {}).count() != 0) {
					return false;
				} else {
					return true;
				}
			}else {
				return false
			}
		} else if (Session.get("role") == "rider") {
			if (Requests.find({$and: [{senderId: Meteor.userId()}, {theStatus: "pending"}]}, {}).count() != 0 || Statuses.find({$and: [{riderId: Meteor.userId()}, {theStatus: "riding"}]}, {}).count() != 0){
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	},
	shouldShowPhone: function() {
		if (Session.get("role") == "driver") {
			var riderId = this.uid;
			var driverId = Meteor.userId();
		} else if (Session.get("role") == "rider") {
			var riderId = Meteor.userId();
			var driverId = this.uid;
		}

		if (Requests.find({$and: [{senderId: Meteor.userId()}, {receiverId: this.uid}, {theStatus: "pending"}]}, {}).count() != 0 || Statuses.find({$and: [{riderId: riderId}, {driverId: driverId}, {theStatus: "riding"}]}, {}).count() != 0){
			return true;
		} else {
			return false;
		}
	}
})



//map.js

Template.map.helpers({  
  geolocationError: function() {
    var error = Geolocation.error();
    return error && error.message;
  },
  shouldShowMap: function(){
    return (Meteor.userId() && Session.get("submitted"))?true:false;
  },
  mapOptions: function() {
    var latLng = Geolocation.latLng();
    // Initialize the map once we have the latLng.
    if (GoogleMaps.loaded() && latLng && Meteor.userId() != null) {
    	console.log("loaded");
      return {
        center: new google.maps.LatLng(latLng.lat, latLng.lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        //center: {lat: Geolocations.findOne({uid: Meteor.userId()}, {}).loc.coordinates[0], lng: Geolocations.findOne({uid:Meteor.userId()}, {}).loc.coordinates[0]},
        zoom: MAP_ZOOM
      };
  	}
  }
});



Template.map.onCreated(function() { 
console.log("created"); 
  var self = this;

  GoogleMaps.ready('map', function(map) {
  	console.log("ready");
  	/* Central Button */
  	/*
  	self.find('.material-button-toggle').addEventListener('click', function(){
	  	this.classList.toggle('open');
	  	var options = document.getElementsByClassName('option');
	  	for (var i = 0; i < options.length; i++){
	  		options[i].classList.toggle('scale-on');
	  	}
	  });
	*/
  	
    var locmarkers = [];
    var destpins = [];
    var infowindow = new google.maps.InfoWindow({
                  content: "holding..."
                });

    var input = self.find("#pac-input");
    if (Session.get("direction") == "to"){
    	$("#pac-input").prop("disabled", true);
    } else {
    	$("#pac-input").prop("disabled", false);
    }
    /*
    var circle_menu = self.find("#circle-menu");
    map.instance.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(circle_menu);
	*/
    var searchBox = new google.maps.places.SearchBox(input);
    map.instance.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    setUpSearchBox();

    var buttonGroupDiv = document.createElement('div');
    var buttonGroup = new ButtonGroup(buttonGroupDiv, map.instance);

   	map.instance.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(buttonGroupDiv);

   	 var locations = [];
      var info = [];
      var geolocations = Geolocations.find().fetch();
      geolocations.forEach(function(location, index){
	        locations.push(location);
	        info.push(generateHTML(location.uid));
      });

    if (Session.get("direction") == "from"){
    	dropDestPins();
    }
    //dropLocMarkers();

    RideInfo.find().observeChanges({
    	changed: function(id, object) {
    		//console.log("ridechange");
    		var userId = RideInfo.findOne({_id: id}, {}).uid;
    		if (userId != Meteor.userId()) {
	    		var geo = Geolocations.findOne({uid:userId}, {});
	    		if (geo != undefined) {
		    		if (object.status1 != Session.get("role")){
		    			dropSingleLocMarker(geo._id, geo);
		    		} else {
		    			removeLocMarker(geo._id);
		    		}
	    		}
    		}
    	},
		removed: function(id) {
			//console.log("removed rideinfo");
			locmarkers.forEach(function(locmarker, index){
				if(locmarker.ride._id == id){
					locmarker.setMap(null);
				}
			});

			removeDestPin(id);
		}
	});


	Geolocations.find().observeChanges({
		added: function(id, location) {
			//console.log("added");
			dropSingleLocMarker(id, location);
		},
		changed: function(id, location) { // update marker position when changed
			//console.log("changed");
			for (i = 0; i < locmarkers.length; i++) {
				if (locmarkers[i]._id == id){
					locmarkers[i].position = {lat: location.loc.coordinates[0], lng: location.loc.coordinates[1]};
					break;
				}
			}
		},
		removed: function(id) {
			console.log("removed");
			removeLocMarker(id);
		}
	});

	Destinations.find().observeChanges({
		added: function(id , dest){ /* drop destpins */
			var ride = RideInfo.findOne({uid: dest.uid}, {});
			//console.log(dest.uid);
			if (Session.get("role") != ride.status1){
				var destpin = new google.maps.Marker({
		                position: {lat: dest.destGeoloc.coordinates[0], lng: dest.destGeoloc.coordinates[1]},
		                map: map.instance,
		                animation: google.maps.Animation.DROP,
		                ride_id: ride._id,
		                _id: id,
		                icon: '/images/beachflag.png',
		                role: ride.status1,
		                html:'<p>'+dest.destAddress+'</p>'
		              });
				destpins.push(destpin);
				addEventsForDestpin(destpin);
			}
		},
		removed: function(id){ /* remove destpin */
			removeDestPin(id);
		}
	});


	function dropDestPins(){
      	  clearDestPins();

	      var dests = Destinations.find().fetch();
	      dests.forEach(function(dest, index){
	        var ride = RideInfo.findOne({uid: Meteor.userId()}, {});
	        if(dest.uid != Meteor.userId()){
	          if (Session.get("role") == "rider"){
	            if (ride.status1 == "driver"){
	              destpins.push(new google.maps.Marker({
	                position: {lat: dest.destGeoloc.coordinates[0], lng: dest.destGeoloc.coordinates[1]},
	                map: map.instance,
	                animation: google.maps.Animation.DROP,
	                ride_id: ride._id,
	                _id: dest._id,
	                icon: '/images/beachflag.png',
	                role: ride.status1,
	                html:'<p>'+dest.destAddress+'</p>'
	              }));
	            }
	          } else {
	            if (ride.status1 == "rider"){
	              destpins.push(new google.maps.Marker({
	                position: {lat: dest.destGeoloc.coordinates[0], lng: dest.destGeoloc.coordinates[1]},
	                map: map.instance,
	                animation: google.maps.Animation.DROP,
	                ride_id: ride._id,
	                _id: dest._id,
	                icon: '/images/beachflag.png',
	                role: ride.status1,
	                html:'<p>'+dest.destAddress+'</p>'
	              }));
	            }
	          }
	        } else {
	        	if (dest.destGeoloc != null) {
			          destpins.push(new google.maps.Marker({
			            position: {lat: dest.destGeoloc.coordinates[0], lng: dest.destGeoloc.coordinates[1]},
			            map: map.instance,
			            animation: google.maps.Animation.DROP,
			            ride_id: ride._id,
			            _id: dest._id,
			            icon: '/images/beachflag.png',
			            role: "self",
			            html:'<p>'+dest.destAddress+'</p>',
			            label: "M"
			          }));
			     }
	        }
	      });
		addEventsForDestpins();
      }

      function addEventsForDestpins(){
      	destpins.forEach(function(destpin, index){
      		addEventsForDestpin(destpin);
	      });
      }

      function addEventsForDestpin(destpin){
      	google.maps.event.addListener(destpin, 'click', function(){
	          infowindow.setContent(destpin.html);
	          infowindow.open(map.instance, destpin);
	        });
      }

      function removeDestPin(id){
      	for (i = 0; i < destpins.length; i++) {
      		if(destpins[i]._id == id){
				destpins[i].setMap(null);
				break;
			}
      	}
      }


      function clearDestPins() {
        for (var i = 0; i < destpins.length; i++) {
          destpins[i].setMap(null);
        }
        destpins = [];
      }



      function generateHTML(userId){
        var rideInfo = RideInfo.findOne({uid: userId}, {});
        //var content = "My ass";
        //console.log(userId);
        var destInfo = Destinations.findOne({uid: userId}, {});
        if (destInfo == undefined) {
        	if (Session.get("direction") == "to"){
        		destInfo = {destAddress: "Brandeis University", when: rideInfo.when};
        	} else {
        		destInfo = {destAddress: "N/A", when: "N/A"};
        	}
        }
        if (userId == Meteor.userId()){
          return {html: '<p>You</p>', role: Session.get("role"), isSelf: true, ride:rideInfo};
        }


        //console.log();
        var content;
        var role;
        var requestButton = '';
        var phoneButton = '';
        var shouldShowRequest = new ridetorowHelpers(rideInfo).shouldShowRequest();
        var shouldShowPhone = new ridetorowHelpers(rideInfo).shouldShowPhone();
        if(shouldShowPhone){
        		phoneButton = '<input type="button" name="phone" id="phone" value="Call">'
        	}
        if(rideInfo.status1 == "rider"){
        	if(shouldShowRequest){
        		requestButton = '<input type="button" name="request" id="request" value="Pick Up">';
        	}
          content = '<table class="table table-striped">'+
                        '<thead>' +
                        '<tr><th>Name</th><th>Go To</th><th>Time</th></tr>' +
                      '</thead>' +
                      '<tbody>' +
                        '<tr><td>'+rideInfo.who+'</td><td>'+destInfo.destAddress+'</td><td>'+destInfo.when+'</td></tr>' +
                      '</tbody>' +
                    '</table>'+ requestButton + phoneButton;
          role = "rider";

        }else{
        	if (shouldShowRequest){
        		requestButton = '<input type="button" name="request" id="request" value="Get A Ride">';
        	}
          content = '<table class="table table-striped">'+
                        '<thead>' +
                        '<tr><th>Name</th><th>Back To</th><th>Seats Left</th><th>Time</th></tr>' +
                      '</thead>' +
                      '<tbody>' +
                        '<tr><td>'+rideInfo.who+'</td><td>'+destInfo.destAddress+'</td><td>'+rideInfo.carSpace+'</td><td>'+destInfo.when+'</td></tr>' +
                      '</tbody>' +
                    '</table>'+requestButton + phoneButton;
          role = "driver";
        }
        

        return {html:content, role:role, isSelf: false, ride:rideInfo};
      }

      function dropSingleLocMarker(id, location) {
			 var info = generateHTML(location.uid);
			 if ((Session.get("role") != info.role) || info.isSelf){
			 	//console.log(info.role);
			 	//console.log(" one time "+ info.role + info.isSelf);
				 var locmarker = new google.maps.Marker({
		                position: {lat: location.loc.coordinates[0], lng: location.loc.coordinates[1]},
		                animation: google.maps.Animation.DROP,
		                map: map.instance,
		                role: info.role,
		                isSelf: info.isSelf,
		                _id: location._id,
		                label: ""+info.ride.who,
		                ride: info.ride,
		                //html: '<div id="infowindow'+labelindex+'>'+info[labelindex-1]+'</div>'
		                html: info.html
		              });
				 locmarkers.push(locmarker);
				 addEventsForLocMarker(locmarker);
			}
		}


      function dropLocMarkers() {
        clearLocMarkers();
        var totalTimeOut = 0;
        for (var i = 0; i < locations.length; i++) {
          totalTimeOut += i*200;
          addLocMarkersWithTimeout(locations[i], i+1, i * 200);
        }
        window.setTimeout(function(){
          addEventsForLocMarkers();
        }, totalTimeOut);
      }
      // If the marker doesn't yet exist, create it.
      function addLocMarkersWithTimeout(location, labelindex, timeout) {
        //console.log(titleinfo);
        window.setTimeout(function() {
          if (Session.get("role") == "rider"){
            if(info[labelindex-1].role == "driver" || info[labelindex-1].isSelf){
                locmarkers.push(new google.maps.Marker({
                position: {lat: location.loc.coordinates[0], lng: location.loc.coordinates[1]},
                animation: google.maps.Animation.DROP,
                map: map.instance,
                role: info[labelindex-1].role,
                isSelf: info[labelindex-1].isSelf,
                _id: location._id,
                label: ""+info[labelindex-1].ride.who,
                ride: info[labelindex-1].ride,
                //html: '<div id="infowindow'+labelindex+'>'+info[labelindex-1]+'</div>'
                html: info[labelindex-1].html
              }));
          }
        } else {
          if(info[labelindex-1].role == "rider" || info[labelindex-1].isSelf){
                locmarkers.push(new google.maps.Marker({
                position: {lat: location.loc.coordinates[0], lng: location.loc.coordinates[1]},
                animation: google.maps.Animation.DROP,
                map: map.instance,
                role: info[labelindex-1].role,
                isSelf: info[labelindex-1].isSelf,
                _id: location._id,
                label: ""+info[labelindex-1].ride.who,
                ride: info[labelindex-1].ride,
                //html: '<div id="infowindow'+labelindex+'>'+info[labelindex-1]+'</div>'
                html: info[labelindex-1].html
              }));
          }
        }
        }, timeout);
      }


      function addEventsForLocMarkers(){ 
          locmarkers.forEach(function(marker, index){
          	addEventsForLocMarker(marker);
          });
      }

      function addEventsForLocMarker(marker){
      	google.maps.event.addListener(marker, 'click', function(){
              infowindow.setContent(marker.html);
              infowindow.open(map.instance, marker);
              //if(this.role == "rider"){
              	var selfMarker = marker;
              	if (self.find("#request")) {
	                self.find("#request").addEventListener('click', function(){
	                  var events = new ridetorowEvents(selfMarker.ride);
	                  console.log("request");
	                  events.clickRequest();
	                  var callButtonDiv = document.createElement('button');
	      			  var callButton = new CallButton(callButtonDiv, map.instance, selfMarker.ride);
	      			  map.instance.controls[google.maps.ControlPosition.TOP_LEFT].push(callButtonDiv);
	                });
	            }
              //}
            });
      }

      function removeLocMarker(id){
      	for (i = 0; i < locmarkers.length; i++) {
      		if(locmarkers[i]._id == id){
				locmarkers[i].setMap(null);
				break;
			}
      	}
      }

      function remainLocMarkersByRole(role){
      	for (i = 0; i < locmarkers.length; i++) {
      		if(locmarkers[i].role != role){
				locmarkers[i].setMap(null);
				break;
			}
      	}
      }

      function clearLocMarkers() {
        for (var i = 0; i < locmarkers.length; i++) {
          locmarkers[i].setMap(null);
        }
        locmarkers = [];
      }


      function setUpSearchBox(){
	      //console.log(map.instance.controls[google.maps.ControlPosition.TOP_LEFT].j);
	      // Create the search box and link it to the UI element.
	      //console.log(map.instance.controls[google.maps.ControlPosition.TOP_LEFT].j);

	      // Bias the SearchBox results towards current map's viewport.
	      google.maps.event.addListener(map, 'bounds_changed', function(){
	        searchBox.setBounds(map.getBounds());
	      });

	      var destmarkers = [];

	      google.maps.event.addListener(searchBox, 'places_changed', function() {
	        var places = searchBox.getPlaces();

	        if (places.length == 0) {
	          return;
	        }

	        var place = places[0];
	        //console.log(destmarkers.length);

	        // Clear out the old markers.
	        destmarkers.forEach(function(marker) {
	          marker.setMap(null);
	        });

	        destmarkers = [];

	        // For each place, get the icon, name and location.
	        var bounds = new google.maps.LatLngBounds();
	          var icon = {
	            url: place.icon,
	            size: new google.maps.Size(71, 71),
	            origin: new google.maps.Point(0, 0),
	            anchor: new google.maps.Point(17, 34),
	            scaledSize: new google.maps.Size(25, 25)
	          };

	          // Create a marker for each place.
	          destmarkers.push(new google.maps.Marker({
	            map: map.instance,
	            icon: icon,
	            title: place.name,
	            optimized: false,
	            position: place.geometry.location
	          }));

	          var destmarker = destmarkers[0];
	          console.log(destmarker.title);

	          google.maps.event.addListener(destmarker, 'click', function(){
	          	console.log('click');
	          	//var confirmed = confirm(destmarker.title + " as location?");
	          	IonPopup.confirm({
			      title: 'Are you sure?',
			      template: "<strong>" + destmarker.title + "</strong>" + " as location?",
			      onOk: function() {
			        var destination = {
	            		uid: Meteor.userId(),
	            		destGeoloc: {type: "Point", coordinates: [destmarker.position.G, destmarker.position.K]},
	            		destAddress: destmarker.title,
	            		when: new Date()
	            	} 
	            	var destId = Destinations.insert(destination);
	            	Session.setPersistent('destInfoId', destId);
			      },
			      onCancel: function() {
			        // do nothing
			      }
			    });
	          });

	          console.log(destmarker.position.G);

	          if (place.geometry.viewport) {
	            // Only geocodes have viewport.
	            bounds.union(place.geometry.viewport);
	          } else {
	            bounds.extend(place.geometry.location);
	          }
	        map.instance.fitBounds(bounds);
	      });
	    }


     function ButtonGroup(controlDiv, map) {

        controlDiv.className = 'button-bar';

        var refreshbutton = document.createElement('a');
        refreshbutton.className = 'button button-balanced';
        var refreshIcon = document.createElement('span');
        refreshIcon.className = "ion-refresh";
        refreshIcon.innerHTML = "&nbsp;Refresh";
        refreshbutton.appendChild(refreshIcon);

        if (Session.get("role") == "driver") {
	        var finalizebutton = document.createElement('a');
	        finalizebutton.className = 'button button-assertive';
	        var finalizeIcon = document.createElement('span');
	        finalizeIcon.className = "ion-model-s";
	        finalizeIcon.innerHTML = "&nbsp;Finalize";
	        finalizebutton.appendChild(finalizeIcon);

	        controlDiv.appendChild(finalizebutton);

	        finalizebutton.addEventListener('click', function() {   
	          var sts = Statuses.findOne({driverId:Meteor.userId()}, {});
	          if (sts) {
	          	Session.setPersistent("shouldShowTrip", true);
	          	Router.go("tripinfo");
	          } else {
	          	Router.go("welcome");
	          }
	          Session.setPersistent("submitted", false);
	        });
    	}

        controlDiv.appendChild(refreshbutton);

        refreshbutton.addEventListener('click', function() {
          document.location.reload(true);
        });
      }


    function CallButton(controlDiv, map, ride){
    	controlDiv.className = 'controls';
        //controlDiv.type = "button";
        controlDiv.id = "call";
        //controlDiv.value = 'Call';
        var icon = document.createElement('span');
        icon.innerHTML = "Call";
        icon.className = "glyphicon glyphicon-earphone";
        icon.setAttribute("aria-hidden", true);

        //controlDiv.value = "Call";
        controlDiv.appendChild(icon);

        controlDiv.addEventListener('click', function(){
        	var call = new ridetorowEvents(ride);
        	call.clickCall();
        });
    }


      // Create call button
       //setUpSearchBox();
    // Create and move the marker when latLng changes.
    self.autorun(function() {
    	console.log("autorun");
      var latLng = Geolocation.latLng();
      var currentPosition = new google.maps.LatLng(latLng.lat, latLng.lng);
     // if (! latLng)
       // return;
      //console.log(info);
      updateLocation();

     function updateLocation(){
	      var geoloc = {
	        uid: Meteor.userId(),
	        loc: {type: "Point", coordinates: [latLng.lat, latLng.lng]}
	      };
	      if (typeof Geolocations.findOne({uid: Meteor.userId()}, {}) != "undefined" ) {
	          var geolocation = Geolocations.findOne({uid: Meteor.userId()}, {});
	          Geolocations.update({_id: geolocation._id}, {$set: geoloc});
	          //Geolocations.update({_id: "h7jbTPQebyweWZQq3"}, {$set: {uid: "o7SXY5X5qKxx5YE7K", loc:{type: "Point", coordinates:[42.3, -71.1]}}});
	      } else {
	          Geolocations.insert(geoloc);
	      }

	      Session.setPersistent("geolocInfoId", Geolocations.findOne({uid: Meteor.userId()}, {})._id);
      }
      // Center and zoom the map view onto the current position.
      map.instance.setCenter(currentPosition);
      map.instance.setZoom(MAP_ZOOM);
    });
  });
});