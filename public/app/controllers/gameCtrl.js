angular.module('gameCtrl', [])

  .controller('gameController', function (Auth, User, $scope) {

    var vm = this;
    vm.messages = [];
    vm.user = '';
    vm.userID = '';
    vm.enemyHealth;

    var socket = io.connect();
    $("#canvas").focus();

    vm.gameData = {};
    vm.sendMessage = function () {
      socket.emit('send message', vm.gameData.chatMessage, vm.user);
    };

    socket.on('new message', function (data) {
      vm.gameData = {};
      vm.messages = data.messages;
      $scope.$apply();
    });

    socket.on('leader', function(data){
      data.userScores.sort(function(a, b){return b.score - a.score});

      vm.userScores = data.userScores;
      $scope.$apply();
    });

    // Create variable for canvas element
    var stage = new createjs.Stage("canvas");

    createjs.Ticker.on("tick", tick);

    function tick(event) {
      stage.update(event);
    }

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
      // •
      var Oahu = new createjs.Text("O'ahu", "20px Arial", "#000000");
      var Molokai = new createjs.Text("Moloka'i", "20px Arial", "#000000");
      var Hawaii = new createjs.Text("HAWAIIAN ISLAND", "20px Arial", "#000000");
      var Maui = new createjs.Text("Maui", "20px Arial", "#000000");
      var Big = new createjs.Text("Hawai'i", "20px Arial", "#000000");

      Oahu.x = 155;
      Oahu.y = 80;
      stage.addChild(Oahu);

      Molokai.x = 295;
      Molokai.y = 115;
      stage.addChild(Molokai);

      Maui.x = 410;
      Maui.y = 200;
      stage.addChild(Maui);

      Big.x = 500;
      Big.y = 350;
      stage.addChild(Big);

      Hawaii.x = 280;
      Hawaii.y = 225;
      Hawaii.rotation = 40;
      stage.addChild(Hawaii);
    });

    // Spritesheet for player sprite
    var greatWhiteImage = new Image();
    greatWhiteImage.src = "assets/img/sammyShark.png"
    var greatWhite = new createjs.SpriteSheet({
      images: [greatWhiteImage],
      frames: {
        width: 49,
        height: 37,
        regX: 0,
        regY: 0,
        spacing: 0,
        margin: 0
      },
      animations: {
        idle: [0, 11, "idle", 0.5]
      }
    });

    // Spritesheet for enemy sprite
    var fishImage = new Image();
    fishImage.src = "assets/img/funnyFish.png"
    var fish = new createjs.SpriteSheet({
      images: [fishImage],
      frames: {
        width: 86,
        height: 48,
        regX: 0,
        regY: 0,
        spacing: 0,
        margin: 0
      },
      animations: {
        idle: [0, 30, "idle", 1]
      }
    });


    Auth.getUser()
      .then(function (response) {
        vm.user = response.data.username;
        vm.userID = response.data.userID;
        socket.emit('playerInitialLocation', {
          name: vm.user,
          //x: 160,
          //y: 320
          x: 350,
          y: 50,
          score: response.data.score
        });

        socket.on('drawPlayer', function (data) {
          playerTile = new createjs.Sprite(greatWhite);
          playerTile.gotoAndPlay("idle");
          playerTile.name = data.name;
          playerTile.x = data.x;
          playerTile.y = data.y;
          stage.addChild(playerTile);
        });
      });

    socket.on('drawEnemy', function (data) {
      enemyTile = new createjs.Sprite(fish);
      enemyTile.gotoAndPlay("idle");
      enemyTile.name = "enemy";
      enemyTile.x = 450;
      enemyTile.y = 50;
      stage.addChild(enemyTile);
      vm.enemyHealth = data.enemyHealth;
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

      if (x > 420 && x < 500 && y > 25 && y < 70) {
        socket.emit('attack', {
          name: player.name
        });
      } else if (stage.getObjectUnderPoint(x, y, 0).name == 'Water') {
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
    });

    // Function for when a player has attacked
    socket.on('attacked', function (data) {
      vm.enemyHealth = data.enemyHealth;
      $scope.$apply();
      if (vm.enemyHealth == 0) {
        stage.removeChild(enemyTile);
      }

      // get the user data for the user to edit   
       vm.userData = {};
      // Update user score
        if (data.score != undefined){
          data.score++;
        } else {
          data.score = 0;
        }
        vm.userData.score = data.score;
        vm.userData.userID = vm.userID;

      // call the userService function to update
      User.update(vm.userID, vm.userData)
        .then(function (data) {
        }); 
    });
  });