
var express = require('express');
var Game = require('./models/game');
var controller = require('./controllers/game');
var crypto = require('crypto')

var app = express();

games = {};
authDict = {};

function hasID(authDict, playerID) {
  for (var code in authDict) {
    if(authDict.hasOwnProperty(code)) {
      if(authDict[code] == playerID) {
        return true;
      }
    }
  }
  return false;
}

// TEST

authDict[1] = {playerID: 1, playerName: 'Evan'};
authDict[2] = {playerID: 2, playerName: 'Judy'};

testgame = new Game();
controller.addPlayer(testgame, 1);
controller.startNewRound(testgame);


games[1] = testgame;

//


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-auth-code");
  next();
})

app.get('/signup.json', function(req, res) {
  name = req.query.name;
  do {
    var potentialCode = crypto.randomBytes(64).toString('hex');
  } while (!authDict.hasOwnProperty(potentialCode));
  do {
    var potentialID = crypto.randomBytes(10).toString('hex');
  } while (!hasID(authDict, potentialID));
  authDict[potentialCode] = potentialID;

});

app.get('/games/:gameid/state.json', function(req, res) {
  gameID = req.params.gameid;
  if(gameID in games) {
    game = games[gameID];
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

app.listen(1337);
