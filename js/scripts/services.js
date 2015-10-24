angular.module('proShepherdAdmin.Services', [])
.factory("Alert", ["$firebaseArray",
function($firebaseArray) {

    return function(strEventName, userID) {
           var userAlertRef = new Firebase('https://proshepard.firebaseio.com/' + strEventName + '/' + userID + '/Alerts');
           return $firebaseArray(userAlertRef);
    }
}
]);