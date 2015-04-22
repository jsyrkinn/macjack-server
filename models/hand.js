
var Card = require('./card');

function Hand() {
  this.cards = [];
  this.bet = 0;
  this.busted = false;
  this.finished = false;
}

module.exports = Hand;
