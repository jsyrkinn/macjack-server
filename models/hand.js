
var Card = require('./card');
var Deck = require('./deck');


function Hand(deck) {
  console.log("created a hand")
  this.deck = deck;
  this.cards = [];
  this.bet = 0; 
}

Hand.prototype.betMoney = function (player,money) {
    this.bet = money;
    player.totalMoney -= money;
}

Hand.prototype.addNewCard = function() {
  this.cards.push(this.deck.dealCard()); //adding card that was dealt from deck to hand
}

Hand.prototype.sumTotal = function() {
    var totals = [];
    totals[0] = 0;
    var normTotal = 0;
    var aceHigh = 0;
    var aceLow = 0;

    for (var i = 0; i <  this.cards.length; i++ ) {
        var card = this.cards[i];
        var totLength = totals.length;
        for(var b = 0; b < totLength; b++){

            if (card.rank != 1 && card.rank <= 10) {
                totals[b] += card.rank;
            }

            else if (card.rank > 10){
                totals[b] += 10;
            }

            else {
                totals.push(totals[b] + 11);
                totals[b]+=1;
            }
        }
    }
    return totals
}


module.exports = Hand;
