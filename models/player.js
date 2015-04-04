
var Hand = require('./hand');
var Card = require('./card');

function Player(userName, playerName) {
  this.hands = [];
  this.hands.push(new Hand());
  this.active = true;
  this.totalMoney = 500;
  this.userName = userName;
  this.playerName = playerName;
}

module.exports = Player;
