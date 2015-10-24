var app = angular.module("proShepherdAdmin", [
    'uiGmapgoogle-maps',
    'firebase',
    'proShepherdAdmin.Services'])
.controller('mapCtrl', function($scope, $timeout, uiGmapGoogleMapApi, Alert) {
    
    uiGmapGoogleMapApi.then(function(maps) {
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

	    var createMarker = function(name, latitude, longitude) {
	      var ret = {
	        latitude: latitude,
	        longitude: longitude,
	        title: name
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
	        markers.push(createMarker('tyler', 42.9851, -78.6680));
	        markers.push(createMarker('anthony', 42.7851, -78.7680));
	        markers.push(createMarker('val', 42.8851, -78.8680));
	        
	        $scope.markers = markers;
	      }
	    }, true);
        
    });
});

