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
    $scope.showResolved = 0;
    $scope.addUpdateUser = null;
    $scope.mapSupport = null;
    
    $scope.init = function() {
        Alerts('Test-Event').$bindTo($scope, 'eventAlerts')
        .then(function(result) {
            //console.dir($scope.eventAlerts);
        });
    };
    
    $scope.alertStatusTypes = {
        "Step1": "Distressed",
        "Step2": "En-route",
        "Step3": "On site",
        "Step4": "Resolved"
    };
    
    var mapFunctions = function() {
        
        $scope.init();

    	$scope.map = {
          center: {
            latitude: 42.953052,
            longitude: -78.873867
          },
          zoom: 15,
          bounds: {}
        };
        
        $scope.eventPathPoints = [
        	{ latitude:42.953397, longitude: -78.878287 },
        	{ latitude:42.956727, longitude: -78.878416 },
        	{ latitude:42.956790, longitude: -78.869490 },
        	{ latitude:42.947838,  longitude: -78.868546 },
        	{ latitude:42.947775, longitude: -78.878244 },
        	{ latitude:42.953397, longitude: -78.878287 }
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
                type: user.type,
			    icon: $scope.getIcon(user),
		    };
	        marker["id"] = user.id;

	        if (user.state == "distressed"){
    			marker.options = { animation: google.maps.Animation.BOUNCE };
    		}
    		else {
    			marker.options = { animation: null };
    		}

	        return marker;
	    };

	    $scope.getMarker = function(user) {
	    	var arrayLength = $scope.markers.length;
			for (var i = 0; i < arrayLength; i++) {
			    if ($scope.markers[i]["id"] == user.id) {
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
        		if (user.state == "distressed"){
        			marker.options = { animation: google.maps.Animation.BOUNCE };
        		}
        		else {
        			marker.options = { animation: null };
        		}
        	}
	    };

	    $scope.addUpdateUser = function(user) {
        	if(!$scope.getMarker(user)) {
                $scope.markers.push($scope.createMarker(user));
            }
            else {
                $scope.updateMarker(user);
            }
        };

        $scope.mapSupport = function(value, key) {
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
        
    };
    
    $scope.$watch('eventAlerts', function(eventAlerts) {
        var mapUser = function(value, key, supports) {
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

        	// Dirty code to reset support person status and reset our link to the support truck
        	if (value.supportid != '' && status == "normal") {
        		angular.forEach(supports, function(value2, key2) {
	                if (value.supportId == key2) {
	                	value2.status = "Step4";
	                	value.supportId = '';
	                }
	            });
        	}
        	
            return user = {
                id: key, 
                type: 'user',
                state: status, 
                latitude: value.latitude, 
                longitude: value.longitude
            };
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
                $scope.addUpdateUser(mapUser(value, userId, eventAlerts.support));
                angular.forEach(value.Alerts, function(value, key) { 
                    pushAlerts(mapAlerts(value, key, userId));
                });
            });
            
            angular.forEach(eventAlerts.support, function(value, key) {
                $scope.addUpdateUser($scope.mapSupport(value, key));
            });
            
        }
    });
    
    $scope.assignSupport = function(alert) {
        var arrayLength = $scope.markers.length;
        for (var i = 0; i < arrayLength; i++) {
            var theMarker = $scope.markers[i];
            if (theMarker.id === alert.userId) {
                theMarker.state = "triage";
                $scope.eventAlerts.users[theMarker.id].supportId = "uid-support-1";
                $scope.eventAlerts.support["uid-support-1"].status = "Step2";
                $scope.addUpdateUser($scope.mapSupport($scope.eventAlerts.support["uid-support-1"], "uid-support-1"));
            }
        }
    };
    
    uiGmapGoogleMapApi.then(function(maps) {
        mapFunctions();
    });
});

