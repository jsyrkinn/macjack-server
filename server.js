
var server = require('http').createServer();
var express = require('express');
var Game = require('./models/game');
var controller = require('./controllers/game');
require('mootools');

var app = express();

games = {};
playerDict = {};

// TEST

playerDict[1] = 'Evan';
playerDict[2] = 'Judy';

testgame = new Game();
controller.initialize(testgame, 'Evan');
controller.addPlayer(testgame, 'Judy');
controller.addQueuedPlayers(testgame);


games[1] = testgame;

//

app.get('/games/:gameid/state.json', function(req, res) {
  gameID = req.params.gameid;
  if(gameID in games) {
    game = games[gameID];
    if(req.query.playerid in playerDict) {
      if(controller.hasPlayer(game, playerDict[req.query.playerid])) {
        console.log(JSON.stringify(game.players[0]));
        res.send(JSON.stringify(game));
      } else {
        res.status(404).send("Player not in game");
      }
    } else {
      res.status(404).send("Player not found");
    }
  } else {
    res.status(404).send("Game not found");
  }
});

app.listen(1337);
