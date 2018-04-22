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
      stage.setChildIndex(stage.getChildByName(vm.user), stage.numChildren - 1);
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

      socket.emit('createPlayer', {

      });
      
      playerTile = new createjs.Sprite(greatWhite);
      playerTile.gotoAndStop(0);
      playerTile.name = vm.user;
      playerTile.x = 160;
      playerTile.y = 320;
      stage.addChild(playerTile);
      stage.setChildIndex(stage.getChildByName(vm.user), stage.numChildren - 1);
      stage.update();
      
    });

    vm.focus = function(event){
      event.target.focus();
    }

    // Function for when a move is registered
    vm.move = function (event) {
      event.preventDefault();
      var player = stage.getChildByName(vm.user);

      //var intersect = false;
      //var direction;
      var x = player.x;
      var y = player.y;

      // Which directional key triggered the event
      switch (event.keyCode) {
        case 37:
        case 65:
          //direction = "left";
          x-=2;
          break;
        case 38:
        case 87:
          //direction = "up";
          y-=2;
          break;
        case 39:
        case 68:
          //direction = "right";
          x+=2;
          break;
        case 40:
        case 83:
          //direction = "down";
          y+=2;
          break;
        default:
          //direction = null;
      }

      socket.emit('move', {
        name: player.name,
        x: x,
        y: y
        // intersect: intersect,
        // stage: currStage
      });
    }

    // Function for when a player has moved
    socket.on('moved', function (data) {
      var shark = stage.getChildByName(data.name);

      createjs.Tween.get(shark).to({
        x: data.x,
        y: data.y
      });

      stage.update();

    });

  });