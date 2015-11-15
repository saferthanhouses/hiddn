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
		console.log("map in asyncTreasureMarkerPlacement", map)
		var d = $q.defer();
		var treasurePos = new plugin.google.maps.LatLng(treasurePosition.lat, treasurePosition.long);
		map.addMarker({
    		position: treasurePos,
    		icon: 'yellow'
		}, function(marker){
				console.log("MapFactory.mapMarkers?", MapFactory.mapMarkers)
				// MapFactory.mapMarkers.push(marker);
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
		    	MapFactory.googleMap = map;
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

    // $scope.mapMarkers = []

    function updateUserPosition(map, circle){
    	console.log("updating user position ...", GeoFactory.position, GeoFactory.accuracy);
    	var newCenter = new plugin.google.maps.LatLng(GeoFactory.lat, GeoFactory.long)
    	circle.setCenter(newCenter);
    	circle.setRadius(getRadius(GeoFactory.accuracy));
    	console.log("MapCtrl:updateUserPosition:circle.radius", circle.radius);
    }

    function getTreasure(map, treasureMap){
    	// will this be a map or an array of treasure?
    	console.log("Treasure map in getTreasure", treasureMap);
    	if (!treasureMap){
    		// this is being called because ... treasure map is undefined .. because?
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
    		TreasureFactory.loadMapTreasure(treasureMap._id).then(function(treasure){
	    		placeTreasures(null, treasure);
    		}, function(error){
    			console.error(error);
    		})
    		// other maps
    	}
    }

    function placeTreasures(map, treasures){
    	if (!map) {
    		map = MapFactory.googleMap;
    	}
    	console.log("Mapmarkers in placeTreasures", MapFactory.mapMarkers);
		console.log("removing map markers");
		MapFactory.mapMarkers.forEach(function(marker){
			marker.remove();
		})
		console.log("mapMarkers after placement", MapFactory.mapMarkers);
    	console.log("treasures", treasures)
		treasures.forEach(function(treasure){
				console.log("treasure in placeTreasures", treasure)
				t_coords = treasure.coords.split(' ');
				treasurePosition = {lat: t_coords[0], long: t_coords[1]};
				console.log("map above asyncTreasureMarkerPlacement", map)
				asyncTreasureMarkerPlacement(map, treasurePosition).then(function(marker){
					MapFactory.mapMarkers.push(marker);
				});
		})
    }

	 $scope.showMaps = function() {

	 	function chooseMap(index){

	 		var map = MapFactory.allMaps[options.buttons[index].text]
	 		getTreasure(null, map);
	 	}

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
 				console.log("buttons", options.buttons)
 				console.log("showMaps button:", index)
			    if (index===0) {
   					placeTreasures(null, TreasureFactory.hiddenTreasure)
    			} else if (index===1){
    				console.log("your treasure", TreasureFactory.yourTreasure);
   					placeTreasures(null, TreasureFactory.yourTreasure)
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

	 			// no user made maps so empty
	 			console.log("allMaps", MapFactory.allMaps)

	 			for (var map in MapFactory.publishedMaps){
	 				options.buttons.push({text: "<i>Your Map</i> " + map})
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
	$scope.button = {message: "Hide Treasure!"};
	$scope.loadingTreasure = false;

	$scope.hideTreasure = function(treasure) {
		console.log("$scope.treasure?", $scope.treasure)
		$scope.loadingTreasure = true;
		$scope.button.message = "Hiding Your Treasure ..."
		GeoFactory.getCurrentPosition().then(function(result){
				
				// check position accuracy ...

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

.controller('UserCtrl', function(AuthService, $scope, $state) {

	$scope.logout = function(){
		AuthService.logout();
		$state.go('auth.login');
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

.controller('SignupCtrl', function($scope, AuthService, $state){
		$scope.buttonText = {text: "Signup"};
		$scope.user = {};
		$scope.signup = function (signupInfo){
			if ($scope.user.password !== $scope.user.password2){
				// flash here
				console.log("passwords do not match")
				return;
			} else {
				console.log("user", $scope.user);
				$scope.buttonText.text = "Signing you up ..." 
				$scope.signUpDisabled=true;
				AuthService.signup($scope.user)
					.then(function () {
			            $state.go('tab.map');
			        }).catch(function () {
			            $scope.error = 'Signup error';
			        });
		    }
		}
})
