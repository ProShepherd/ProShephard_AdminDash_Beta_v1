var app = angular.module("proShepherdAdmin", [
    'uiGmapgoogle-maps',
    'firebase',
    'proShepherdAdmin.Services'])
.controller('mapCtrl', function($scope, $timeout, uiGmapGoogleMapApi, Alert) {
    
    var mapFunctions = function() {
    	var infoWindow;  

    	$scope.map = {
          center: {
            latitude: 42.9851,
            longitude: -78.6680
          },
          zoom: 9,
          bounds: {}
        };
        
        $scope.options = {
	      scrollwheel: false
	    };

	    var getIcon = function(user) {
	    	var path = "assets/images/";

	    	if (user.type == "rider") {
	    		if (user.state == "normal") {
	    			return path + "rider-normal.png";
	    		} else if (user.state == "distressed") {
	    			return path + "rider-distressed.png";
	    		} else {
	    			return path + "rider-triage.png";
	    		}
	    	} else {
	    		if (user.state == "normal") {
	    			return path + "support-normal.png";
	    		} else {
	    			return path + "support-triage.png";
	    		}
	    	}
	    };

	    var createMarker = function(user) {

		    var marker = {
			    latitude: user.latitude,
			    longitude: user.longitude,
			    title: user.id,
			    icon: getIcon(user)
		    };
	        marker["id"] = user.id;

	        return marker;
	    };

	    var getMarker = function(user) {
	    	var arrayLength = $scope.markers.length;
			for (var i = 0; i < arrayLength; i++) {
			    if ( $scope.markers[i]["id"] == user.id) {
			    	return $scope.markers[i];
			    }
			}
			return null;
	    };

	    var updateMarker = function(user) {
	    	var marker = getMarker(user);
        	if (marker != null) {
        		marker.latitude = user.latitude;
        		marker.longitude = user.longitude;
		        $scope.$apply();
        	}
	    };

	    $scope.markers = [];

	    // Get the bounds from the map once it's loaded
	    $scope.$watch(function() {
	      return $scope.map.bounds;
	    }, function(nv, ov) {
	      // Only need to regenerate once
	      if (!ov.southwest && nv.southwest) {
	        var markers = [];
	        var tyler = {id:"uid-tyler", type:"rider", state:"normal", latitude: 42.9851, longitude: -78.6688};
	        var anthony = {id:"uid-anthony", type:"rider", state:"distressed", latitude: 42.7851, longitude: -78.7680};
	        var val = {id:"uid-val", type:"support", state:"triage", latitude: 42.8851, longitude: -78.8680};

	        markers.push(createMarker(tyler));
	        markers.push(createMarker(anthony));
	        markers.push(createMarker(val));
	        
	        $scope.markers = markers;
	      }
	    }, true);
    };

    uiGmapGoogleMapApi.then(function(maps) {
        mapFunctions();
    });
});

