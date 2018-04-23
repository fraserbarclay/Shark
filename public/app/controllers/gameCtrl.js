angular.module('gameCtrl', [])

  .controller('gameController', function (Auth, $scope) {

    var vm = this;
    vm.messages = [];
    vm.user = '';

    var socket = io.connect();
    $("#canvas").focus();

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

    // Create variable for canvas element
    var stage = new createjs.Stage("canvas");

    // Spritesheet to reference for making map
    var image = new Image();
    image.src = "assets/img/sharkspritesheet.png"
    var spritesheet = new createjs.SpriteSheet({
      images: [image],
      frames: {
        width: 16,
        height: 16,
        regX: 0,
        regY: 0,
        spacing: 0,
        margin: 0
      }
    });

    // Reading map layout and adding sprites to canvas element
    $.getJSON("assets/map/canvas.json", function (data) {
      $.each(data.layers, function (key, val) {
        var count = 0;
        for (var row = 0; row < stage.canvas.height; row += 16) {
          for (var col = 0; col < stage.canvas.width; col += 16) {
            var num = val.data[count] - 1;
            if (num >= 0) {
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

    // Spritesheet for player sprite
    var greatWhiteImage = new Image();
    greatWhiteImage.src = "assets/img/greatWhite2.png"
    var greatWhite = new createjs.SpriteSheet({
      images: [greatWhiteImage],
      frames: {
        width: 25,
        height: 16,
        regX: 0,
        regY: 0,
        spacing: 0,
        margin: 0
      }
    });

    Auth.getUser()
      .then(function (response) {
        vm.user = response.data.username;

        socket.emit('playerInitialLocation', {
          name: vm.user,
          x: 160,
          y: 320
        });

        socket.on('drawPlayer', function (data) {
          playerTile = new createjs.Sprite(greatWhite);
          playerTile.gotoAndStop(0);
          playerTile.name = data.name;
          playerTile.x = data.x;
          playerTile.y = data.y;
          stage.addChild(playerTile);
          stage.setChildIndex(stage.getChildByName(data.name), stage.numChildren - 1);
          stage.update();
        });

      });

    vm.focus = function (event) {
      event.target.focus();
    }

    // Function for when a move is registered
    vm.move = function (event) {
      event.preventDefault();
      var player = stage.getChildByName(vm.user);

      //var direction;
      var x = player.x;
      var y = player.y;

      // Which directional key triggered the event
      switch (event.keyCode) {
        case 37:
        case 65:
          x -= 10;
          break;
        case 38:
        case 87:
          y -= 10;
          break;
        case 39:
        case 68:
          x += 10;
          break;
        case 40:
        case 83:
          y += 10;
          break;
        default:
      }

      if (stage.getObjectUnderPoint(x, y, 0).name == 'Water') {
        socket.emit('move', {
          name: player.name,
          x: x,
          y: y
        });
      } else {
        console.log(stage.getObjectUnderPoint(x, y, 0).name);
      }
    }

    // Function for when a player has moved
    socket.on('moved', function (data) {
      var shark = stage.getChildByName(data.name);

      shark.x = data.x;
      shark.y = data.y;

      stage.update();
      $scope.$apply();
    });

  });