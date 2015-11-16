angular.module('hiddn.controllers', [])

.controller('TreasureCtrl', function($scope, TreasureFactory, Session) {
	// console.log("TreasureCtrl run. Treasures:", TreasureFactory.Treasure);
	$scope.$on('$ionicView.enter', function(e) {
		
		TreasureFactory.loadFoundTreasure(Session.user._id)
			.then(function(treasures){
				console.log("TreasureCtrl loading treasures", treasures);
				// if youHiddenTreasures is updated will the scope update too?
				$scope.treasures = TreasureFactory.yourFoundTreasure;
				console.log("TreasureFactory.yourHiddenTreasure after loadFoundTreasure", TreasureFactory.yourFoundTreasure);
			}, function(error){
				console.error(error);
			})
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

	$rootScope.$on('auth-logout-success', function(){

	})

	$rootScope.$on('treasureFound', function(event, treasure){
		console.log("treasureFound event heard", treasure);
		for (var i = 0 ; i< MapFactory.mapMarkers.length; i++){
			if (MapFactory.mapMarkers[i].treasureId == treasure.treasure){
				MapFactory.mapMarkers[i].remove();
			}
		}
	})

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
    	var newCenter = new plugin.google.maps.LatLng(GeoFactory.lat, GeoFactory.long)
    	circle.setCenter(newCenter);
    	circle.setRadius(getRadius(GeoFactory.accuracy));
    }

    function getTreasure(map, treasureMap){
    	// will this be a map or an array of treasure?
    	if (!treasureMap){
    		// this is being called because ... treasure map is undefined .. because?
	    	TreasureFactory.getOpenTreasure()
	    		.then(function(treasures){
	    			$scope.hiddenTreasure = TreasureFactory.hiddenTreasure;
	    			$scope.yourHiddenTreasure = TreasureFactory.yourHiddenTreasure;
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
		MapFactory.mapMarkers.forEach(function(marker){
			marker.remove();
		})
		treasures.forEach(function(treasure){
				t_coords = treasure.coords.split(' ');
				treasurePosition = {lat: t_coords[0], long: t_coords[1]};
				asyncTreasureMarkerPlacement(map, treasurePosition).then(function(marker){
					console.log("Is treasure available in here?", treasure)
					marker.treasureId = treasure._id
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
			    if (index===0) {
   					placeTreasures(null, TreasureFactory.hiddenTreasure)
    			} else if (index===1){
   					placeTreasures(null, TreasureFactory.yourHiddenTreasure)
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
						$scope.loadingTreasure = false;
						$scope.button.message = "Hide Treasure!";
						TreasureFactory.yourHiddenTreasure.push(treasure);
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

.controller('UserCtrl', function(AuthService, $scope, $state, Session) {
	$scope.user = {};
	$scope.$on('$ionicView.enter', function(e) {
		
		$scope.user.email = Session.user.email;
	});
	$scope.logout = function(){
		$scope.user.email = ""
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
			}, function(error){
				console.error("login unsuccessful");
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
				$scope.buttonText.text = "Signing you up ..." 
				$scope.signUpDisabled=true;
				AuthService.signup($scope.user)
					.then(function () {
						$scope.buttonText.text = "Signup";
						$scope.signUpDisabled = false;
			            $state.go('tab.map');
			        }).catch(function () {
			            $scope.error = 'Signup error';
			        });
		    }
		}
})
