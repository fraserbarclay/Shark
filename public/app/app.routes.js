angular.module('app.routes', ['ngRoute'])

  .config(function($routeProvider, $locationProvider) {

    $routeProvider

      // route for the home page
      .when('/', {
        templateUrl: 'app/views/pages/home.html'
      })

      // login page
      .when('/login', {
        templateUrl: 'app/views/pages/login.html',
        controller: 'mainController',
        controllerAs: 'login'
      })

      // form to create a new user
      .when('/register', {
        templateUrl: 'app/views/pages/register.html',
        controller: 'userCreateController',
        controllerAs: 'user'
      })

      // show all users
      .when('/game', {
        templateUrl: 'app/views/pages/game.html',
        controller: 'gameController',
        controllerAs: 'game'
      })

      // page to edit a user
      .when('/users/:user_id', {
        templateUrl: 'app/views/pages/users/edit.html',
        controller: 'userEditController',
        controllerAs: 'user'
      });

    $locationProvider.html5Mode(true);

  });