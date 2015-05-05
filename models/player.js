
var Hand = require('./hand');
var Card = require('./card');

function Player(playerID, playerName) {
  this.hands = [];
  this.hands.push(new Hand());
  this.active = true;
  this.money = 0;
  this.playerID = playerID;
  this.playerName = playerName;
}

module.exports = Player;
