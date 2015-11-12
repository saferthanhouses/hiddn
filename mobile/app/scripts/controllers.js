angular.module('hiddn.controllers', [])

.controller('HideCtrl', function($scope) {})

.controller('MapCtrl', function($scope) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})

.controller('HideCtrl', function($scope, $stateParams, TreasureFactory, $cordovaGeolocation) {

	$scope.treasure = {value: ''}

	$scope.hideTreasure = function(treasure) {
		console.log("$scope.treasure?", $scope.treasure)
		$cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuray: true})
			.then(function(position){
				var lat = position.coords.latitude, long = position.coords.longitude; 
				console.log("hiding treasure at position", lat, long, "with", position.coords.accuracy, "accuracy");
				TreasureFactory.createTreasure({coords: lat +' ' + long, value: $scope.treasure.value})
					.then(function(){
						$scope.treasure.value = "";
					});
			}, function(error){
				// flash location error
				console.error("couldn't get location.", error.message);
			})
	};
})

.controller('UserCtrl', function($scope) {
});
