
var Card = require('./card');
var Deck = require('./deck');


function Hand(deck) {
  console.log("created a hand")
  this.deck = deck;
  this.cards = [];
  this.bet = null; //TODO: set bet default
}

Hand.prototype.addNewCard = function() {
  this.cards.push(this.deck.dealCard()); //adding card that was dealt from deck to hand
}



//code for the sum of a hand - not tested yet
/*
Hand.prototype.sum = function() {
    var totals = [];
    var normTotal = 0;
    var aceHigh = 0;
    var aceLow = 0;
    var acePresent = false
    for (card in cards) {
        if (card.rank > 10) {  //if card is jack, queen, king
            normTotal += 10;  //total gets incremented by 10
        }
        else if (card.rank = 1) {
            acePresent = true;
            aceHigh = normTotal + 11;
            aceLow = normTotal + 1;
            totals.push(aceLow);
            totals.push(aceHigh);
        }
        else {
            if (acePresent) {
                aceHigh += card.rank;
                aceLow += card.rank;
                totals.push(aceLow);
                totals.push(aceHigh);
            }
            else {
            normTotal += card.rank
            totals.push(total)
            }
        }
    }
    return totals
}
*/

module.exports = Hand;
