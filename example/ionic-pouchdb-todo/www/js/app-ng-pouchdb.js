angular.module('todo', ['ionic', 'satellizer', 'ngStorage'])
  // Simple PouchDB factory
  .factory('todoDb', function() {
    var db = new PouchDB('todos');
    return db;
  })
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })
  .config(function($httpProvider) {
      //Enable cross domain calls
      $httpProvider.defaults.useXDomain = true;

      //Remove the header used to identify ajax call  that would prevent CORS from working
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })
      .state('app.home', {
        url: '/',
        views: {
          'menuContent': {
            templateUrl: 'templates/home.html',
            controller: 'TodoCtrl'
          }
        },
        resolve: { authenticate: authenticate }
      })
      .state('app.auth', {
        url: '/',
        views: {
          'menuContent': {
            templateUrl: 'templates/auth.html',
            controller: 'TodoCtrl'
          }
        }
      });

    $urlRouterProvider.otherwise('/');

    function authenticate($q, $auth, $state, $timeout) {
      if ($auth.isAuthenticated()) {
        // Resolve the promise successfully
        return $q.when();
      } else {
        // The next bit of code is asynchronously tricky.

        $timeout(function() {
          // This code runs after the authentication promise has been rejected.
          // Go to the log-in page
          $state.go('app.auth');
        });

        // Reject the authentication promise to prevent the state from loading
        return $q.reject();
      }
    }
})
  .config(['$localStorageProvider',
    function ($localStorageProvider) {
     var mySerializer = function (value) {
        // Do what you want with the value.
        return value;
      };

      var myDeserializer = function (value) {
        return value;
      };

      $localStorageProvider.setSerializer(mySerializer);
      $localStorageProvider.setDeserializer(myDeserializer);
      $localStorageProvider.setKeyPrefix('');
//$localStorageProvider.set('satellizer_token','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NWJhNGU4MmIwYWY1NmZlNTM3MTk3YWIiLCJleHAiOjE0NDQ0OTkzNzl9.dI4l3PAFHVr3vHJpF1cfSDfYddIPcAROWbAjaLjz164');
    }])
  .config(function($authProvider) {
    // OAuth popup should expand to full screen with no location bar/toolbar.
//    console.log($authProvider);
    var commonConfig = {
      popupOptions: {
        location: 'no',
        toolbar: 'no',
        width: window.screen.width,
        height: window.screen.height
      }
    };

    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      $authProvider.baseUrl = 'http://localhost:3000/';
      $authProvider.cordova = true;
      commonConfig.redirectUri = 'http://localhost:8100';
    }

    $authProvider.facebook(angular.extend({}, commonConfig, {
      clientId: '100703896938969',
      responseType: 'token'
    }));

    $authProvider.twitter(angular.extend({}, commonConfig, {
      url: 'http://localhost:3000/auth/twitter'
    }));

    $authProvider.google(angular.extend({}, commonConfig, {
      clientId: '630524341769-18r7lv3t75ius04f7f9na9b4a72bdq08.apps.googleusercontent.com',
      url: 'auth/google'
    }));
  })
  .controller('AppCtrl', function($scope, $ionicModal, $timeout) { //jshint ignore:line
      console.log('in AppCtrl');
  })
  .controller('TodoCtrl', function($scope, $ionicModal, todoDb,
                                    $ionicPopup, $ionicListDelegate,
                                    $auth, $localStorage, $state) {
//  console.log('in TodoCtrl');
    $scope.storage = $localStorage;
    // Initialize tasks
    $scope.tasks = [];

    ////////////////////////
    // Online sync to CouchDb
    ////////////////////////
    $scope.online = false;

    $scope.toggleOnline = function() {
      $scope.online = !$scope.online;
      if ($scope.online) {  // Read http://pouchdb.com/api.html#sync
        $scope.sync = todoDb.sync('http://devcdb/todos', {live: true})
          .on('error', function (err) {
            console.log("Syncing stopped");
            console.log(err);
          });
      } else {
        $scope.sync.cancel();
      }
    };

    $scope.completionChanged = function(task) {
      task.completed = !task.completed;
      $scope.update(task);
    };

    todoDb.changes({
      live: true,
      onChange: function (change) {
        if (!change.deleted) {
          todoDb.get(change.id, function(err, doc) {
            if (err) {console.log(err);}
            $scope.$apply(function() { //UPDATE
              for (var i = 0; i < $scope.tasks.length; i++) {
                if ($scope.tasks[i]._id === doc._id) {
                  $scope.tasks[i] = doc;
                  return;
                }
              } // CREATE / READ
              $scope.tasks.push(doc);
            });
          });
        } else { //DELETE
          $scope.$apply(function () {
            for (var i = 0; i<$scope.tasks.length; i++) {
              if ($scope.tasks[i]._id === change.id) {
                $scope.tasks.splice(i,1);
              }
            }
          });
        }
      }
    });

    $scope.update = function (task) {
      todoDb.get(task._id, function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          todoDb.put(angular.copy(task), doc._rev, function (err, res) { //jshint ignore:line
            if (err) {console.log(err);}
          });
        }
      });
    };

    $scope.delete = function(task) {
      todoDb.get(task._id, function (err, doc) {
        todoDb.remove(doc, function (err, res) {}); //jshint ignore:line
      });
    };

    $scope.editTitle = function (task) {
      var scope = $scope.$new(true);
      scope.data = { response: task.title } ;
      $ionicPopup.prompt({
        title: 'Edit task:',
        scope: scope,
        buttons: [{
            text: 'Cancel',
            onTap: function(e) { return false; } //jshint ignore:line
          },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) { //jshint ignore:line
              return scope.data.response;
            }
          },
        ]
      }).then(function (newTitle) {
        if (newTitle && newTitle !== task.title) {
          task.title = newTitle;
          $scope.update(task);
        }
        $ionicListDelegate.closeOptionButtons();
      });
    };

    // Create our modal
    $ionicModal.fromTemplateUrl('templates/new-task.html', function(modal) {
      $scope.taskModal = modal;
    }, {
      scope: $scope
    });

    $scope.createTask = function(task) {
      task.completed = false;
      todoDb.post(angular.copy(task), function(err, res) { //jshint ignore:line
        if (err) {console.log(err);}
        task.title = "";
      });
      $scope.taskModal.hide();
    };

    $scope.newTask = function() {
      $scope.taskModal.show();
    };

    $scope.closeNewTask = function() {
      $scope.taskModal.hide();
    };

    $scope.authenticate = function(provider) {
      //console.log('authenticate');
      $auth.authenticate(provider)
        .then(function() {
          $ionicPopup.alert({
            title: 'Success',
            content: 'You have successfully logged in!'
          });
          $state.go('app.home');
        })
        .catch(function(response) {
          $ionicPopup.alert({
            title: 'Error',
            content: response.data ? response.data || response.data.message : response
          });

        });
    };

    $scope.logout = function() {
      console.log('in logout method');
      $auth.logout()
      .then(function() {
        console.log('in logout callback method');
        $state.go('app.auth');
      });
    };

    $scope.isAuthenticated = function() {
//      console.log('is authenticated: ' + $auth.isAuthenticated());
      return $auth.isAuthenticated();
    };
  });
