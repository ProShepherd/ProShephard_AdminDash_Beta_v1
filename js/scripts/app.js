var app = angular.module("proShepherdAdmin", ['uiGmapgoogle-maps'])
.controller('mapCtrl', function($scope, $timeout) {
	$timeout(function(){$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };}, 5000);
});

