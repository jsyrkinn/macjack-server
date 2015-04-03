
var Hand = require('./hand');
var Card = require('./card');

function Player(playerName) {
  this.hands = [];
  this.hands.push(new Hand());
  this.active = true;
  this.totalMoney = 500;
  this.playerName = playerName;
}

module.exports = Player;
