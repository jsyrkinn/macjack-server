
function Deck() {
	this.cards = []; 
	var suits = ["spades", "clubs", "hearts", "diamonds"];
	var ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
	for (suit in suits) {
  		for (rank in ranks) {
    		this.cards.push(new Card(rank, suit));
  		}
	}
}

Deck.prototype.drawCard = function() {
	if (this.cards.length > 0) {
    	var idx = Math.floor(Math.random()*this.cards.length)
      	return this.cards.splice(idx, 1)[0];
	}
}

