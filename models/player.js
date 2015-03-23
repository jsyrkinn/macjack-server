
var Hand = require('./hand');
var Deck = require('./deck');


function Player(userName, id) {
  this.hands = [];
  this.totalMoney = 500;       //TODO: initialize totalMoney
  this.userName = userName;
  this.id = id;
}

Player.prototype.placeBet = function(amountBet) {
  this.hands[0].betMoney(this,amountBet);
}


//this needs to be moved to the controller...
Player.prototype.takeTurn = function() {
  //This function should loop through hands array
  for (hand in this.hands) {
    //ask player if they want to hit this hand
    //if (yes){
      //hand.drawCard (or whatever the hell this function is.)
    //}
    //endturn somehow
  }
}


module.exports = Player;

