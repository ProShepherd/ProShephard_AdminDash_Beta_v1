var app = angular.module("proShepherdAdmin", ['uiGmapgoogle-maps'])
.controller('mapCtrl', function($scope, $timeout, uiGmapGoogleMapApi) {
    
    var mapFunctions = function() {
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

	    var createMarker = function(name, latitude, longitude, iconPath) {

		    var ret = {
			    latitude: latitude,
			    longitude: longitude,
			    title: name,
			    icon: iconPath
		    };
	        ret["id"] = name;
	        return ret;
	    };

	    $scope.markers = [];

	    // Get the bounds from the map once it's loaded
	    $scope.$watch(function() {
	      return $scope.map.bounds;
	    }, function(nv, ov) {
	      // Only need to regenerate once
	      if (!ov.southwest && nv.southwest) {
	        var markers = [];
	        var tyler = {type:"rider", state:"normal"};
	        var anthony = {type:"rider", state:"distressed"};
	        var val = {type:"support", state:"triage"};

	        markers.push(createMarker('tyler', 42.9851, -78.6680, getIcon(tyler)));
	        markers.push(createMarker('anthony', 42.7851, -78.7680, getIcon(anthony)));
	        markers.push(createMarker('val', 42.8851, -78.8680, getIcon(val)));
	        
	        $scope.markers = markers;
	      }
	    }, true);
    };

    uiGmapGoogleMapApi.then(function(maps) {
        mapFunctions();
    });
});

