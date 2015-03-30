
var Player = require('../models/player');

drawCard = function(game) {
  var deck = game.deck
  if (deck.length > 0) {
      var idx = Math.floor(Math.random()*deck.length);
      return deck.splice(idx, 1)[0];
  }
}

dealCard = function(game, playerName, hand) {
  for(player in game.players) {
    if(playerName == player.playerName) {
      player.hands[hand].cards.push(drawCard(game));
    }
  }
}

addPlayer = function(game, playerName) {
  game.joinQueue.push(new Player(playerName));
}

initialize = function(game, foundingPlayerName) {
  for (suit in ['Spades', 'Clubs', 'Hearts', 'Diamonds']) {
      for (rank in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
        game.deck.push(new Card(rank, suit));
      }
  }
  addPlayer(game, foundingPlayerID);
  game.currentPlayer = foundingPlayerName;
  game.dealersCards.push(drawCard(game));
}

hasPlayer = function(game, playerName) {
  for(player in game.players) {
    if(playerName == player.playerName) {
      return true;
    }
  }
  return false;
}

exports.dealCard = dealCard;
exports.initialize = initialize;
exports.addPlayer = addPlayer;
