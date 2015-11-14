// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('hiddn', ['ionic', 'hiddn.controllers', 'hiddn.services', 'config', 'ngCordova'])

.run(function($ionicPlatform, $cordovaGeolocation, AuthService, $rootScope, $state) {

    console.log("inside run");

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        console.log("toState", toState);

        if (AuthService.isAuthenticated()) {
          // The user is authenticated.
          // Short circuit with return.
          console.log("user is authenticated");
          return;
        }

        // // Cancel navigating to new state.
        // event.preventDefault();


      AuthService.getLoggedInUser().then(function (user) {
          console.log("AuthService:getLoggedInUser:user", user);
          // If a user is retrieved, then renavigate to the destination
            // or redirect to signup - this is not the most modular / elegant solution
          // (the second time, AuthService.isAuthenticated() will work)
          // otherwise, if no user is logged in, go to "login" state.
          if (user || toState.name=="auth.signup") {
            console.log("there is a user...");
              $state.go(toState.name, toParams);
          } else {
              $state.go('auth.login');
          }
      });
    })

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    console.log("inside ready");

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive

   .state('auth', {
    url: '/auth',
    templateUrl: 'templates/auth.html',
    abstract: true
  })

   .state('auth.signup', {
    url: '/signup',
    views: {
      'auth-signup': {
        templateUrl: 'templates/auth-signup.html',
        controller: 'SignupCtrl'
      }
    }
  }) 
  .state('auth.login', {
    url: '/login',
    views: {
      'auth-login': {
        templateUrl: 'templates/auth-login.html',
        controller: 'LoginCtrl'
      }
    }
  })

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
      },
    },
    data: {
        authenticate: true
      }   
    // },
    // resolve: {
    //   positionObj: function(GeoFactory){
    //     return GeoFactory.getCurrentPosition();
    //   }
    // }
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
  })

 

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/map');

});
