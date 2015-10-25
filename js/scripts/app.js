var app = angular.module("proShepherdAdmin", [
    'uiGmapgoogle-maps',
    'firebase',
    'proShepherdAdmin.Services',
    'ui.bootstrap'])
.controller('mapCtrl', function($scope, $timeout, uiGmapGoogleMapApi, Alerts) {
    
    $scope.markers = [];
    $scope.eventPathPoints = [];
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
            latitude: 42.898414,
            longitude: -78.8713798
          },
          zoom: 16,
          bounds: {}
        };
        
        $scope.eventPathPoints = [
        	{ latitude:42.8968254, longitude: -78.8683798 },
        	{ latitude:42.8968411, longitude: -78.8707508 },
        	{ latitude:42.8968647, longitude: -78.8748063 },
        	{ latitude:42.899414,  longitude: -78.87391 },
        	{ latitude:42.8993904, longitude: -78.8699296 },
        	{ latitude:42.9003807, longitude: -78.8695756 },
        	{ latitude:42.9003414, longitude: -78.8672367 },
        	{ latitude:42.8968518, longitude: -78.8683417 },
        	{ latitude:42.8968254, longitude: -78.8683798 }
        ];

        $scope.options = {
            scrollwheel: false
        };

	    $scope.getIcon = function(user) {
	    	var path = "assets/images/";

	    	if (user.type == "user") {
	    		if (user.state == "normal") {
	    			//Bicycle by Larisa Skosyrska from the Noun Project
	    			return path + "rider-normal.png";
	    		} 
                else if (user.state == "distressed") {
                	//Warning by Tahsin Tahil from the Noun Project
	    			return path + "rider-distressed.png";
	    		} 
                else {
                	//Life Saver by Kristen Gee from the Noun Project
	    			return path + "rider-triage.png";
	    		}
	    	} else {
	    		if (user.state == "normal") {
	    			return path + "support-normal.png";
	    		}
                else {
                	//medical by Greg Beck from the Noun Project
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
        	var status = "normal";

        	angular.forEach(value.Alerts, function(value2, key2) {
			    var alertStatus = value2.alertStatus;

			    // if any alerts are in Step1, that user is 'distressed'
			    // else step 2 and 3 both map to 'triage'
			    if (alertStatus == "Step1") {
			    	status = "distressed";
			    } else if (status != "distressed" && (alertStatus == "Step2" || alertStatus == "Step3")) {
			    	status = "triage";
			    }
        	});
        	
            return user = {
                id: key, 
                type: 'user',
                state: status, 
                latitude: value.latitude, 
                longitude: value.longitude
            };
        };

        var mapSupport = function(value, key) {
        	var status = "normal";

		    // if any alerts are in Step1, that user is 'distressed'
		    // else step 2 and 3 both map to 'triage'
		    if (value.status != "Step4") {
		    	status = "triage";
		    } else {
		    	status = "normal";
		    }
        	
            return user = {
                id: key, 
                type: 'support',
                state: status, 
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
                addUpdateUser(mapSupport(value, key));
            });
            
        }
    });
    
    uiGmapGoogleMapApi.then(function(maps) {
        mapFunctions();
    });
});

