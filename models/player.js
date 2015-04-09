
var Hand = require('./hand');
var Card = require('./card');

function Player(playerID) {
  this.hands = [];
  this.hands.push(new Hand());
  this.active = true;
  this.totalMoney = 500;
  this.playerID = playerID;
}

module.exports = Player;
