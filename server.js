#!/bin/env node

var express = require('express');
var Game = require('./models/game');
var User = require('./models/user');
var controller = require('./controllers/game');
var utils = require('./controllers/utils');
var crypto = require('crypto');

var app = express();

var games = {};
var authDict = {};
var userDict = {};

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-auth-code");
  next();
})

app.post('/signup.json', function(req, res) {
  var name = req.query.name;
  do {
    var potentialCode = crypto.randomBytes(32).toString('hex');
  } while (authDict.hasOwnProperty(potentialCode));
  do {
    var potentialID = crypto.randomBytes(8).toString('hex');
  } while (utils.hasID(authDict, potentialID));
  authDict[potentialCode] = potentialID;
  var user = new User(potentialID, name);
  userDict[potentialID] = user;
  console.log("****-*(*)-*(*): " + utils.printPlayer(user) + " signed up.");
  return res.status(200).json({auth: potentialCode, playerID: potentialID}); // response to client
});

app.get('/games/:gameid/state.json', function(req, res) {
  var game = games[req.params.gameid];
  if(!game) {
    return res.status(404).send("Game not found");
  }
  if(req.params.movenumber == game.moveNumber) {
    return res.status(406).send("Client up to date");
  }
  var auth = authDict[req.get('X-Auth-Code')];
  if (!auth) {
    return res.status(401).send("Invalid auth");
  }
  if(controller.hasPlayer(game, userDict[auth])) {
    controller.checkTimeouts(userDict, game);
    return res.status(200).json(game);
  } else {
    return res.status(401).send("Player not in game");
  }
});

app.post('/games/newgame.json', function(req, res) {
  var auth = authDict[req.get('X-Auth-Code')];
  if(!auth) {
    return res.status(401).send("Bad auth");
  }
  var user = userDict[auth];
  var gameCode = utils.newGame(games);
  var game = games[gameCode];
  utils.log(game, "Created.");
  controller.addPlayer(game, user);
  controller.startNewRound(game);
  return res.status(200).json({gameID: gameCode});
});

app.post('/games/:gameid/join.json', function(req, res) {
  var game = games[req.params.gameid];
  if(!game) {
    return res.status(404).send("Game not found");
  }
  var auth = authDict[req.get('X-Auth-Code')];
  if (!auth) {
    return res.status(401).send("Invalid auth");
  }
  var user = userDict[auth];
  if(!controller.hasPlayer(game, user)) {
    controller.addPlayer(game, user);
    return res.status(200).send();
  } else {
    return res.status(202).send("Already in game");
  }
});

app.post('/games/:gameid/continue.json', function(req, res) {
  var game = games[req.params.gameid];
  if(!game) {
    res.status(404).send("No such game");
  }
  var auth = authDict[req.get('X-Auth-Code')];
  if(!auth) {
    return res.status(401).send("Invalid auth");
  }
  var user = userDict[auth];
  if(controller.continueToNextRound(game, user)) {
    return res.status(200).send("Continued");
  } else {
    return res.status(403).send("Game not finished");
  }
});

// Game logic

app.post('/games/:gameid/stay.json', function(req,res) {
  var game = games[req.params.gameid];
  if(!game) {
    return res.status(404).send("No such game");
  }
  var auth = authDict[req.get('X-Auth-Code')];
  if(!auth) {
    return res.status(401).send("Invalid auth");
  }
  var user = userDict[auth];
  if(!controller.isPlayerMove(game, user)) {
    return res.status(401).send("Not your turn");
  }
  if(controller.currentPlayerStay(userDict, game)) {
    return res.status(200).send("PlayerStayed");
  } else {
    return res.status(406).send("Not allowed");
  }
});


app.post('/games/:gameid/bet.json', function(req, res) {
  var game = games[req.params.gameid];
  if(!game) {
    return res.status(404).send("No such game");
  }
  var auth = authDict[req.get('X-Auth-Code')];
  if(!auth) {
    return res.status(401).send("Invalid auth");
  }
  var user = userDict[auth];
  if(!controller.hasPlayer(game, user)) {
    return res.status(404).send("Player not in game");
  }
  if(!controller.isPlayerMove(game, user)) {
    return res.status(401).send("Not your move");
  }
  amount = +req.query.amount;
  if(controller.currentPlayerBet(userDict, game, amount)) {
    return res.status(200).send('Bet accepted');
  } else {
    return res.status(406).send('Bet denied');
  }
});

app.post('/games/:gameid/hit.json', function(req,res) {
  var game = games[req.params.gameid];
  if(!game) {
    return res.status(404).send("No such game");
  }
  var auth = authDict[req.get('X-Auth-Code')];
  if(!auth) {
    return res.status(401).send("Invalid auth");
  }
  var user = userDict[auth];
  if(!controller.hasPlayer(game, user)) {
    return res.status(404).send("Player not in game");
  }
  if(!controller.isPlayerMove(game, user)){
    return res.status(401).send("Not your turn");
  }
  if(controller.currentPlayerHit(userDict, game)) {
    return res.status(200).send("Card dealt");
  } else {
    return res.status(406).send("Not allowed");
  }
});


var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

if (typeof ipaddress === "undefined") {
    //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
    //  allows us to run/test the app locally.
    console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
    ipaddress = "127.0.0.1";
};

console.log("----Running----");
app.listen(port, ipaddress);