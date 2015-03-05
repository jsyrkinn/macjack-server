
var server = require('http').createServer();
var io = require('socket.io')(server);


function Card(rank, suit) {
  this.rank = rank;
  this.suit = suit;

  // null, deck, board, PlayerSocketID
  this.boardLocation = "null";

  this.toString = function() {
    return this.rank + " of " + this.suit;
  }
}


function findCard(rank, suit) {
  //search for card
  for(c = 0; c < allCards.length; c++) {
    if (allCards[c].rank === rank && allCards[c].suit === suit) {
      return allCards[c];
    }
  }
}

var allCards = [];
var deck = [];

// create new deck
suits = ["spades", "clubs", "hearts", "diamonds"];
ranks = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "jack", "queen", "king"];
for (s = 0; s < suits.length; s++) {
  for (r = 0; r < ranks.length; r++) {
    card = new Card(ranks[r], suits[s]);
    allCards.push(card);

    card.boardLocation = "deck";
    deck.push(card);
  }
}

io.on('connection', function (socket) {
  console.log('socket connected');
  socket.hand = [];

  socket.on('disconnect', function () {
    console.log('socket disconnected');
  });

  socket.on('draw', function () {
    if (deck.length > 0) {
      idx = Math.floor(Math.random()*deck.length)
      cardArr = deck.splice(idx, 1);
      card = cardArr[0];
      console.log("Card drawn: " + card);

      socket.hand.push(card);

      socket.emit("drawnCard", card);
    } else {
      socket.emit("Error", "Deck has no cards")
    }
  });

  socket.on('playCard', function (playedCard) {

    card = findCard(playedCard.rank,playedCard.suit);
    console.log(JSON.stringify(playedCard) + " - " + card);

    idx = socket.hand.indexOf(card);
    if (idx > -1) {
      socket.hand.splice(idx, 1); //remove card from hand
      console.log("Card played: " + card);
      io.sockets.emit("playedCard", card);
    } else {
      socket.emit("Error", "Card not in hand");
    }
  });

});

server.listen(8080);
