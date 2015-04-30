
var Player = require('../models/player');
var Card = require('../models/card');
var Hand = require('../models/hand');

updateTime = function(game) {
  game.lastMoveTime = Date.now();
}

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
  i = game.players.length;
  while(i--) {
    player = game.players[i];
    if(player.active) {
      player.hands = [new Hand()];
    } else {
      game.players.splice(i, 1);
    }
  }
  game.currentPlayer = 0;
  game.currentPlayerHand = 0;
  game.dealerHand = new Hand();
}

checkTimeouts = function(userDict, game) {
  if(!game.finished) {
    if(Date.now() - game.lastMoveTime > 120000) {
      // player timed out on their move
      game.players[game.currentPlayer].active = false;
      advanceMove(game);
      advanceHand(userDict, game);
    }
  } else {
    if(Date.now() - game.lastMoveTime > 120000) {
      // all in active players removed and new game started
      startNewRound(game);
    }
  }
}

continueToNextRound = function(game, user) {
  if(!game.finished) {
    return false;
  }
  //TODO check if player is in game
  game.players.forEach(function(player) {
    if(player.playerID == user.playerID) {
      player.active = true;
    }
  });
  return true;
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
  updateTime(game);
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
    dealFirstCards(game);
  }
  if(!game.finished && game.players[game.currentPlayer].hands[game.currentPlayerHand].finished) {
    finishRound(userDict, game);
  }
}

dealFirstCards = function(game) {
  game.betting = false;
  game.players.forEach(function(player) {
    var hand = player.hands[0];
    dealCard(game, hand);
    dealCard(game, hand);
  });
  dealCard(game, game.dealerHand);
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
    dealerTotals = handTotals(game.dealerHand);
  } while (dealerTotals[0] < 17);
  if(21 < dealerTotals[0]) {
    game.dealerHand.busted = true;
  }
  dealerBestTotal = bestTotal(dealerTotals);
  game.players.forEach(function(player) {
    user = userDict[player.playerID];
    player.hands.forEach(function(hand) {
      if(!hand.busted) {
        handBestTotal = bestTotal(handTotals(hand));
        if(game.dealerHand.busted || dealerBestTotal < handBestTotal) {
          user.money += hand.bet * 2;
        } else if (dealerBestTotal == handBestTotal) {
          user.money += hand.bet;
        }
      }
    });
    if(user.money == 0) {
      user.numLoses++;
    }
    syncMoney(user, player);
    player.active = false; // must send request before timeout to indicate they want to play the next round
  });
}

currentPlayerStay = function(userDict, game) {
  currentPlayer = game.players[game.currentPlayer];
  if(game.betting || game.finished) {
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
  if(amount <= 0 || user.money < amount || !game.betting || game.finished) {
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
  preTotals = handTotals(hand);
  blackJack = 21 in preTotals;
  currentPlayer = game.players[game.currentPlayer];
  if(game.betting || game.finished || blackJack) {
    return false;
  }
  hand = currentPlayer.hands[game.currentPlayerHand];
  dealCard(game, hand);
  totals = handTotals(hand);
  advanceMove(game);
  twentyOne = 21 in totals;
  if(twentyOne || 21 < totals[0]) {
    if(!twentyOne) {
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
exports.checkTimeouts = checkTimeouts;
exports.continueToNextRound = continueToNextRound;
exports.currentPlayerStay = currentPlayerStay;
exports.currentPlayerBet = currentPlayerBet;
exports.currentPlayerHit = currentPlayerHit;
