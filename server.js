
var server = require('http').createServer();
var express = require('express');
var Game = require('./models/game');
var controller = require('./controllers/game');

var app = express();

games = {};
userDict = {};

// TEST

userDict[1] = 'Evan';
userDict[2] = 'Judy';

testgame = new Game();
controller.initialize(testgame);
controller.addPlayer(testgame, 'Evan', 'Evan');
controller.addQueuedPlayers(testgame);


games[1] = testgame;

//

app.get('/games/:gameid/state.json', function(req, res) {
  gameID = req.params.gameid;
  if(gameID in games) {
    game = games[gameID];
    if(req.query.playerid in userDict) {
      if(controller.hasPlayer(game, userDict[req.query.playerid])) {
        res.json(game);
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
