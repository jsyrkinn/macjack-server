
var Card = require('./card');


function Deck() {
	console.log("Deck created.");
	this.cards = []; 
	for (suit in Card.prototype.suits) {
  		for (rank in Card.prototype.ranks) {
    		this.cards.push(new Card(Card.prototype.ranks[rank], Card.prototype.suits[suit]));
        console.log(this.cards);
  		}
	}
}
Deck.prototype.dealCard = function() {
  console.log(this.cards.length);
  if (this.cards.length > 0) {
      var idx = Math.floor(Math.random()*this.cards.length)
      console.log("card drawn");
        return this.cards.splice(idx, 1)[0];
  }
}



module.exports = Deck;