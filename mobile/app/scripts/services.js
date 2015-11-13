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
  TreasureFactory.loadFoundTreasure = function(){
    $http.get
  }

  return TreasureFactory;

})

// if the user is within a certain distance of the treasure,
// remove the treasure from the 