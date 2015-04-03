
var Card = require('./card');


function Hand() {
  this.cards = [];
  this.bet = 0;
}

// Hand.prototype.betMoney = function (player, money) {
//     this.bet = money;
//     player.totalMoney -= money;
// }
//
// Hand.prototype.sumTotal = function() {
//     var totals = [];
//     totals[0] = 0;
//
//     for (var i = 0; i <  this.cards.length; i++ ) {
//         var card = this.cards[i];
//         var totLength = totals.length;
//         for(var b = 0; b < totLength; b++) {
//             if (card.rank != 1 && card.rank <= 10) {
//                 totals[b] += card.rank;
//             } else if (card.rank > 10){
//                 totals[b] += 10;
//             } else {
//                 totals.push(totals[b] + 11);
//                 totals[b]+=1;
//             }
//         }
//     }
//     return totals
// }


module.exports = Hand;
