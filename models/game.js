

//var Card = require('./card');
var Player = require('./player');
var Deck = require('./deck');

function Game() {
  this.players = [];
  this.id = null; //TODO: initialize id
  this.deck = new Deck();

}

//create function addPlayer(), dropPlayer(), 
Game.prototype.addPlayer = function(userName, id) {
  player = new Player(userName, id);
  this.players.push(player);
  console.log(player);
}

Game.prototype.getCurrentPlayer = function() {
   //This function should return the player whose turn it is
}


module.exports = Game;