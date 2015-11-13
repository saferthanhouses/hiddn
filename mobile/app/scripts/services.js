angular.module('hiddn.services', [])

.factory('Map', function() {
  
})

.factory('TreasureFactory', function($http, ENV){

  var Factory = {}

  Factory.createTreasure = function(treasure){
    return $http.post(ENV.apiEndpoint + 'api/treasure/', treasure)
      .then(function(response){
        console.log("Treasure successfully hidden at", response.data.coords);
        return response.data;
      }, function(error){
        console.error(error);
      })
  }

  Factory.getAllTreasure = function(){
    return $http.get(ENV.apiEndpoint + 'api/treasure/')
      .then(function(response){
        return response.data;
      }, function(error){
        console.error(error);
      })
  }

  return Factory;

})