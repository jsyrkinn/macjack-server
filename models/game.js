
var Card = require('./card');
var Player = require('./player');

function Game() {
  this.players = [];
  this.deck = [];
  this.joinQueue = [];
  this.dealersCards = [];
  this.moveNumber = 0;
  this.currentPlayer = '';
  this.currentPlayerHand = 0;
}

module.exports = Game;
