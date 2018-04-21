angular.module('mainCtrl', [])

  .controller('mainController', function ($rootScope, $location, Auth) {

    var vm = this;

    // set a processing variable to show loading things
    vm.processing = true;

    // get info if a person is logged in
    vm.loggedIn = Auth.isLoggedIn();

    // check to see if a user is logged in on every request
    $rootScope.$on('$routeChangeStart', function () {
      vm.loggedIn = Auth.isLoggedIn();

      // get user information on page load
      Auth.getUser()
        .then(function (response) {
          vm.user = response.data;
        });
    });

    // function to handle login form
    vm.doLogin = function () {
      vm.processing = true;

      // clear the error
      vm.error = '';

      Auth.login(vm.loginData.username, vm.loginData.password)
        .then(function (data) {
          console.log('Auth.login', data);
          vm.processing = false;

          // if a user successfully logs in, redirect to users page
          if (data.success)
            $location.path('/game');
          else
            vm.error = data.message;
        });
    };

    // function to handle logging out
    vm.doLogout = function () {
      Auth.logout();
      //vm.user = '';
      vm.user = {};

      $location.path('/login');
    };

    vm.createSample = function () {
      Auth.createSampleUser();
    };

  })