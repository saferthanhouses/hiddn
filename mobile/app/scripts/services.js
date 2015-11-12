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
        return error;
      })
  }

  return Factory;

})