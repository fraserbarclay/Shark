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
    // var circle = new createjs.Shape();
    // circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
    // circle.x = 100;
    // circle.y = 100;
    // stage.addChild(circle);
    // stage.update();

    var image = new Image();
    image.src = "assets/img/sharkspritesheet.png"
    var spritesheet = new createjs.SpriteSheet({
      images: [image],
      frames : {
        width: 16,
        height: 16,
        regX: 0,
        regY: 0,
        spacing: 0,
        margin: 0
      }
    });
    
    $.getJSON("assets/map/canvas.json", function(data){
      $.each(data.layers, function(key, val){
        var count = 0;

        for (var row = 0; row < stage.canvas.height; row += 16){
          for (var col = 0; col < stage.canvas.width; col += 16){
            var num = val.data[count] - 1;
            if (num >= 0){
              var tile = new createjs.Sprite(spritesheet);
              tile.gotoAndStop(num);
              tile.x = col;
              tile.y = row;
              tile.name = val.name;
              stage.addChild(tile);
            }
            count++;
          }
        }
      });
      stage.update();
    });
  });