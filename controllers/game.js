
var Player = require('../models/player');
var Card = require('../models/card');
var Hand = require('../models/hand');
var utils = require('./utils');

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
  var player = new Player(user.playerID, user.playerName);
  syncMoney(user, player);
  if(game.moveNumber == 0) {
    game.players.push(player);
    utils.log(game, utils.printPlayer(player) + " joined.");
  } else {
    game.joinQueue.push(player);
    utils.log(game, utils.printPlayer(player) + " added to queue.");
  }
}

addQueuedPlayers = function(game) {
  game.joinQueue.forEach(function(player){
    game.players.push(player);
  })
  game.joinQueue = [];
}

startNewRound = function(game) {
  game.betting = true;
  game.finished = false;
  game.moveNumber = 0;
  game.deck = [];
  ['Spades', 'Clubs', 'Hearts', 'Diamonds'].forEach(function(suit) {
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach(function(rank) {
        game.deck.push(new Card(rank, suit));
      });
  });
  addQueuedPlayers(game);
  var i = game.players.length;
  while(i--) {
    var player = game.players[i];
    if(player.active) {
      player.hands = [new Hand()];
    } else {
      game.players.splice(i, 1);
    }
  }
  game.currentPlayer = 0;
  game.currentPlayerHand = 0;
  game.dealerHand = new Hand();
  utils.log(game, "Started new round.");
}

checkTimeouts = function(userDict, game) {
  // TODO only gets called on state requests, consider alternatives.
  if(game.moveNumber == 0) {
    return; // shouldn't start until game starts
  }
  if(!game.finished) {
    if(Date.now() - game.lastMoveTime > 120000) {
      // player timed out on their move
      player = game.players[game.currentPlayer];
      player.active = false;
      advanceMove(game);
      utils.log(game, utils.printPlayer(player) + " timed out.");
      advanceHand(userDict, game);
    }
  } else {
    if(Date.now() - game.lastMoveTime > 20000) {
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
      utils.log(game, utils.printPlayer(player) + " continued.");
    }
  });
  return true;
}

hasPlayer = function(game, user) {
  var inGame = false;
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
  var originalPlayer = game.currentPlayer;
  var originalHand =
  game.currentPlayerHand++
  while(
      !game.players[game.currentPlayer].active ||
      game.currentPlayerHand >= game.players[game.currentPlayer].hands.length) {
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    game.currentPlayerHand = 0;
    if(game.currentPlayer == originalPlayer && !game.players[game.currentPlayer].active) {
      return startNewRound(game);   //all players are inactive
    }
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
  var bestScore = 0;
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
  var wins = 0;
  var ties = 0;
  var losses = 0;
  game.players.forEach(function(player) {
    var user = userDict[player.playerID];
    player.hands.forEach(function(hand) {
      if(!hand.busted) {
        var handBestTotal = bestTotal(handTotals(hand));
        if(game.dealerHand.busted || dealerBestTotal < handBestTotal) {
          user.money += hand.bet * 2;
          wins++;
        } else if (dealerBestTotal == handBestTotal) {
          user.money += hand.bet;
          ties++;
        } else {
          losses++;
        }
      } else {
        losses++;
      }
    });
    if(user.money == 0) {
      user.numLoses++;
    }
    syncMoney(user, player);
    player.active = false; // must send request before timeout to indicate they want to play the next round
  });
  utils.log(game, "Finished - W(" + wins + ") T(" + ties + ") L(" + losses + ").");
}

currentPlayerStay = function(userDict, game) {
  var currentPlayer = game.players[game.currentPlayer];
  if(game.betting || game.finished) {
    return false;
  }
  currentPlayer.hands[game.currentPlayerHand].finished = true;
  advanceMove(game);
  utils.log(game, utils.printPlayer(currentPlayer) + " stayed.");
  advanceHand(userDict, game);
  return true;
}

currentPlayerBet = function(userDict, game, amount) {
  currentPlayer = game.players[game.currentPlayer];
  var user = userDict[currentPlayer.playerID];
  if(amount <= 0 || user.money < amount || !game.betting || game.finished) {
    return false;
  }
  user.money -= amount;
  syncMoney(user, currentPlayer);
  currentPlayer.hands[game.currentPlayerHand].bet = amount;
  advanceMove(game);
  utils.log(game, utils.printPlayer(currentPlayer) + " bet $" + amount + ".");
  advanceHand(userDict, game);
  return true;
}

currentPlayerHit = function(userDict, game) {
  var currentPlayer = game.players[game.currentPlayer];
  var hand = currentPlayer.hands[game.currentPlayerHand];
  var preTotals = handTotals(hand);
  var blackJack = -1 < preTotals.indexOf(21);
  if(game.betting || game.finished || blackJack) {
    return false;
  }
  dealCard(game, hand);
  var totals = handTotals(hand);
  advanceMove(game);
  utils.log(game, utils.printPlayer(currentPlayer) + " hit.");
  var twentyOne = -1 < totals.indexOf(21);
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
