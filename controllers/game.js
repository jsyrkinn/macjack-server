
var Player = require('../models/player');
var Card = require('../models/card');
var Hand = require('../models/hand');

drawCard = function(game) {
  var deck = game.deck
  if (deck.length > 0) {
      var idx = Math.floor(Math.random()*deck.length);
      return deck.splice(idx, 1)[0];
  }
}

dealCard = function(game, playerID, hand) {
  game.players.forEach(function(player) {
    if(playerID == player.playerID) {
      player.hands[hand].cards.push(drawCard(game));
    }
  });
}

addPlayer = function(game, playerID) {
  game.joinQueue.push(new Player(playerID));
}

addQueuedPlayers = function(game) {
  game.joinQueue.forEach(function(player){
    game.players.push(player);
  })
  game.joinQueue = [];
}

startNewRound = function(game) {
  game.moveNumber = 0;
  game.deck = [];
  ['Spades', 'Clubs', 'Hearts', 'Diamonds'].forEach(function(suit) {
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach(function(rank) {
        game.deck.push(new Card(rank, suit));
      });
  });
  addQueuedPlayers(game);
  game.players.forEach(function(player) {
    player.hands = [new Hand()];
  })
  game.currentPlayer = game.players[0].playerID;
  game.currentPlayerHand = 0;
  game.dealerCards = [];
  game.dealerCards.push(drawCard(game));
}

hasPlayer = function(game, playerID) {
  inGame = false;
  game.players.forEach(function(player) {
    if(playerID == player.playerID) {
      inGame = true;
    }
  })
  return inGame;
}

exports.dealCard = dealCard;
exports.startNewRound = startNewRound;
exports.addPlayer = addPlayer;
exports.hasPlayer = hasPlayer;
exports.addQueuedPlayers = addQueuedPlayers;
