angular.module('hiddn.services', [])

  .factory('GeoFactory', function($cordovaGeolocation) {

      document.addEventListener('deviceready', function(){
         $cordovaGeolocation.watchPosition(function(position) { console.log("watchPosition", position)}, 
          function(error){ console.error(error)}, 
          {enableHighAccuray: true }
          )
      })

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
            result.accuray = position.coords.accuracy;
            setGeoFactory(position);
            console.log("result in GeoFactory.getCurrentPosition", result);            
            return result;
          }, function(error){
            // flash! Could not get position, trying to reconnect ..
            console.error("Error getting position")
            return error;
          })
      }

      GeoFactory.watchCurrentPosition = function(cb){

        function succesFunc(position) {
          setGeoFactory(position);
          cb();
        }

        function errorFunc(error){
          console.error(error);
        }

        return $cordovaGeolocation.watchPosition(successFunc, errorFunc, {enableHighAccuray: true })
      }

      return GeoFactory;
  })































.factory('Map', function($cordovaGeolocation) {
   
})

.factory('TreasureFactory', function($http, ENV){

  var TreasureFactory = {}

  TreasureFactory.createTreasure = function(treasure){
    return $http.post(ENV.apiEndpoint + 'api/treasure/', treasure)
      .then(function(response){
        console.log("Treasure successfully hidden at", response.data.coords);
        return response.data;
      }, function(error){
        console.error(error);
      })
  }

  TreasureFactory.getAllTreasure = function(){
    return $http.get(ENV.apiEndpoint + 'api/treasure/')
      .then(function(response){
        return response.data;
      }, function(error){
        console.error(error);
      })
  }

  //
  TreasureFactory.loadTreasure = function(){

  }

  return TreasureFactory;

})