var MAP_ZOOM = 15;

var cursor = Requests.find();
cursor.observeChanges({
	added: function(id, object) {
		if (object.receiverId == Meteor.userId()) {
				if (object.theStatus == "pending") {
					var ride = RideInfo.findOne({uid: object.senderId}, {});
					var myself = Session.get("ride");
					IonPopup.confirm({
				      title: 'Request',
				      template: "<strong>" + ride.who + "</strong>" + " send you a request: \n" + object.message,
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
						var destAddress1;
						var destAddress2;
						if (Destinations.findOne({uid:ride.uid}, {}) == undefined){
							destAddress1 = "N/A";
						} else {
							destAddress1 = Destinations.findOne({uid:ride.uid}, {}).destAddress;
						}
						if (Destinations.findOne({uid:Meteor.userId()}, {}) == undefined){
							destAddress2 = "N/A";
						} else {
							destAddress2 = Destinations.findOne({uid:Meteor.userId()}, {}).destAddress;
						}
						var trip1 = {
								uid: Meteor.userId(),
								partnerId: ride.uid,
								name: ride.who, 
								phone: ride.phone, 
								dest: destAddress1, 
								when: new Date()};
						var trip2 = {
								uid: ride.uid,
								partnerId: Meteor.userId(),
								name: myself.who, 
								phone: myself.phone, 
								dest: destAddress2, 
								when: new Date()};
						Meteor.apply('insertTrip', [trip1], [], function(err, result){
							if(!err){
								//do something
							}
						});
						Meteor.apply('insertTrip', [trip2], [], function(err, result){
							if(!err){
								//do something
							}
						});
						var guestRole = "";
						if (Session.get("role") == "driver"){
							guestRole = "rider";
						} else if (Session.get("role") == "rider") {
							guestRole = "driver";
						}
						var history1 = {
								uid: Meteor.userId(),
								partnerId: ride.uid,
								name: ride.who,
								role:  guestRole,
								phone: ride.phone, 
								dest: destAddress1, 
								when: new Date()};
						var history2 = {
								uid: ride.uid,
								partnerId: myself.uid,
								name: myself.who,
								role:  Session.get("role"),
								phone: myself.phone, 
								dest: destAddress2, 
								when: new Date()};
						Meteor.apply('insertHistory', [history1], [], function(err, result){
							if(!err){
								//do something
							}
						});
						Meteor.apply('insertHistory', [history2], [], function(err, result){
							if(!err){
								//do something
							}
						});

						Meteor.apply('insertStatus', [sts], [], function(err, result){
							if(!err){
								Session.setPersistent("statusInfoId", result);
							}
						});
						object.when = new Date();
						Meteor.apply('updateRequest', [id, object], [], function(err, result){
							if(!err){
								//do something
							}
						});
				      },
				      onCancel: function() {
				        object.theStatus = "rejected";
				        var driverInfo;
						if (object.senderIsRider) {
							var driverInfo = RideInfo.findOne({uid: object.receiverId}, {});
						} else {
							var driverInfo = RideInfo.findOne({uid: object.senderId}, {});
						}
						var driverId = driverInfo._id;
						var space = driverInfo.carSpace + 1;
						Meteor.apply('updateRideInfo', [driverId, {carSpace: space}], [], function(err, result){
							if(!err){
								//do something
							}
						});
						object.when = new Date();
						Meteor.apply('updateRequest', [id, object], [], function(err, result){
							if(!err){
								//do something
							}
						});
				      }
				    });
				}
			
		}
	}
});


/*Tracker.autorun(function(){
	var changer = Session.get("changedObj");
	var subs = Meteor.subscribe('rideinfo', changer);
	if (subs.ready()){
		console.log(RideInfo.find().fetch().length);
	}
	console.log("changedObj rerun");
});*/

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


Template.map.onRendered(function(){
	/*
	this.autorun(function () {
    if (GoogleMaps.loaded()) {
      $("#pac-input").geocomplete().bind("geocode:result", function(event, result){
      	Session.setPersistent('place', result);
      	Session.setPersistent('place_location', {lat: result.geometry.location.lat(), lng: result.geometry.location.lng()});
      	console.log(result.geometry);
	  });
    }
  });*/

});


Template.map.onCreated(function() { 
//console.log("created");
  var self = this;

  GoogleMaps.ready('map', function(map) {
  	//console.log("ready");
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
    //$("#pac-input").attr('data-tap-disabled', true);
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


    if (Session.get("direction") == "from"){
    	dropDestPins();
    }
    //dropLocMarkers();

    RideInfo.find().observeChanges({
    	added: function(id, object) {
    		console.log("ride added");
    		Meteor.subscribe('geolocations', id);
    	},
    	changed: function(id, object) {
    		//Session.set('changedObj', object);
    		console.log("ridechange");
    		var userId = RideInfo.findOne({_id: id}, {}).uid;
    		if (userId != Meteor.userId()) {
	    		var geo = Geolocations.findOne({uid:userId}, {});
	    		var dest = Destinations.findOne({uid:userId}, {});
	    		console.log(geo);
	    		if (object.direction == Session.get("direction")){
	    			console.log("direction equal");
			    	if (object.status1 != Session.get("role")){
			    		if (geo != undefined) {
			    			dropSingleLocMarker(geo._id, geo);
			    		}
			    		if (dest != undefined) {
			    			dropSingleDestPin(dest._id, dest);
			    		}
			    	} else {
			    		if (geo != undefined) {
			    			removeLocMarker(geo._id);
			    		}
			    		if (dest != undefined) {
			    			removeDestPin(dest._id);
			    		}
			    	}
			    } else {
			    	if (geo != undefined) {
			    		removeLocMarker(geo._id);
			    	}
			    	if (dest != undefined) {
			    		removeDestPin(dest._id);
			    	}
			    }
    		}
    	},
		removed: function(id) {
			console.log("rideinfo removed");
			var symbol = id + 'remove';
			Meteor.subscribe('geolocations', symbol);
			/*
			var userId = RideInfo.findOne({_id: id}, {}).uid;
			var geo = Geolocations.findOne({uid:userId}, {});
	    	var dest = Destinations.findOne({uid:userId}, {});
			console.log("removed rideinfo");
			if (geo != undefined) {
			    removeLocMarker(geo._id);
			}
			if (dest != undefined) {
			    removeDestPin(dest._id);
			}
			*/
		}
	});


	Geolocations.find().observeChanges({
		added: function(id, location) {
			console.log("added");
			console.log(location);
			dropSingleLocMarker(id, location);
		},
		changed: function(id, location) { // update marker position when changed
			//console.log("changed");
			
			for (i = 0; i < locmarkers.length; i++) {
				if (locmarkers[i]._id == id){
					locmarkers[i].position = new google.maps.LatLng(location.loc.coordinates[0], location.loc.coordinates[1]);
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
		added: function(id, dest){ /* drop destpins */
			//dropSingleDestPin(id, dest);
		},
		removed: function(id){ /* remove destpin */
			removeDestPin(id);
		}
	});


	function dropSingleDestPin(id, dest){
		
		var ride = RideInfo.findOne({uid: dest.uid}, {});
			console.log(dest.destGeoloc);
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

      function dropSingleLocMarker(id, location) {
			var ride = RideInfo.findOne({uid: location.uid}, {});
			var locmarker = new google.maps.Marker({
				                position: new google.maps.LatLng(location.loc.coordinates[0], location.loc.coordinates[1]),
				                animation: google.maps.Animation.DROP,
				                map: map.instance,
				                uid:location.uid,
				                label:ride.who,
				                _id: id
				              });
			locmarkers.push(locmarker);
			addEventsForLocMarker(locmarker);
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
      		var destInfo;
      		var rideInfo = RideInfo.findOne({uid: marker.uid}, {});
      		var destInfo = Destinations.findOne({uid: marker.uid}, {});
			IonModal.open('infomodal', [rideInfo, destInfo]);
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

	        console.log("setup");
	      
	      //google.maps.event.addListener(searchBox, 'places_changed', function() {
	      searchBox.addListener('places_changed', function(){
	      	console.log("places_changed");

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
	            position: place.geometry.location
	          }));

	          var destmarker = destmarkers[0];
	          //console.log(destmarker.title);

	          google.maps.event.addListener(destmarker, 'click', function(){
	          	//console.log(destmarker.position.lat());
	          	//var confirmed = confirm(destmarker.title + " as location?");
	          	IonPopup.confirm({
			      title: 'Are you sure?',
			      template: "<strong>" + destmarker.title + "</strong>" + " as location?",
			      onOk: function() {
			        var destination = {
	            		uid: Meteor.userId(),
	            		destGeoloc: {type: "Point", coordinates: [destmarker.position.lat(), destmarker.position.lng()]},
	            		destAddress: destmarker.title,
	            		when: new Date()
	            	}
	            	Meteor.apply('updateDest', [destination], [], function(err, result){
	            		if (!err){
	            			Session.setPersistent('destInfoId', result);
	            		}
	            	});
			      },
			      onCancel: function() {
			        // do nothing
			      }
			    });
	          });

	          //console.log(destmarker.position.lat());

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
        controlDiv.id = 'mapControlBar'

        var refreshbutton = document.createElement('a');
        refreshbutton.className = 'button button-balanced';
        var refreshIcon = document.createElement('span');
        refreshIcon.className = "ion-refresh";
        refreshIcon.innerHTML = "&nbsp;Refresh";
        refreshbutton.appendChild(refreshIcon);


        var followbutton = document.createElement('a');
        followbutton.className = 'button button-positive';
        var followIcon = document.createElement('span');
        followIcon.className = "ion-navigate";
        followIcon.innerHTML = "&nbsp;Following";
        followbutton.appendChild(followIcon);
        /*
        var selectbutton = document.createElement('a');
        selectbutton.className = 'button button-positive';
        selectbutton.innerHTML = "Select";

        selectbutton.addEventListener('click', function(){
        	google.maps.event.trigger(searchBox, 'places_changed', {});
        });
		*/


        if (Session.get("role") == "driver") {
	        var finalizebutton = document.createElement('a');
	        finalizebutton.className = 'button button-assertive';
	        var finalizeIcon = document.createElement('span');
	        finalizeIcon.className = "ion-model-s";
	        finalizeIcon.innerHTML = "&nbsp;I'm Leaving";
	        finalizebutton.appendChild(finalizeIcon);

	        controlDiv.appendChild(finalizebutton);

	        finalizebutton.addEventListener('click', function() {   
	          var sts = Statuses.findOne({driverId:Meteor.userId()}, {});
	          if (sts) {
	          		var reqs = Requests.find();
	          		reqs.forEach(function(req, index){
	          			Meteor.apply('removeRequest', [req._id], [], function(err, result){
							if (!err) {
								Session.set("reqId", null);
							}
						});
	          		});
	          var trip1 = Trips.find({uid: Meteor.userId()}, {});
	          var addSpace = 0;
	          trip1.forEach(function(thetrip, index){
	          	if (Session.get("destInfoId")){
	          		Meteor.apply('removeDest', [Session.get("destInfoId")], [], function(err, result){
							if (!err) {
								// do some
							}
						});
	          	}
	          	if (Destinations.findOne({uid: thetrip.partnerId}, {}) != undefined){
	          		Meteor.apply('removeDest', [Destinations.findOne({uid: thetrip.partnerId}, {})._id], [], function(err, result){
							if (!err) {
								// do some
							}
						});

	          	}
	          	Meteor.apply('removeStatus', [sts._id], [], function(err, result){
							if (!err) {
								// do some
							}
						});
	          	 var trip2 = Trips.find({$and: [{uid: thetrip.partnerId}, {partnerId: thetrip.uid}]}, {});
	          	 trip2.forEach(function(thetrip2, idx){
	          	 	Meteor.apply('removeTrip', [thetrip2._id], [], function(err, result){
							if (!err) {
								// do some
							}
						});
	          	 });
	          	Meteor.apply('removeTrip', [thetrip._id], [], function(err, result){
							if (!err) {
								// do some
							}
						});
	          	addSpace += 1;
	          });

				var driverInfo = RideInfo.findOne({uid: Meteor.userId()},{});

				Meteor.apply('updateRideInfo', [driverInfo._id, {carSpace: driverInfo.carSpace + addSpace}], [], function(err, result){
					if (!err) {
						// do something
					}
				});
			}
	          Router.go("welcome");
	          Session.setPersistent("submitted", false);
	        });
    	}

        refreshbutton.addEventListener('click', function() {
          document.location.reload(true);
        });

        followbutton.addEventListener('click', function() {
        	if(Session.get("follow")){
        		Session.setPersistent("follow", false);
        		$(this).removeClass("button-positive");
        		$(this).addClass("button-energized");
        		$(this).find('span').html("&nbsp;Roaming");
        		$(this).find('span').removeClass('ion-navigate');
        		$(this).find('span').addClass('ion-earth');
        	} else {
        		Session.setPersistent("follow", true);
        		$(this).removeClass("button-energized");
        		$(this).addClass("button-positive");
        		$(this).find('span').html("&nbsp;Following");
        		$(this).find('span').removeClass('ion-earth');
        		$(this).find('span').addClass('ion-navigate');
        	}
        });

        controlDiv.appendChild(refreshbutton);
        controlDiv.appendChild(followbutton);
        //controlDiv.appendChild(selectbutton);
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

    /*
    Meteor.subscribe("rideinfo", Session.get("follow"), function(){
      	console.log(RideInfo.find().fetch().length);
      });
      Meteor.subscribe("requests");
      Meteor.subscribe("statuses");
      Meteor.subscribe("trips");
      Meteor.subscribe("geolocations", Session.get("follow"));
      Meteor.subscribe("destinations");
      */

      // Create call button
       //setUpSearchBox();
    // Create and move the marker when latLng changes.
    self.autorun(function() {
      var latLng = Geolocation.latLng();
      var currentPosition = new google.maps.LatLng(latLng.lat, latLng.lng);
      updateLocation(latLng);

      /*
      $("#pac-input").geocomplete().bind("geocode:result", function(event, result){
	      // Bias the SearchBox results towards current map's viewport.
	      google.maps.event.addListener(map, 'bounds_changed', function(){
	        searchBox.setBounds(map.getBounds());
	      });

	      var destmarkers = [];

	        //var place_location = Session.get('place_location');
	        //var place = Session.get('place');
	        var place = result

	      	if (place) {
	        console.log("places_changed");
	        console.log(place);

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
	            title: place.formatted_address,
	            position: place.geometry.location
	          }));

	          var destmarker = destmarkers[0];
	          console.log(destmarker.title);

	          google.maps.event.addListener(destmarker, 'click', function(){
	          	//console.log(destmarker.position.lat());
	          	//var confirmed = confirm(destmarker.title + " as location?");
	          	IonPopup.confirm({
			      title: 'Are you sure?',
			      template: "<strong>" + destmarker.title + "</strong>" + " as location?",
			      onOk: function() {
			        var destination = {
	            		uid: Meteor.userId(),
	            		destGeoloc: {type: "Point", coordinates: [destmarker.position.lat(), destmarker.position.lng()]},
	            		destAddress: destmarker.title,
	            		when: new Date()
	            	}
	            	Meteor.apply('updateDest', [destination], [], function(err, result){
	            		if (!err){
	            			Session.setPersistent('destInfoId', result);
	            		}
	            	});
			      },
			      onCancel: function() {
			        // do nothing
			      }
			    });
	          });

	          //console.log(destmarker.position.lat);
	          console.log(place.geometry.viewport);
	          if (place.geometry.viewport) {
	            // Only geocodes have viewport.
	            bounds.union(place.geometry.viewport);
	          } else {
	            bounds.extend(place.geometry.location);
	          }
	        map.instance.fitBounds(bounds);
	        Session.set('place', null);
	        Session.set('place_location', null);
	    }

	    });*/
      // Center and zoom the map view onto the current position.
      if (Session.get("follow")){
	      map.instance.setCenter(currentPosition);
	      map.instance.setZoom(MAP_ZOOM);
  		}



  	function updateLocation(latLng){
	      var geoloc = {
	        uid: Meteor.userId(),
	        loc: {type: "Point", coordinates: [latLng.lat, latLng.lng]}
	      };

	      Meteor.apply("updateGeoloc", [geoloc], [], function(err, result){
	      	console.log(result);
	      	Session.setPersistent("geolocInfoId", result);
	      });
      }
    

    });
  });
});


