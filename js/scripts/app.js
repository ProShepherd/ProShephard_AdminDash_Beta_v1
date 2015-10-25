var app = angular.module("proShepherdAdmin", [
    'uiGmapgoogle-maps',
    'firebase',
    'proShepherdAdmin.Services',
    'ui.bootstrap'])
.controller('mapCtrl', function($scope, $timeout, uiGmapGoogleMapApi, Alerts) {
    
    $scope.markers = [];
    $scope.updateMarker = null;
    $scope.createMarker = null;
    $scope.getMarker = null;
    $scope.getIcon = null;
    $scope.alerts = [];
    
    $scope.init = function() {
        Alerts('Test-Event').$bindTo($scope, 'eventAlerts')
        .then(function(result) {
            console.dir($scope.eventAlerts);
        });
    };
    
    $scope.alertStatusTypes = {
        "Step1": "Distressed",
        "Step2": "En-route",
        "Step3": "On site",
        "Step4": "Resolved"
    };
    
    $scope.createMarker = function(user) {
        var ret = {
            latitude: user.latitude,
            longitude: user.longitude,
            title: user.id,
            icon: getIcon(user)
        };

        return ret;
    };
    
    var mapFunctions = function() {
        
        $scope.init();

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

	    $scope.getIcon = function(user) {
	    	var path = "assets/images/";

	    	if (user.type == "user") {
	    		if (user.state == "normal") {
	    			return path + "rider-normal.png";
	    		} 
                else if (user.state == "distressed") {
	    			return path + "rider-distressed.png";
	    		} 
                else {
	    			return path + "rider-triage.png";
	    		}
	    	} else {
	    		if (user.state == "normal") {
	    			return path + "support-normal.png";
	    		}
                else {
	    			return path + "support-triage.png";
	    		}
	    	}
	    };

         $scope.createMarker = function(user) {

		    var marker = {
			    latitude: user.latitude,
			    longitude: user.longitude,
			    title: user.id,
			    icon: $scope.getIcon(user)
		    };
	        marker["id"] = user.id;

	        return marker;
	    };

	    $scope.getMarker = function(user) {
	    	var arrayLength = $scope.markers.length;
			for (var i = 0; i < arrayLength; i++) {
			    if ( $scope.markers[i]["id"] == user.id) {
			    	return $scope.markers[i];
			    }
			}
			return null;
	    };

	    $scope.updateMarker = function(user) {
	    	var marker = $scope.getMarker(user);
        	if (marker != null) {
        		marker.latitude = user.latitude;
        		marker.longitude = user.longitude;
        		marker.icon = $scope.getIcon(user);
        	}
	    };
        
    };
    
    $scope.$watch('eventAlerts', function(eventAlerts) {
        var mapUser = function(value, key) {
            return user = {
                id: key, 
                type: value.bibNumber < 0 ? 'support' : 'user', 
                state: 'normal', 
                latitude: value.latitude, 
                longitude: value.longitude
            };
        };
        

        var addUpdateUser = function(user) {
        	if(!$scope.getMarker(user)) {
                $scope.markers.push($scope.createMarker(user));
            }
            else {
                $scope.updateMarker(user);
            }
        };
        
        var mapAlerts = function(value, key, userId) {
            return alert = {
                id: key,
                userId: userId,
                alertStatus: $scope.alertStatusTypes[value.alertStatus],
                alertType: value.alertType
            };
        };
        
        var pushAlerts = function(alert) {
            var arrayLength = $scope.alerts.length;
            var elementExists = false;
            var alertIndex = null;
            for (var i = 0; i < arrayLength; i++) {
                if ( $scope.alerts[i]["id"] === alert.id) {
                    elementExists = true;
                    alertIndex = i;
                    break;
                }
            }
            if(!elementExists) {
                $scope.alerts.push(alert);
            } 
            else {
                $scope.alerts.splice(alertIndex, 1, alert);
            }
        };
        
        if(angular.isDefined(eventAlerts) && 
            eventAlerts.users &&
            eventAlerts.support) {
            
            angular.forEach(eventAlerts.users, function(value, key) {
                var userId = key;
                addUpdateUser(mapUser(value, userId));
                angular.forEach(value.Alerts, function(value, key) { 
                    pushAlerts(mapAlerts(value, key, userId));
                    console.dir($scope.alerts);
                });
            });
            
            angular.forEach(eventAlerts.support, function(value, key) {
                addUpdateUser(mapUser(value, key));
            });
            
        }
    });
    
    uiGmapGoogleMapApi.then(function(maps) {
        mapFunctions();
    });
});

