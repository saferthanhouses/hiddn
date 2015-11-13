angular.module('hiddn.controllers', [])

.controller('TreasureCtrl', function($scope) {})

.controller('MapCtrl', function($scope) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

	document.addEventListener("deviceready", function() {
	      var div = document.getElementById("map_canvas");

	      // Initialize the map view
	      map = plugin.google.maps.Map.getMap(div);

	      // Wait until the map is ready status.
	      // map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
    }, false);

	// function onMapReady() {
 //      var button = document.getElementById("button");
 //      button.addEventListener("click", onBtnClicked, false);
 //    }

 //    function onBtnClicked() {
 //      map.showDialog();
 //    }

	// var div = document.getElementById('map_canvas')
	// console.log("div", div);
	// map = plugin.google.maps.Map.getMap(div);
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
