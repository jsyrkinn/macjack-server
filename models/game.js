
var Card = require('./card');
var Player = require('./player');
var Hand = require('./hand')

function Game(gameID) {
  this.gameID = gameID;
  this.players = [];
  this.deck = [];
  this.joinQueue = [];
  this.dealerHand = new Hand();
  this.moveNumber = 0;
  this.currentPlayer = 0;
  this.currentPlayerHand = 0;
  this.betting = true;
  this.finished = false;
  this.lastMoveTime = 0;
}

module.exports = Game;
