
var express = require('express');
var Game = require('./models/game');
var controller = require('./controllers/game');

var app = express();

games = {};
authDict = {};

// TEST

authDict[1] = 'Evan';
authDict[2] = 'Judy';

testgame = new Game();
controller.addPlayer(testgame, 'Evan', 'Evan');
controller.startNewRound(testgame);


games[1] = testgame;

//

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-auth-code");
  next();
})

app.get('/games/:gameid/state.json', function(req, res) {
  gameID = req.params.gameid;
  if(gameID in games) {
    game = games[gameID];
    auth = req.get('X-auth-code');
    console.log(auth);
    if(auth in authDict) {
      if(controller.hasPlayer(game, authDict[auth])) {
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
