angular.module('hiddn.controllers', [])

.controller('TreasureCtrl', function($scope) {})

.controller('MapCtrl', function($scope, $cordovaGeolocation, TreasureFactory) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
    var div = document.getElementById("map_canvas");

	document.addEventListener("deviceready", function() {

		var currentPos

		$cordovaGeolocation.getCurrentPosition({timeout:10000, enableHighAccuray:true})
			.then(function(position){
				// ge'in the position
				var lat = position.coords.latitude, long = position.coords.longitude; 
				console.log("inside get current pos", lat, long);
				var accuray = position.coords.accuray < 100 ? 100 : position.coords.accuracy;
				var currentPos = new plugin.google.maps.LatLng(lat, long);
		        // when the map is ready
		    	// make the map
		    	var map = plugin.google.maps.Map.getMap(div, {
		    		'camera': {
		    			'latLng': currentPos,
		    			'zoom': 14
		    		}
		    	});

		    	// if position is not good, attempt to get more accurate position?

		        map.addEventListener(plugin.google.maps.event.MAP_READY, function(){

		        	// refactor this all into a 
		        	// showUserPosition()
		        	// function that can be called continuously - gets the user position
		        	// and sets the map

			    	// set the center on the user's location
		        	map.setCenter(currentPos);

			    	// add a circle on the user
			    	map.addCircle({
			    		center: currentPos,
			    		radius: accuray,
			    		strokeColor: '#AA00FF',
					  	strokeWidth: 5,
					    fillColor : '#880000'
					});

		        	// marker = new google.maps.Marker( {position: myLatLng, map: map} );
		        	// marker.setMap(map)


		        	// questions: does this watch the position when the page is not up? When the app is in background?
		        	$cordovaGeolocation.watchPosition(onSuccess, onError, {enableHighAccuray: true })

		        	function onSuccess(position){
		        		console.log("watch position update", position);

		        		// move marker ...
		    			// function moveBus( map, marker ) {

						//     marker.setPosition( new google.maps.LatLng( 0, 0 ) );
						//     map.panTo( new google.maps.LatLng( 0, 0 ) );

						// };
		        	};

		        	function onError(error){
		        		console.error("Error in watchPosition", error.code, ":", error.message)
		        	}


		        	// populate the map with icons.
		        		// treasures that are hidden - yours in a different colour.
		        		// treasures that you've found
		        	// how to restrict the number later on? Within the map view?
		        	TreasureFactory.getAllTreasure().then(function(treasures){
		        		console.log("treasures", treasures);
		        	})
				})

			}, function(error){
				// innacuracy flash...
				console.error(error);
	        });
	        // call update user position.
	    // if couldn't get gps information, do what?	    
    }, false);

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
