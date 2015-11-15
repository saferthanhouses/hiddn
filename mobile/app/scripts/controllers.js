angular.module('hiddn.controllers', [])

.controller('TreasureCtrl', function($scope, TreasureFactory, Session) {
	TreasureFactory.loadFoundTreasure(Session.user._id)
		.then(function(treasures){
			console.log("successful load")
			$scope.treasures = treasures;
		}, function(error){
			console.error(error);
		})
})

.controller('MapCtrl', function($scope, $cordovaGeolocation, TreasureFactory, GeoFactory, $q, $rootScope, Session, $ionicActionSheet, $timeout, MapFactory) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

    var div = document.getElementById("map_canvas");
    var map;

	$rootScope.$on('auth-login-success', runMap)

    function runMap() {
			console.log("auth-login-success heard");
			initializeMap().then(function(map){
		  		map.addEventListener(plugin.google.maps.event.MAP_READY, function(map){
		  			startUserPosition(map)
		  			getTreasure(map); 
		  		})
	 		}, function(error){
	 			console.error(error);
	 		});
	 }


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


    function initializeMap(){
		// // if we have the position - run the map update
			return GeoFactory.getCurrentPosition().then(function(result){
				var startPos = new plugin.google.maps.LatLng(result.lat, result.long);
		    	var map = plugin.google.maps.Map.getMap(div, {
		    		'camera': {
		    			'latLng': startPos,
		    			'zoom': 14
		    		}
		    	});
		    	return map;
			}, function(error){
				console.error(error);
			})
	}


    function startUserPosition(map){    	
    	var userPos = new plugin.google.maps.LatLng(GeoFactory.lat, GeoFactory.long);

    	asyncMarkerPlacement(map, {lat:GeoFactory.lat, long:GeoFactory.long}).then(function(circle){
    		$rootScope.$on('userLocationChanged', function(){
    			console.log("inside user location change - circle", circle);
	    		updateUserPosition(map, circle);
	    		// check the user hasn't passed over any treasures.
	    		// checkTreasures();
		    })
    	})
    }

    function getRadius(acc){
    	// get an actual rep here ...
    	// accuracy is in meters ...
    	return acc;
    }

    // user position animation?

    // treasure position animation?

    // game pause with variable gps? 

    // reorganise mapLoad to go off of individual maps. If !mapName, org 

    // organise by map on the found list...

    function updateUserPosition(map, circle){
    	console.log("updating user position ...", GeoFactory.position, GeoFactory.accuracy);
    	var newCenter = new plugin.google.maps.LatLng(GeoFactory.lat, GeoFactory.long)
    	circle.setCenter(newCenter);
    	circle.setRadius(getRadius(GeoFactory.accuracy));
    	console.log("MapCtrl:updateUserPosition:circle.radius", circle.radius);
    }

    function getTreasure(map, treasureMap){
    	if (!treasureMap){
	    	TreasureFactory.getOpenTreasure()
	    		.then(function(treasures){
	    			console.log("MapCtrl:addTreasure:treasures:", treasures);
	    			console.log("MapCtrl:TreasureFactory.hiddenTreasure", TreasureFactory.hiddenTreasure);
	    			$scope.hiddenTreasure = TreasureFactory.hiddenTreasure;
	    			$scope.yourTreasure = TreasureFactory.yourTreasure;
	    			placeTreasures(map, TreasureFactory.hiddenTreasure);
	    		}, function(error){
	    			console.error(error);
	    		})
    	} else {
    		// other maps

    	}
    }


    function placeTreasures(map, treasures){
    	console.log("treasures", treasures)
		treasures.forEach(function(treasure){
				console.log("treasure in placeTreasures", treasure)
				t_coords = treasure.coords.split(' ');
				treasurePosition = {lat: t_coords[0], long: t_coords[1]};
				asyncTreasureMarkerPlacement(map, treasurePosition);
		})
    }

    // MapsFactory.getMaps() // returns an array of maps.

    // add footer button to maps page
    // with actionsheet
    // action sheet should be able to switch between the two basic maps.

	 $scope.showMaps = function() {


	 	options = {
		buttons: [
   			{ text: 'Open Map' },
   			{ text: 'Your Hidden Treasures' }
	 		],
 			titleText: 'Choose A Map',
			cancelText: 'Cancel',
 			cancel:  
 			function() {
      			console.log("cancel pressed");
    		},
 			buttonClicked: function(index) {
 				console.log("showMaps button:", index)
			    if (index===0) {
   					renderMap(TreasureFactory.hiddenTreasure)
    			} else if (index===1){
   					renderMap(TreasureFactory.yourTreasure)
   				} else {
   					chooseMap(index)
   				}
 			}
	 	}

	 	MapFactory.getDonatedMaps(Session.user._id)
	 		.then(function() {
	 			MapFactory.getPublishedMaps(Session.user._id)
	 		})
	 		.then(function(){

	 			console.log("allMaps", MapFactory.allMaps)

	 			for (var map in MapFactory.publishedMaps){
	 				options.buttons.push({text: "<i>Your Map</i>" + map})
	 			}

			 	for (var map in MapFactory.donatedMaps) {
			 		options.buttons.push({text: map})
			 	}

			 	// action sheet should be populated with the 
			   var hideSheet = $ionicActionSheet.show(options);

			   // For example's sake, hide the sheet after two seconds
			   $timeout(function() {
			     hideSheet();
			   }, 2000);
			})
	}


})



.controller('HideCtrl', function($scope, $stateParams, TreasureFactory, $cordovaGeolocation, GeoFactory, Session) {

	$scope.treasure = {value: ''}

	$scope.hideTreasure = function(treasure) {
		console.log("$scope.treasure?", $scope.treasure)
		GeoFactory.getCurrentPosition().then(function(result){
				
				treasure = {
					coords: result.lat +' ' + result.long, 
					value: $scope.treasure.value,
					hider: Session.user._id
				};

				TreasureFactory.createTreasure(treasure)
					.then(function(treasure){
						$scope.treasure.value = "";
						console.log("HideCtrl:hideTreasure:TF.cT:returned treasure", treasure)
						TreasureFactory.hiddenTreasure.push(treasure);
					}, function(){
						// flash?
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

	$scope.logout = function(){
		AuthService.logout();
	}

})

.controller('AuthCtrl', function($scope){

})

.controller('LoginCtrl', function($scope, $state, AuthService){
		$scope.user = {};
		$scope.login = function(){
			var creds = {email: $scope.user.email, password: $scope.user.password};
			AuthService.login(creds).then(function(){
				$state.go('tab.map');
				// flash successful login.
			})
		}
})

.controller('SignupCtrl', function($scope, AuthService){
		console.log("inside signup");
		$scope.user = {};
		$scope.login = function(){
			var creds = {email: $scope.user.email, password: $scope.user.password};
			AuthService.login(creds).then(function(){
				$state.go('map');
			})
		}
})
