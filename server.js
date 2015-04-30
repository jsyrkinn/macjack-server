
var express = require('express');
var Game = require('./models/game');
var User = require('./models/user');
var controller = require('./controllers/game');
var utils = require('./controllers/utils');
var crypto = require('crypto');

var app = express();

games = {};
authDict = {};
userDict = {};

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-auth-code");
  next();
})

app.post('/signup.json', function(req, res) {
  name = req.query.name;
  do {
    var potentialCode = crypto.randomBytes(32).toString('hex');
  } while (authDict.hasOwnProperty(potentialCode));
  do {
    var potentialID = crypto.randomBytes(8).toString('hex');
  } while (utils.hasID(authDict, potentialID));
  authDict[potentialCode] = potentialID;
  userDict[potentialID] = new User(potentialID, name);
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
    auth = authDict[req.get('X-Auth-Code')];
    if(auth) {
      if(controller.hasPlayer(game, userDict[auth])) {
        controller.checkTimeouts(userDict, game);
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
  auth = authDict[req.get('X-Auth-Code')];
  if(auth) {
    user = userDict[auth];
    gameCode = utils.newGame(games);
    game = games[gameCode];
    controller.addPlayer(game, user);
    controller.startNewRound(game);
    res.status(200).json({gameID: gameCode});
  } else {
    res.status(404).send("Bad auth");
  }
});

app.post('/games/:gameid/join.json', function(req, res) {
  gameID = req.params.gameid;
  if(gameID in games) {
    game = games[gameID];
    auth = authDict[req.get('X-Auth-Code')];
    if(auth) {
      user = userDict[auth];
      //if(!user.inGame) {
      if(true) {
        controller.addPlayer(game, user);
        res.status(200).send();
      }
    }
  } else {
    res.status(404).send("Game not found");
  }
});

app.post('/games/:gameid/continue.json', function(req, res) {
  game = games[req.params.gameid];
  if(game) {
    auth = authDict[req.get('X-Auth-Code')];
    if(auth) {
      user = userDict[auth];
      if(user) {
        if(controller.continueToNextRound(game, user)) {
          res.status(200).send("Continued");
        } else {
          res.status(404).send("Game not finished")
        }
      }
      res.status(404).send("Invalid user");
    }
    res.status(404).send("Invalid auth");
  }
  res.status(404).send("No such game");
});

// Game logic

app.post('/games/:gameid/stay.json', function(req,res) {
  game = games[req.params.gameid];
  if(game) {
    auth = authDict[req.get('X-Auth-Code')];
    if(auth) {
      user = userDict[auth];
      if(controller.isPlayerMove(game, user)) {
        if(controller.currentPlayerStay(userDict, game)) {
          res.status(200).send("PlayerStayed");
        } else {
          res.status(404).send("Not your turn");
        }
      }
    } else {
      res.status(404).send("User not in game");
    }
  } else {
    res.status(404).send("No such game");
  }
});


app.post('/games/:gameid/bet.json', function(req, res) {
  game = games[req.params.gameid];
  if(game) {
    auth = authDict[req.get('X-Auth-Code')];
    user = userDict[auth];
    if(user) {
      if(controller.hasPlayer(game, user)) {
        if(controller.isPlayerMove(game, user)) {
          amount = req.query.amount;
          if(controller.currentPlayerBet(userDict, game, amount)) {
            res.status(200).send('Bet accepted');
          } else {
            res.status(404).send('Bet denied')
          }
        } else {
          res.status(404).send("Not your move");
        }
      } else {
        res.status(404).send("Player not in game");
      }
    } else {
      res.status(404).send("Bad auth");
    }
  } else {
    res.status(404).send("Game not found");
  }
});

app.post('/games/:gameid/hit.json', function(req,res) {
  game = games[req.params.gameid];
  if(game) {
    auth = authDict[req.get('X-Auth-Code')];
    user = userDict[auth];
    if(user) {
      if(controller.isPlayerMove(game, user)){
        if(controller.currentPlayerHit(userDict, game)) {
          res.status(200).send("Card dealt");
        } else {
          res.status(404).send("Not your turn");
        }
      }
    } else{
      res.status(404).send("User not in game");
    }
  } else {
    res.status(404).send("No such game");
  }
});

app.listen(1337);
