angular.module('userCtrl', ['userService'])

  .controller('userController', function (User) {

    var vm = this;

    // set a processing variable to show loading things
    vm.processing = true;

    // grab all the users at page load
    User.all()
      .then(function (data) {

        // when all the users come back, remove the processing variable
        vm.processing = false;

        // bind the users that come back to vm.users
        vm.users = data.data;
        console.log(vm.users);
      });
  })

  // controller applied to user creation page
  .controller('userCreateController', function (User, $location) {

    var vm = this;

    // function to create a user
    vm.saveUser = function () {
      vm.processing = true;
      vm.message = '';

      // use the create function in the userService
      User.create(vm.userData)
        .then(function (data) {
          vm.processing = false;
          vm.userData = {};
          vm.message = data.data.message;
          // $location.path('/login');
        });
    };
  })

  // controller applied to user edit page
  .controller('userEditController', function ($routeParams, User, $location) {

    var vm = this;

    // get the user data for the user you want to edit
    // $routeParams is the way we grab data from the URL
    User.get($routeParams.user_id)
      .then(function (data) {
        vm.userData = data;
      });

    // function to save the user
    vm.saveUser = function () {
      vm.processing = true;
      vm.message = '';

      // call the userService function to update
      User.update($routeParams.user_id, vm.userData)
        .then(function (data) {
          vm.processing = false;

          // clear the form
          vm.userData = {};

          // bind the message from our API to vm.message
          vm.message = data.data.message;
        });
    };

    // function to delete a user
    vm.deleteUser = function (id) {
      vm.processing = true;

      User.delete(id)
        .then(function (data) {

          // get all users to update the table
          // you can also set up your api
          // to return the list of users with the delete call
          User.all()
            .then(function (data) {
              vm.processing = false;
              vm.users = data;
              vm.message = 'User Deleted!'
              $location.path('/users');
            });
        });
    };
  });