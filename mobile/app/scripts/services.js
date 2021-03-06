angular.module('hiddn.services', [])

.factory('UserFactory', function(Session, $http, ENV){
    var UserFactory = {};
    UserFactory.updateUserFound = function(userId, update){
        return $http.put(ENV.apiEndpoint + 'api/users/' + userId + '/found', update)
            .then(function(response){
                console.log("User update successful", response.data);
                return response.data
            }, function(error){
                return error;
            })
    }

    return UserFactory;
})
  .factory('GeoFactory', function($cordovaGeolocation, $rootScope, TreasureFactory, Session, UserFactory) {

      var GeoFactory = {};

      function setGeoFactory(position){
        GeoFactory.lat = position.coords.latitude;
        GeoFactory.long = position.coords.longitude;
        GeoFactory.position = [GeoFactory.lat, GeoFactory.long];
        GeoFactory.accuracy = position.coords.accuracy;
      }

      GeoFactory.getCurrentPosition = function(){
        return $cordovaGeolocation.getCurrentPosition({timeout:10000, enableHighAccuray:true})
          .then(function(position){
            var result = {};
            result.lat = position.coords.latitude;
            result.long = position.coords.longitude; 
            result.accuracy = position.coords.accuracy;
            setGeoFactory(position);
            return result;
          }, function(error){
            // flash! Could not get position, trying to reconnect ..
            console.error("Error getting position")
            return error;
          })
      }

      GeoFactory.watchCurrentPosition = function(){

         var watch = $cordovaGeolocation.watchPosition({enableHighAccuray: true });
           watch.then(
            null,
            function(err) {
              console.error(err);
            },
            function(position) {
              setGeoFactory(position);
              console.log("after setGeoPosition, GeoFactory.position", GeoFactory.position, GeoFactory.accuracy);
              console.log("position accuracy ... ", position.coords.accuracy);
              if (GeoFactory.accuracy < 50){
                GeoFactory.checkTreasure();
              } else {
                console.log("waiting for a better position read ... ");
              }
              $rootScope.$emit('userLocationChanged');
          });
          return watch;
      }

      GeoFactory.checkTreasure = function() {
        console.log("Treausure that's hidden from us", TreasureFactory.hiddenTreasure);
        for (var i = 0; i < TreasureFactory.hiddenTreasure.length; i++){
            // log the user's distance from treasure:
            var treasure = TreasureFactory.hiddenTreasure[i]
            var t_coords = treasure.coords.split(' ');
            var t_lat = t_coords[0], t_long = t_coords[1];
            var d = getDistanceFromLatLonInKm(GeoFactory.lat, GeoFactory.long, t_lat, t_long);   
            console.log("distance from user to", treasure.value + ":", d + "km");
            // if the user is close enough;
            if (d<TreasureFactory.findDistance){
                console.log("User found treasure!");
                // add to frontend data.
                TreasureFactory.hiddenTreasure.splice(i, 1);
                TreasureFactory.yourHiddenTreasure.push(treasure);
                // will this show?

                // update on backend...
                    // add to treasure instance
                TreasureFactory.updateTreasureStatus(treasure._id, {finder: Session.user._id})
                    // add to user's found property
                console.log("treasure._id", treasure._id)
                UserFactory.updateUserFound(Session.user._id, {found: treasure._id})
                // remove from / re-render map?
                $rootScope.$emit('treasureFound', {treasure: treasure._id});
            }
        }
      }

      function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
                var R = 6371; // Radius of the earth in km
                var dLat = deg2rad(lat2-lat1);  // deg2rad below
                var dLon = deg2rad(lon2-lon1); 
                var a = 
                  Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2)
                  ; 
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                var d = R * c; // Distance in km
                return d;
        }
  
       function deg2rad(deg) {
            return deg * (Math.PI/180)
       }

      return GeoFactory;
  })



.factory('MapFactory', function($cordovaGeolocation, $http, ENV, Session, $rootScope) {

    $rootScope.$on('auth-logout-success', function(){
        // on logout, reset values.
        MapFactory.publishedMaps = {}
        MapFactory.donatedMaps = {}
        MapFactory.allMaps = {}
        MapFactory.mapMarkers.forEach(function(marker){
            marker.remove();
        });
        MapFactory.mapMarkers = [];
    })

    var MapFactory = {};
    MapFactory.publishedMaps = {}
    MapFactory.donatedMaps = {}
    MapFactory.allMaps = {}
    MapFactory.mapMarkers = [];

    MapFactory.getDonatedMaps = function(userId) {
        return $http.get(ENV.apiEndpoint + 'api/users/' + userId + '/donatedMaps')
            .then(function(response){
                response.data.forEach(function(m){
                    MapFactory.donatedMaps[m.title] = m; // conflicting map names?
                    MapFactory.allMaps[m.title] = m;
                })
                return response.data;
            })
    }

    MapFactory.getPublishedMaps = function(userId) {
        $http.get(ENV.apiEndpoint + 'api/users/' + userId + '/publishedMaps')
            .then(function(response){
                response.data.forEach(function(m){
                     MapFactory.publishedMaps[m.title] = m;
                     MapFactory.allMaps[m.title] = m;
                })
                return response.data;
            })
    }

    return MapFactory;
})

.factory('TreasureFactory', function($http, ENV, Session, $rootScope){

    // need to get:
    // treasure on the open map that the user has not placed.
    // user's placed treasures
    // maps user is tagged in.
    // maps user has made

    // 1. !!!
    // need an array of all the nearby hidden treasure.

    $rootScope.$on('auth-logout-success', function(){
        // treasure 
        TreasureFactory.hiddenTreasure = [];
        TreasureFactory.yourHiddenTreasure = [];
    })

  var TreasureFactory = {}
  TreasureFactory.findDistance = 5.0;
  // treasure we didn't hide and hasn't been found - open treasure
  TreasureFactory.hiddenTreasure = [];
  // Treasure we hid
  TreasureFactory.yourHiddenTreasure = [];
  // Treasure we've found
  TreasureFactory.yourFoundTreasure = [];

  TreasureFactory.createTreasure = function(treasure){
    return $http.post(ENV.apiEndpoint + 'api/treasure/', treasure)
      .then(function(response){
        console.log("Treasure successfully hidden at", response.data.coords);
        if (!response.data){
          // do something
          console.error("no data returned");
        }
        return response.data;
      }, function(error){
        console.error(error);
      })
  }

  TreasureFactory.getOpenTreasure = function(){
    // change factory so it gets all treasure then filters?
    return $http.get(ENV.apiEndpoint + 'api/treasure')
      .then(function(response){
        var treasure = response.data
        // all treasure hidden from the user. Not taking maps into account...
        TreasureFactory.hiddenTreasure = treasure.filter(function(t){
            // if the treasure was not hidden by the user and the treasure is 
            // not yet found.
          return ((t.hider !== Session.user._id) && (!t.finder));
        })
        // all treasure placed by the user. This does not take maps into account.
        TreasureFactory.yourHiddenTreasure = treasure.filter(function(t){
          return t.hider === Session.user._id;
        })
        return response.data;
      }, function(error){
        console.error(error);
        return error
      })
  }


  TreasureFactory.loadFoundTreasure = function(userId){
    return $http.get(ENV.apiEndpoint + 'api/users/' + userId + '/found')
      .then(function(response){
        TreasureFactory.yourFoundTreasure = response.data;
        return response.data;
      }, function(error){
        console.error(error);
        return error
      })
  }

  TreasureFactory.loadMapTreasure = function(mapId){
    return $http.get(ENV.apiEndpoint + 'api/maps/' + mapId + '/treasure')
      .then(function(response){
        // TreasureFactory.found = response.data;
        return response.data.treasure;
      }, function(error){
        console.error(error);
        return error
      })
  }

  // how to remove markers from the treasure map when found? 
  // add a reference on the marker to the treasure or on the treasure to the marker

  TreasureFactory.updateTreasureStatus = function(treasureId, update){
    // PUT/api/treasure/:id
    return $http.put(ENV.apiEndpoint + 'api/treasure/' + treasureId, update)
        .then(function(response){ 
            return response.data;
        }, function(error){
            console.error(error);
        })
  }

  return TreasureFactory;

})

.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success-',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function (response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response)
            }
        };
})

.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };

})

.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q, ENV) {

        function onSuccessfulLogin(response) {
            console.log("onSuccessfulLogin response", response);
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.getLoggedInUser = function (fromServer) {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.

            // Optionally, if true is given as the fromServer parameter,
            // then this cached value will not be used.

            if (this.isAuthenticated() && fromServer !== true) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get(ENV.apiEndpoint + 'session').then(onSuccessfulLogin).catch(function () {
                return null;
            });

        };

        this.login = function (credentials) {
            return $http.post(ENV.apiEndpoint + 'login', credentials)
                .then(onSuccessfulLogin)
                .catch(function () {
                    return $q.reject({ message: 'Invalid login credentials.' });
                });
        };

        this.signup = function (credentials) {
            //sends a post request containing the user's credentials to 
            return $http.post(ENV.apiEndpoint + 'api/users/signup', credentials)
                //once the user has been created on the backend...
                .then(function(response) {
                    //a second post request is created to log the user in
                    return $http.post(ENV.apiEndpoint + 'login', credentials);
                })
                .then(onSuccessfulLogin)
                .catch(function () {
                    return $q.reject({ message: 'Invalid signup credentials.' });
                });
        };

        this.logout = function () {
            return $http.get(ENV.apiEndpoint + 'logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };

})




