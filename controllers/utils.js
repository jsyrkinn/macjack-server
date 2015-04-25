
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
    var code = crypto.randomBytes(2).toString('hex');
  } while (games.hasOwnProperty(code));
  games[code] = new Game();
  return code;
}
