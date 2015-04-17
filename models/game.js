
var Card = require('./card');
var Player = require('./player');

function Game() {
  this.players = [];
  this.deck = [];
  this.joinQueue = [];
  this.dealerCards = [];
  this.moveNumber = 0;
  this.currentPlayer = 0;
  this.currentPlayerHand = 0;
}

module.exports = Game;
