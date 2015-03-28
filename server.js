
var server = require('http').createServer();
var express = require('express');
var Game = require('./models/game');
var controller = require('.controllers/game');

app = express();

games = {};
playerDict = {};

app.get('/games/:gameid/state.json', function(req, res) {
  gameID = req.params.gameid;
  if(gameID in games) {
    game = games[gameID];
    if(req.playerID in playerDict) {
      if(controller.hasPlayer(game, playerDict[req.playerID])) {
        res.json(game);
      }
    }
  }
});
