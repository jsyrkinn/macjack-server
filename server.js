
var express = require('express');
var Game = require('./models/game');
var User = require('./models/user');
var controller = require('./controllers/game');
var utils = require('./controllers/utils');
var crypto = require('crypto');

var app = express();

games = {};
authDict = {};

// TEST

authDict[1] = new User(1, 'Evan');
authDict[2] = new User(2, 'Judy');

testgame = new Game();
controller.addPlayer(testgame, authDict[1]);
controller.startNewRound(testgame);


games[1] = testgame;

//


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-auth-code");
  next();
})

app.post('/signup.json', function(req, res) {
  name = req.query.name;
  do {
    var potentialCode = crypto.randomBytes(64).toString('hex');
  } while (!authDict.hasOwnProperty(potentialCode));
  do {
    var potentialID = crypto.randomBytes(10).toString('hex');
  } while (!utils.hasID(authDict, potentialID));
  authDict[potentialCode] = new User(potentialID, name);
  res.json({auth: potentialCode, playerID: potentialID}); // response to client
});

app.get('/games/:gameid/state.json', function(req, res) {
  gameID = req.params.gameid;
  if(gameID in games) {
    game = games[gameID];
    if(req.params.movenumber == game.moveNumber) {
      res.status(400).send("Client up to date");
      return;
    }
    auth = req.get('X-Auth-Code');
    console.log(auth);
    if(auth in authDict) {
      if(controller.hasPlayer(game, authDict[auth].playerID)) {
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

app.post('/games/newgame.json', function(req, res) {
  auth = req.get('X-Auth-Code');
  if(auth in authDict) {
    user = authDict[auth];
    gameID = utils.newGame(games);
    game = games[gameID];
  }
});

app.listen(1337);
