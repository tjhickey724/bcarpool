var MAP_ZOOM = 15;

Meteor.startup(function() {  
  GoogleMaps.load({v:'3', key: 'AIzaSyA-dw_b_tu3Y-BYBS9B6WV0zHK2_OuN0QI', libraries: 'geometry,places'});
  //Geolocations._ensureIndex({loc: "2dsphere"})
});

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
    if (GoogleMaps.loaded() && latLng) {
      //console.log("lat: " + latLng.lat + "\n" + "lng: " + latLng.lng);
      var geoloc = {
        uid: Meteor.userId(),
        loc: {type: "Point", coordinates: [latLng.lat, latLng.lng]}
        //dest: {type: "Point", coordinates: []}  
      };
      if (typeof Geolocations.findOne({uid: Meteor.userId()}, {}) != "undefined" ) {
          var geolocation = Geolocations.findOne({uid: Meteor.userId()}, {});
          Geolocations.update({_id: geolocation._id}, {$set: geoloc});
          //Geolocations.update({_id: "h7jbTPQebyweWZQq3"}, {$set: {uid: "o7SXY5X5qKxx5YE7K", loc:{type: "Point", coordinates:[42.3, -71.1]}}});
      } else {
          Geolocations.insert(geoloc);
      }
      Session.setPersistent("geolocInfoId", Geolocations.findOne({uid: Meteor.userId()}, {})._id);
      return {
        center: new google.maps.LatLng(latLng.lat, latLng.lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        //center: {lat: Geolocations.findOne({uid: Meteor.userId()}, {}).loc.coordinates[0], lng: Geolocations.findOne({uid:Meteor.userId()}, {}).loc.coordinates[0]},
        zoom: MAP_ZOOM
      };
    }
  }
});

Template.map.events({
  "click #finalize": function(event){
    //console.log("click");
  }
});

Template.map.onCreated(function() {  
  var self = this;

  GoogleMaps.ready('map', function(map) {
    var locmarkers = [];
    var destpins = [];
    var infowindow = new google.maps.InfoWindow({
                  content: "holding..."
                });

    setUpSearchBox();

    function CenterControl(controlDiv, map) {

        // Set CSS for the control border.
        //var controlDiv = document.createElement('input');
        controlDiv.className = 'controls';
        controlDiv.type = "button";
        controlDiv.id = "finalize";
        controlDiv.value = 'Finalize';
        //controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.

        // Setup the click event listeners: simply set the map to Chicago.
        controlDiv.addEventListener('click', function() {
          console.log("click");
          /*
          if(Session.get("role") == "rider"){
            destpins.forEach(function(destpin, index){
              if (destpin.role != "driver" || destpin.role != "self"){
                destpin.setMap(null);
              }
            });
            locmarkers.forEach(function(locmarker, index){
              if (locmarker.role != "driver" || locmarker.role != "self"){
                locmarker.setMap(null);
              }
            });
          } else {
            destpins.forEach(function(destpin, index){
              if (destpin.role != "rider" || destpin.role != "self"){
                destpin.setMap(null);
              }
            });
            locmarkers.forEach(function(locmarker, index){
              if (locmarker.role != "rider" || locmarker.role != "self"){
                locmarker.setMap(null);
              }
            });
          } 
          */
        });
      }

    function setUpSearchBox(){
      // Create the search box and link it to the UI element.
      var input = self.find("#pac-input");
      //var finalize = self.find("#finalize");
      var searchBox = new google.maps.places.SearchBox(input);
      map.instance.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      //map.instance.controls[google.maps.ControlPosition.TOP_LEFT].push(finalize);

      var centerControlDiv = document.createElement('input');
      var centerControl = new CenterControl(centerControlDiv, map.instance);
      //console.log(centerControlDiv);

      //centerControlDiv.index = 1;
      map.instance.controls[google.maps.ControlPosition.TOP_LEFT].push(centerControlDiv);

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
            position: place.geometry.location
          }));

          var destmarker = destmarkers[0];

          google.maps.event.addListener(destmarker, 'click', function(){
            var confirmed = confirm(destmarker.title + " as location?");
            var ride = Session.get("ride");
            ride.destGeoloc = {type: "Point", coordinates: [destmarker.position.G, destmarker.position.K]};
            ride.destAddress = destmarker.title;
            if(confirmed){
                RideInfo.update({_id:Session.get("rideinfoId")}, {$set:ride});
            }
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

    // Create and move the marker when latLng changes.
    self.autorun(function() {
      var latLng = Geolocation.latLng();
      var currentPosition = new google.maps.LatLng(latLng.lat, latLng.lng);
     // if (! latLng)
       // return;
      var locations = [];
      var info = [];
      var geolocations = Geolocations.find().fetch();
      geolocations.forEach(function(location, index){
        locations.push({lat: location.loc.coordinates[0], lng: location.loc.coordinates[1]});
        info.push(generateHTML(location.uid));
      });
      //console.log(info);

      var rides = RideInfo.find().fetch();
      rides.forEach(function(ride, index){
        //console.log(ride);
        if(ride.uid != Meteor.userId()){
          if (Session.get("role") == "rider"){
            if (ride.status1 == "driver"){
              destpins.push(new google.maps.Marker({
                position: {lat: ride.destGeoloc.coordinates[0], lng: ride.destGeoloc.coordinates[1]},
                map: map.instance,
                uid: ride.uid,
                role: ride.status1,
                html:'<p>'+ride.destAddress+'</p>'
              }));
            }
          } else {
            if (ride.status1 == "rider"){
              destpins.push(new google.maps.Marker({
                position: {lat: ride.destGeoloc.coordinates[0], lng: ride.destGeoloc.coordinates[1]},
                map: map.instance,
                uid: ride.uid,
                role: ride.status1,
                html:'<p>'+ride.destAddress+'</p>'
              }));
            }
          }
        } else {
          destpins.push(new google.maps.Marker({
            position: {lat: ride.destGeoloc.coordinates[0], lng: ride.destGeoloc.coordinates[1]},
            map: map.instance,
            uid: ride.uid,
            role: "self",
            html:'<p>'+ride.destAddress+'</p>',
            label: "M"
          }));
        }
      });

      destpins.forEach(function(destpin, index){
        google.maps.event.addListener(destpin, 'click', function(){
          infowindow.setContent(this.html);
          infowindow.open(map.instance, this);
        });
      });


      drop();

      function generateHTML(userId){
        var rideInfo = RideInfo.findOne({uid: userId}, {});
        //var content = "My ass";
        if (userId == Meteor.userId()){
          return {html: '<p>You</p>', role: "self", uid: userId, who:rideInfo.who};
        }


        //console.log();
        var content;
        var role;
        if(rideInfo.status1 == "rider"){
          content = '<table class="table table-striped">'+
                        '<thead>' +
                        '<tr><th>Name</th><th>Go To</th><th>Time</th></tr>' +
                      '</thead>' +
                      '<tbody>' +
                        '<tr><td>'+rideInfo.who+'</td><td>'+rideInfo.destAddress+'</td><td>'+rideInfo.when+'</td></tr>' +
                      '</tbody>' +
                    '</table>'+'<input type="button" name="pickup" id="pickup" value="Pick Up">';
          role = "rider";

        }else{
          content = '<table class="table table-striped">'+
                        '<thead>' +
                        '<tr><th>Name</th><th>Back To</th><th>Time</th></tr>' +
                      '</thead>' +
                      '<tbody>' +
                        '<tr><td>'+rideInfo.who+'</td><td>'+rideInfo.destAddress+'</td><td>'+rideInfo.when+'</td></tr>' +
                      '</tbody>' +
                    '</table>'+'<input type="button" name="getride" id="getride" value="Get A Ride">';
          role = "driver";
        }
        

        return {html:content, role:role, uid:rideInfo.uid, who:rideInfo.who};
      }

      function drop() {
        clearMarkers();
        var totalTimeOut = 0;
        for (var i = 0; i < locations.length; i++) {
          totalTimeOut += i*200;
          addMarkerWithTimeout(locations[i], i+1, i * 200);
        }
        window.setTimeout(function(){
          addMarkers();
        }, totalTimeOut);
      }
      // If the marker doesn't yet exist, create it.
      function addMarkerWithTimeout(position, labelindex, timeout) {
        //console.log(titleinfo);
        window.setTimeout(function() {
          if (Session.get("role") == "rider"){
            if(info[labelindex-1].role == "driver" || info[labelindex-1].role == "self"){
                locmarkers.push(new google.maps.Marker({
                position: position,
                animation: google.maps.Animation.DROP,
                map: map.instance,
                uid: info[labelindex-1].uid,
                role: info[labelindex-1].role,
                label: info[labelindex-1].who,
                //html: '<div id="infowindow'+labelindex+'>'+info[labelindex-1]+'</div>'
                html: info[labelindex-1].html
              }));
          }
        } else {
          if(info[labelindex-1].role == "rider" || info[labelindex-1].role == "self"){
                locmarkers.push(new google.maps.Marker({
                position: position,
                animation: google.maps.Animation.DROP,
                map: map.instance,
                uid: info[labelindex-1].uid,
                role: info[labelindex-1].role,
                label: info[labelindex-1].who,
                //html: '<div id="infowindow'+labelindex+'>'+info[labelindex-1]+'</div>'
                html: info[labelindex-1].html
              }));
          }
        }
        }, timeout);
      }

      function clearMarkers() {
        for (var i = 0; i < locmarkers.length; i++) {
          locmarkers[i].setMap(null);
        }
        locmarkers = [];
      }

      function addMarkers(){ 
          locmarkers.forEach(function(marker, index){
            google.maps.event.addListener(marker, 'click', function(){
              infowindow.setContent(this.html);
              infowindow.open(map.instance, this);
              if(this.role == "rider"){
                self.find("#pickup").addEventListener('click', function(){
                  console.log("pickup");
                });
              }
            });
          });
      }

      // Center and zoom the map view onto the current position.
      map.instance.setCenter(currentPosition);
      map.instance.setZoom(MAP_ZOOM);
    });
  });
});