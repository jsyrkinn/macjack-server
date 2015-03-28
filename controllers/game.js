
var Player = require('../models/player');

drawCard = function(game) {
  var deck = game.deck
  if (deck.length > 0) {
      var idx = Math.floor(Math.random()*deck.length);
      return deck.splice(idx, 1)[0];
  }
}

dealCard = function(game, playerID, hand) {
  for(player in game.players) {
    if(playerID == player.playerID) {
      player.hands[hand].cards.push(drawCard(game));
    }
}

addPlayer = function(game, playerID, playerName) {
  game.joinQueue.push(new Player(playerID, playerName));
}

initalize = function(game, foundingPlayerID, foundingPlayerName) {
  for (suit in ['Spades', 'Clubs', 'Hearts', 'Diamonds']) {
      for (rank in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
        game.deck.push(new Card(rank, suit));
      }
  }
  addPlayer(game, foundingPlayerID, foundingPlayerName);
  game.currentPlayer = foundingPlayerID;
  game.dealersCards.push(drawCard(game));
}

exports.dealCard = dealCard;
exports.initalize = initalize;
exports.addPlayer = addPlayer;
