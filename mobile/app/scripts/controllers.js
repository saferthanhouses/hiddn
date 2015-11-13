angular.module('hiddn.controllers', [])

.controller('TreasureCtrl', function($scope) {})

.controller('MapCtrl', function($scope, $cordovaGeolocation, TreasureFactory, GeoFactory, $q, $rootScope) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

    var div = document.getElementById("map_canvas");
    var map;

	function asyncMarkerPlacement (map, userPosition){
		var d = $q.defer();
		var userPos = new plugin.google.maps.LatLng(userPosition.lat, userPosition.long);
		map.addCircle({
    		center: userPos,
    		radius: userPosition.accuracy,
    		strokeColor: '#AA00FF',
		  	strokeWidth: 5,
		    fillColor : '#880000'
		}, function(circle){
				d.resolve(circle);
		});

		return d.promise; 
	}

	function asyncTreasureMarkerPlacement (map, treasurePosition){
		var d = $q.defer();
		var treasurePos = new plugin.google.maps.LatLng(treasurePosition.lat, treasurePosition.long);
		map.addMarker({
    		position: treasurePos,
    		icon: 'yellow'
		}, function(marker){
				d.resolve(marker);
		});

		return d.promise; 
	}


    function initializeMap(positionObj){
		// // if we have the position - run the map update
			var startPos = new plugin.google.maps.LatLng(positionObj.lat, positionObj.long);
	    	var map = plugin.google.maps.Map.getMap(div, {
	    		'camera': {
	    			'latLng': startPos,
	    			'zoom': 14
	    		}
	    	});
	    	return map;
	    }


    function startUserPosition(map, userPosition){

    	console.log("inside startUserPosition", map);
    	console.log("inside startUserPosition GF.position", GeoFactory.position, GeoFactory.accuracy)
    	
    	var userPos = new plugin.google.maps.LatLng(userPosition.lat, userPosition.long);

    	asyncMarkerPlacement(map, userPosition).then(function(circle){

    		$rootScope.$on('userLocationChanged', function(){
	    		updateUserPosition(map, circle);
				    			
		    })
    	})
    }

    function getRadius(acc){
    	// get an actual rep here ...
    	return acc;
    }

    // user position animation?

    // treasure position animation?

    function updateUserPosition(map, circle){
    	console.log("updating user position ...", GeoFactory.position, GeoFactory.accuracy);
    	var newCenter = new plugin.google.maps.LatLng(GeoFactory.lat, GeoFactory.long)
    	circle.center = newCenter;
    	circle.radius = getRadius(GeoFactory.accuracy);
    }

    function getTreasure(map){
    	TreasureFactory.getAllTreasure()
    		.then(function(treasures){
    			console.log("MapCtrl:addTreasure:treasures:", treasures);
    			treasures.forEach(function(treasure){
    				t_coords = treasure.coords.split(' ');
    				treasurePosition = {lat: t_coords[0], long: t_coords[1]};
    				asyncTreasureMarkerPlacement(map, treasurePosition);
    			})
    		}, function(error){
    			console.error(error);
    		})
    }

    // 	############  START START START ############################################
    // ######### when the device is ready load the position & the map. ###########
	document.addEventListener("deviceready", function() {

		GeoFactory.getCurrentPosition().then(function(result){
			//console.log("result (posObj) inside MapCtrl deviceready",result);
			map = initializeMap(result);
	  		map.addEventListener(plugin.google.maps.event.MAP_READY, function(map){
	  			getTreasure(map); 
	  			startUserPosition(map, result)
	  		});

			}, function(error){
				console.error("inside MapCtrl", error);
			}
		)
	})


})

	// track path since to see if crossed icon path?

  //   	// // populate the map with icons.
  //   	// 	// treasures that are hidden - yours in a different colour.
  //   	// 	// treasures that you've found
  //   	// // how to restrict the number later on? Within the map view?
  //   	// TreasureFactory.getAllTreasure().then(function(treasures){
  //   	// 	console.log("treasures", treasures);
  //   	// })

  //       // call update user position.
	 //    // if couldn't get gps information, do what?	    
    // }, false);



.controller('HideCtrl', function($scope, $stateParams, TreasureFactory, $cordovaGeolocation, GeoFactory) {

	$scope.treasure = {value: ''}

	$scope.hideTreasure = function(treasure) {
		console.log("$scope.treasure?", $scope.treasure)
		GeoFactory.getCurrentPosition().then(function(result){
				console.log("hiding treasure at position", result.lat, result.long, "with", result.accuracy, "accuracy");
				TreasureFactory.createTreasure({coords: result.lat +' ' + result.long, value: $scope.treasure.value})
					.then(function(){
						$scope.treasure.value = "";
					}, function(){
						console.error("error hiding treasure")
					}
				)
			}, function(error){
				// flash location error
				console.error("couldn't get location.", error.message);
			})
	};
})

.controller('UserCtrl', function($scope) {
});
