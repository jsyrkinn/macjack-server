
function Card(rank, suit) {
  this.rank = rank;
  this.suit = suit;
  
}

Card.prototype.suits = ["spades", "clubs", "hearts", "diamonds"];
Card.prototype.ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];


module.exports = Card;

console.log("helloworld");