
var crypto = require('crypto');
var Game = require('../models/game')

exports.hasID = function(authDict, playerID) {
  for (var code in authDict) {
    if(authDict.hasOwnProperty(code)) {
      if(authDict[code] == playerID) {
        return true;
      }
    }
  }
  return false;
}

exports.newGame = function(games) {
  do {
    var code = Math.floor(Math.random() * 8999 + 1000);
  } while (games.hasOwnProperty(code));
  games[code] = new Game(code);
  return code;
}

exports.log = function(game, message) {
  console.log(game.gameID + "-P(" + game.players.length + ")-M(" + game.moveNumber + "): " + message);
}

exports.printPlayer = function(player) {
  return "(" + player.playerID + ") " +player.playerName;
}
