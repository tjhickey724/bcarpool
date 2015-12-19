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
							if (Trips.find().fetch().length != 0){
								var trip = Trips.findOne({driverId: Meteor.userId()});
								var psgs = trip.passengerIds;
								if ($.inArray(ride.uid, psgs) === -1){
									psgs.push(ride.uid);
								}
								var newpsg = {
									driverId: Meteor.userId(),
									passengerIds: psgs,
									when: new Date()
								};
								Meteor.apply('updateTrip', [trip._id, newpsg], [], function(err, result){
									if(!err){
										//do something
									}
								});
							} else {
								var newpsg = {
									driverId: Meteor.userId(),
									passengerIds: [ride.uid],
									when: new Date()
								};
								Meteor.apply('insertTrip', [newpsg], [], function(err, result){
									if(!err){
										//do something
									}
								});
							}
						} else {
							Meteor.apply('getTrip', [ride.uid], [], function(err, result){
									if(!err){
										if (result != undefined){
											var psgs = result.passengerIds;
											if ($.inArray(Meteor.userId(), psgs) === -1){
												psgs.push(Meteor.userId());
											}
											var newpsg = {
												driverId: ride.uid,
												passengerIds: psgs,
												when: new Date()
											};
											Meteor.apply('updateTrip', [result._id, newpsg], [], function(err, result){
												if(!err){
													//do something
												}
											});
										} else {
											var newpsg = {
												driverId: ride.uid,
												passengerIds: [Meteor.userId()],
												when: new Date()
											};
											Meteor.apply('insertTrip', [newpsg], [], function(err, result){
												if(!err){
													//do something
												}
											});
										}
									}
								});
						}
						Meteor.apply('updateRequest', [id, object], [], function(err, result){
							if(!err){
								//do something
							}
						});
				      },
				      onCancel: function() {
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

								Meteor.apply('removeRequest', [id], [], function(err, result){
									if(err){
										console.log("can't remove request");
									}
								});
				      }
				    });
				}

		}
	}
});


Trips.find().observeChanges({
	removed: function(id){
		if (Session.get("destInfoId")){
			Meteor.apply('removeDest', [Session.get("destInfoId")], {wait:true}, function(err, result){
				if (!err) {
					// do some
				}
			});
		}
			var ride = RideInfo.findOne({uid: Meteor.userId()});
			var geoloc = Geolocations.findOne({uid: Meteor.userId()});
			Router.go("welcome");
			Session.set("submitted", false);
			Meteor.apply('removeGeoloc', [geoloc._id], {wait:true}, function(err, result){
				if (!err) {
					// do some
				}
			});
			Meteor.apply('removeRideInfo', [ride._id], {wait:true}, function(err, result){
				if (!err) {
					// do some
				}
			});
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


Template.map.onCreated(function() {
//console.log("created");
  var self = this;
	IonLoading.show({
		backdrop: true
	});
  GoogleMaps.ready('map', function(map) {
		IonLoading.hide();
    var locmarkers = [];
    var infowindow = new google.maps.InfoWindow({
                  content: "holding..."
                });

    var input = self.find("#pac-input");
    if (Session.get("direction") == "to"){
    	$("#pac-input").prop("disabled", true);
    } else {
    	$("#pac-input").prop("disabled", false);
			if (Session.get('tips')){
				IonPopup.alert({
						title: 'Attention',
						template: "<p>if you're on mobile, please press <strong>Enter key</strong> on the Keyboard when done typing Destination Address;)</p> <p>You can turn this off in <strong>settings</strong>.</p>",
						okText: 'Ok'
					});
			}
    }
    //$("#pac-input").attr('data-tap-disabled', true);
    /*
    var circle_menu = self.find("#circle-menu");
    map.instance.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(circle_menu);
	*/


    var searchBox = new google.maps.places.SearchBox(input);
    map.instance.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    setUpSearchBox();

    var listButtonGroupDiv = document.createElement('ul');
    var listButtonGroup = new ListButtonGroup(listButtonGroupDiv, map.instance);

    //var buttonGroupDiv = document.createElement('div');
    //var buttonGroup = new ButtonGroup(buttonGroupDiv, map.instance);

   	map.instance.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(listButtonGroupDiv);


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
			    	} else {
			    		if (geo != undefined) {
			    			removeLocMarker(geo._id);
			    		}
			    	}
			    } else {
			    	if (geo != undefined) {
			    		removeLocMarker(geo._id);
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

					if (Session.get('tips')){
						IonPopup.alert({
								title: 'Tips',
								template: 'Press the <strong>marker</strong> to confirm destination ;)',
								okText: 'Ok'
							});
					}

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


     function ListButtonGroup(controlDiv, map) {
     	controlDiv.className = 'list';
     	controlDiv.id = 'mapControlBar';

     	var buttonGroup2 = document.createElement('div');
        buttonGroup2.className = 'button-bar';
        //buttonGroup2.id = 'mapControlBar';

        var refreshbutton = document.createElement('a');
        refreshbutton.className = 'button button-balanced button-block item';
        var refreshIcon = document.createElement('span');
        refreshIcon.className = "ion-refresh";
        refreshIcon.innerHTML = "&nbsp;Refresh";
        refreshbutton.appendChild(refreshIcon);


        var followbutton = document.createElement('a');
        followbutton.className = 'button button-positive';
        var followIcon = document.createElement('span');
        followIcon.className = "ion-navigate";
        followIcon.innerHTML = "&nbsp;Tracking";
        followbutton.appendChild(followIcon);
        /*
        var selectbutton = document.createElement('a');
        selectbutton.className = 'button button-positive';
        selectbutton.innerHTML = "Select";

        selectbutton.addEventListener('click', function(){
        	google.maps.event.trigger(searchBox, 'places_changed', {});
        });
		*/
		controlDiv.appendChild(refreshbutton);


        if (Session.get("role") == "driver") {
	        var finalizebutton = document.createElement('a');
	        finalizebutton.className = 'button button-assertive';
	        var finalizeIcon = document.createElement('span');
	        finalizeIcon.className = "ion-model-s";
	        finalizeIcon.innerHTML = "&nbsp;I'm Leaving";
	        finalizebutton.appendChild(finalizeIcon);

	        buttonGroup2.appendChild(finalizebutton);

	        finalizebutton.addEventListener('click', function() {

						var trip = Trips.findOne();

						if (trip != undefined){
							var reqs = Requests.find();
							reqs.forEach(function(req, index){
									Meteor.apply('removeRequest', [req._id], {wait:true}, function(err, result){
									if (!err) {
										Session.set("reqId", null);
									}
								});
							});
							var triptohist;
							var driver;
							var psgs = [];
							var when = moment(trip.when).format('llll');
								Meteor.apply('getRideInfo', [trip.driverId], {wait:true}, function(err, result){
										if(!err){
											driver = result.who;
											trip.passengerIds.forEach(function(psgId, index){
												Meteor.apply('getRideInfo', [psgId], {wait:true}, function(err, result){
													if(!err){
														psgs.push(result.who);
															triptohist = {
																uid: result.uid,
																driver: driver,
																passengers: psgs,
																when: when
															};
															Meteor.apply('insertHistory', [triptohist], {wait:true}, function(err, result){
																if (!err) {
																	if (index == trip.passengerIds.length - 1){
																		triptohist = {
																			uid: Meteor.userId(),
																			driver: driver,
																			passengers: psgs,
																			when: when
																		};
																		Meteor.apply('insertHistory', [triptohist], {wait:true}, function(err, result){
																			if (!err) {
																				Meteor.apply('removeTrip', [trip._id], {wait:true}, function(err, result){
																					if (!err) {
																						// do something
																					}
																				});
																			}
																		});
																	}
																}
															});
													}
												});
											});
										}
								});
						}
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
        		$(this).find('span').html("&nbsp;Tracking");
        		$(this).find('span').removeClass('ion-earth');
        		$(this).find('span').addClass('ion-navigate');
        	}
        });

        buttonGroup2.appendChild(followbutton);

        controlDiv.appendChild(buttonGroup2);
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

      // Create call button
       //setUpSearchBox();
    // Create and move the marker when latLng changes.
    self.autorun(function() {
      var latLng = Geolocation.latLng();
      var currentPosition = new google.maps.LatLng(latLng.lat, latLng.lng);
      updateLocation(latLng);

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
