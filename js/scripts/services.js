angular.module('proShepherdAdmin.Services', [])
.factory('Alerts', ['$firebaseObject', function($firebaseObject) {
   
    return function(strEventName) {
       var userAlertRef = new Firebase('https://proshepard.firebaseio.com/Events/' + strEventName);
       return $firebaseObject(userAlertRef);
    }
    
}]);