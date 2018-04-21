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

    var stage = new createjs.Stage("canvas");
    var circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
    circle.x = 100;
    circle.y = 100;
    stage.addChild(circle);
    stage.update();

  });