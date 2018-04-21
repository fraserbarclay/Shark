angular.module('gameCtrl', [])

.controller('gameController', function (Auth, $scope) {

    var vm = this;
    vm.messages = [];

    Auth.getUser()
      .then(function (response) {
        vm.user = response.data.username;
      });

    var socket = io.connect();

    vm.gameData = {};
    vm.sendMessage = function () {
      socket.emit('send message', vm.gameData.chatMessage, vm.user);
    };

    socket.on('new message', function (data) {
      console.log(data);
      vm.gameData = {};
      vm.messages = data.messages;
      $scope.$apply();
    });
  });