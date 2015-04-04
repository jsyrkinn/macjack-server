
var Player = require('../models/player');
var Card = require('../models/card');

drawCard = function(game) {
  var deck = game.deck
  if (deck.length > 0) {
      var idx = Math.floor(Math.random()*deck.length);
      return deck.splice(idx, 1)[0];
  }
}

dealCard = function(game, userName, hand) {
  for(player in game.players) {
    if(userName == player.userName) {
      player.hands[hand].cards.push(drawCard(game));
    }
  }
}

addPlayer = function(game, userName, playerName) {
  game.joinQueue.push(new Player(userName, playerName));
}

addQueuedPlayers = function(game) {
  game.joinQueue.forEach( function(player){
    game.players.push(player);
  })
  game.joinQueue = [];
}

initialize = function(game) {
  ['Spades', 'Clubs', 'Hearts', 'Diamonds'].forEach(function(suit) {
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach(function(rank) {
        game.deck.push(new Card(rank, suit));
      });
  });
  game.dealersCards.push(drawCard(game));
}

hasPlayer = function(game, userName) {
  inGame = false;
  game.players.forEach( function(player) {
    if(userName == player.userName) {
      inGame = true;
    }
  })
  return inGame;
}

exports.dealCard = dealCard;
exports.initialize = initialize;
exports.addPlayer = addPlayer;
exports.hasPlayer = hasPlayer;
exports.addQueuedPlayers = addQueuedPlayers;
