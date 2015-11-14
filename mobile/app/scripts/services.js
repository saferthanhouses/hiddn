angular.module('hiddn.services', [])

  .factory('GeoFactory', function($cordovaGeolocation, $rootScope) {

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
            console.log("position in GeoFactory.getCurrentPosition", position);
            var result = {};
            result.lat = position.coords.latitude;
            result.long = position.coords.longitude; 
            result.accuracy = position.coords.accuracy;
            setGeoFactory(position);
            console.log("result in GeoFactory.getCurrentPosition", result);            
            return result;
          }, function(error){
            // flash! Could not get position, trying to reconnect ..
            console.error("Error getting position")
            return error;
          })
      }

      GeoFactory.watchCurrentPosition = function(){

        // function succesFunc(position) {
        //   setGeoFactory(position);
        //   cb();
        // }

        // function errorFunc(error){
        //   console.error(error);
        // }

        return $cordovaGeolocation.watchPosition({enableHighAccuray: true })
      }


      document.addEventListener('deviceready', function(){
         var watch = $cordovaGeolocation.watchPosition({enableHighAccuray: true });
         watch.then(
          null,
          function(err) {
            console.error(err);
          },
          function(position) {
            setGeoFactory(position);
            $rootScope.$emit('userLocationChanged');
            // console.log("position inside GeoF:deviceready:watchPosition", position)
        });
      })


      return GeoFactory;
  })


.factory('Map', function($cordovaGeolocation) {
   
})

.factory('TreasureFactory', function($http, ENV){

  var TreasureFactory = {}

  TreasureFactory.found = []

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

  TreasureFactory.getAllTreasure = function(){

    // return $http.get('http://blog.teamtreehouse.com/api/')

    return $http.get(ENV.apiEndpoint + 'api/treasure/')
      .then(function(response){
        console.log("TF:getAllTreasure:response", response);
        return response.data;
      }, function(error){
        console.error(error);
        return error
      })
  }

  //
  TreasureFactory.loadFoundTreasure = function(userId){
    return $http.get(ENV.apiEndpoint + 'api/users/' + userId + '/found')
      .then(function(response){
        console.log("TF:loadFoundTreasure:response", response);
        return response.data;
      }, function(error){
        console.error(error);
        return error
      })
  }

  return TreasureFactory;

})

.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
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
            return $http.get(ENV.apiEndpoint + '/session').then(onSuccessfulLogin).catch(function () {
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

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };

})




