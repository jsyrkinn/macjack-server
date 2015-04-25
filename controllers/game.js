
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

dealCard = function(game, hand) {
  //TODO make game handle running out of cards
  hand.cards.push(drawCard(game));
}

syncMoney = function(user, player) {
  if(user.playerID == player.playerID) {
    player.money = user.money;
  } else {
    console.log('syncMoney: mismatch');
  }
}

addPlayer = function(game, user) {
  user.inGame = true;
  player = new Player(user.playerID, user.playerName);
  syncMoney(user, player);
  if(game.moveNumber == 0) {
    game.players.push(player);
  } else {
    game.joinQueue.push(player);
  }
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
  game.currentPlayer = 0;
  game.currentPlayerHand = 0;
  game.dealerHand = new Hand();
  dealCard(game, game.dealerHand);
}

hasPlayer = function(game, user) {
  inGame = false;
  game.players.forEach(function(player) {
    if(user.playerID == player.playerID) {
      inGame = true;
    }
  })
  return inGame;
}

isPlayerMove = function(game, user) {
  return game.players[game.currentPlayer].playerID == user.playerID;
}

advanceMove = function(game) {
  game.moveNumber++
}

advanceHand = function(userDict, game) {
  game.currentPlayerHand++
  // TODO handle all players not active
  while(
      !game.players[game.currentPlayer].active ||
      game.currentPlayerHand >= game.players[game.currentPlayer].hands.length
    ) {
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    game.currentPlayerHand = 0;
  }
  if(game.betting && game.players[game.currentPlayer].hands[game.currentPlayerHand].bet > 0) {
    game.betting = false;
  }
  if(!game.finished && game.players[game.currentPlayer].hands[game.currentPlayerHand].finished) {
    finishRound(userDict, game);
  }
}

handTotals = function(hand) {
  var totals = [];
  totals[0] = 0;
  for (var i = 0; i < hand.cards.length; i++ ) {
    var card = hand.cards[i];
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
  return totals.sort();
}

bestTotal = function(totals) {
  bestScore = 0;
  totals.forEach(function(total) {
    if(bestScore < total && total <= 21) {
      bestScore = total;
    }
  });
  return bestScore;
}

finishRound = function(userDict, game) {
  game.finished = true;
  do {
    dealCard(game, game.dealerHand);
    totals = handTotals(game.dealerHand);
  } while (totals[0] < 17);
  if(21 < totals[0]) {
    game.dealerHand.busted = true;
  }
  bestDealerTotal = bestTotal(game.dealerHand);
  game.players.forEach(function(player) {
    user = userDict[player.playerID];
    player.hands.forEach(function(hand) {
      if(!hand.busted) {
        handBestTotal = bestTotal(handTotals(hand));
        if(game.dealerHand.busted || dealerBestTotal < handBestTotal) {
          user.money += bet * 2;
        } else if (dealerBestTotal == handBestTotal) {
          user.money += bet;
        }
      }
    });
    if(user.money == 0) {
      user.numLoses++;
    }
    syncMoney(user, player);
  });
}

currentPlayerStay = function(userDict, game) {
  currentPlayer = game.players[game.currentPlayer];
  if(game.betting) {
    return false;
  }
  currentPlayer.hands[game.currentPlayerHand].finished = true;
  advanceMove(game);
  advanceHand(userDict, game);
  return true;
}

currentPlayerBet = function(userDict, game, amount) {
  currentPlayer = game.players[game.currentPlayer];
  user = userDict[currentPlayer.playerID];
  if(amount <= 0 || user.money < amount ||
      !game.betting) {
    return false;
  }
  user.money -= amount;
  syncMoney(user, currentPlayer);
  currentPlayer.hands[game.currentPlayerHand].bet = amount;
  advanceMove(game);
  advanceHand(userDict, game);
  return true;
}

currentPlayerHit = function(userDict, game) {
  currentPlayer = game.players[game.currentPlayer];
  if(game.betting) {
    return false;
  }
  hand = currentPlayer.hands[game.currentPlayerHand];
  dealCard(game, hand);
  totals = handTotals(hand);
  advanceMove(game);
  blackJack = 21 in totals;
  if(blackJack || 21 < totals[0]) {
    if(!blackJack) {
      hand.busted = true;
    }
    hand.finished = true;
    advanceHand(userDict, game);
  }
  return true;
}

exports.dealCard = dealCard;
exports.startNewRound = startNewRound;
exports.addPlayer = addPlayer;
exports.hasPlayer = hasPlayer;
exports.addQueuedPlayers = addQueuedPlayers;
exports.isPlayerMove = isPlayerMove;
exports.advanceHand = advanceHand;
exports.syncMoney = syncMoney;
exports.currentPlayerStay = currentPlayerStay;
exports.currentPlayerBet = currentPlayerBet;
exports.currentPlayerHit = currentPlayerHit;
