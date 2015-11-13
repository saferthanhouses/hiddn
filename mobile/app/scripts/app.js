// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('hiddn', ['ionic', 'hiddn.controllers', 'hiddn.services', 'config', 'ngCordova'])

.run(function($ionicPlatform, $cordovaGeolocation) {


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    // $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuray: false})
    //   .then(function(position){
    //     console.log("position", position);
    //     // TreasureFactory.createTreasure({coords: '0000 0000', value: treasure});
    //   })
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.hide', {
    url: '/hide',
    views: {
      'tab-hide': {
        templateUrl: 'templates/tab-hide.html',
        controller: 'HideCtrl'
      }
    }
  })

  .state('tab.map', {
    url: '/map',
    views: {
      'tab-map': {
        templateUrl: 'templates/tab-map.html',
        controller: 'MapCtrl'
      }
    }
  })

  .state('tab.treasure', {
    url: '/treasure',
    views: {
      'tab-treasure': {
        templateUrl: 'templates/tab-treasure.html',
        controller: 'TreasureCtrl'
      }
    }
  })

  .state('tab.user', {
    url: '/user',
    views: {
      'tab-user': {
        templateUrl: 'templates/tab-user.html',
        controller: 'UserCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/map');

});
