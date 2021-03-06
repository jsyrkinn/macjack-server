
var Player = require('../models/player');
var Card = require('../models/card');
var Hand = require('../models/hand');
var utils = require('./utils');

playerCap = 3;

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
  hand.cards.push(drawCard(game));
}

loseCheck = function(user) {
  if(user.money == 0) {
    user.numLosses++;
    user.money = 500;
  }
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
  loseCheck(user);
  syncMoney(user, player);
  if(game.moveNumber == 0 && game.players.length < playerCap) {
    game.players.push(player);
    utils.log(game, utils.printPlayer(player) + " joined.");
  } else {
    game.joinQueue.push(player);
    utils.log(game, utils.printPlayer(player) + " added to queue.");
  }
}

addQueuedPlayers = function(game) {
  while(0 < game.joinQueue.length && game.players.length < playerCap) {
    game.players.push(game.joinQueue.shift());
  }
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
    } else { //kick player because they didn't continue
      game.players.splice(i, 1);
      utils.log(game, utils.printPlayer(player) + " didn't continue, kicking.");
    }
  }
  game.currentPlayer = 0;
  game.currentPlayerHand = 0;
  game.dealerHand = new Hand();
  game.lastMoveTime = Date.now();
  utils.log(game, "Started new round.");
}

checkTimeouts = function(userDict, game) {
  // Only gets called on state requests, may cause unexecpected behavior if no one is polling game.
  var playerTimeoutTime = 300000;
  if(game.moveNumber == 0) {
    playerTimeoutTime *= 10; //player has ten times longer to move if the game hasn't started yet
  }
  if(!game.finished) {
    if((Date.now() - game.lastMoveTime) > playerTimeoutTime) {
      // player timed out on their move
      player = game.players[game.currentPlayer];
      game.players.splice(game.currentPlayer, 1);
      game.currentPlayer = game.currentPlayer % game.players.length;
      game.currentPlayerHand = 0;
      advanceMove(game);
      utils.log(game, utils.printPlayer(player) + " timed out.");
      checkPhases(userDict, game);
    }
  } else {
    if((Date.now() - game.lastMoveTime) > 300000) {
      // all inactive players removed and new game started
      startNewRound(game);
    }
  }
}

continueToNextRound = function(game, user) {
  if(!game.finished) {
    return false;
  }
  var allPlayersActive = true;
  game.players.forEach(function(player) {
    if(player.playerID == user.playerID) {
      player.active = true;
      utils.log(game, utils.printPlayer(player) + " continued.");
    }
    if(!player.active) {
      allPlayersActive = false;
    }
  });
  if(allPlayersActive) {
    // all players have continued, start new round immediately
    startNewRound(game);
  }
  return true;
}

hasPlayer = function(game, user) {
  var inGame = false;
  game.players.forEach(function(player) {
    if(user.playerID == player.playerID) {
      inGame = true;
    }
  });
  game.joinQueue.forEach(function(player) {
    if(user.playerID == player.playerID) {
      inGame = true;
    }
  });
  return inGame;
}

isPlayerMove = function(game, user) {
  return game.players[game.currentPlayer].playerID == user.playerID;
}

checkPhases = function(userDict, game) {
  if(game.players.length == 0) {
    //if all players left, start game over
    return startNewRound(game);
  }
  if(game.betting && game.players[game.currentPlayer].hands[game.currentPlayerHand].bet > 0) {
    //if bet is nonzero, that means the server has looped back to the first hand, and needs to move onto card dealing
    dealFirstCards(game);
  } else if (!game.finished && game.players[game.currentPlayer].hands[game.currentPlayerHand].finished) {
    //if hand is finshed, then the server has reached the end of the card phase and must process the end game
    finishRound(userDict, game);
  }
}

advanceMove = function(game) {
  game.moveNumber++
  updateTime(game);
}

advanceHand = function(userDict, game) {
  if(game.players.length == 0) {
    return startNewRound(game);
  }
  // future proofed function meant to handle players having mutliple hands after a split. UNTESTED
  game.currentPlayerHand++
  if(game.currentPlayerHand >= game.players[game.currentPlayer].hands.length) {
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    game.currentPlayerHand = 0;
  }
  checkPhases(userDict, game);
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
  totals = [0];
  hand.cards.forEach(function(card) {
    len = totals.length;
    value = card.rank < 10 ? card.rank : 10;
    for(i=0; i < len; ++i) {
      totals[i] += value;
      if(value == 1) {
        totals.push(totals[i] + 10);
      }
    }
  });
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
        // player busted
        losses++;
      }
    });
    loseCheck(user);
    syncMoney(user, player);
    utils.log(game, utils.printPlayer(player) + " now has $" + player.money);
    player.active = false; // must send continue request before timeout to indicate they want to play the next round
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
  // checks if player has 21 on first deal (blackjack), in which case they should not be able to hit
  var preTotals = handTotals(hand);
  var blackJack = -1 < preTotals.indexOf(21);
  if(game.betting || game.finished || blackJack) {
    return false;
  }
  dealCard(game, hand);
  var totals = handTotals(hand);
  advanceMove(game);
  var busted = 21 < totals[0];
  var twentyOne = -1 < totals.indexOf(21);
  utils.log(game, utils.printPlayer(currentPlayer) + " hit" + (busted ? " (busted)" : "") + ".");
  if(twentyOne || busted) {
    if(busted) {
      hand.busted = true;
    }
    //if player got 21 or they busted, automatically move on
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
