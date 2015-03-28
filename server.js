
// var Card = require('./models/card');
// var Deck = require('./models/deck');
// var Player = require('./models/player');
// var Hand = require('./models/hand'); 
//var Game = require('./models/game');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/macjackdb');

var db = mongoose.connection;

var gameSchema = mongoose.Schema({
      name: String,
      id: Number,
      deck: [{suit: String, rank: Number}], // fix card situation
      players: [{
        name: String,
        id: Number,
        totalMoney: Number,
        hands: [{
          bet: Number,
          cards: [{suit: String, rank: Number}]
        }]
      }],
      currentPlayer: String,
      currentPlayerHand: Number
  });
  Game = mongoose.model('Game', gameSchema);

// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function(callback) {
//   var gameSchema = mongoose.Schema({
//       name: String,
//       id: Number,
//       deck: [{suit: String, rank: Number}], // fix card situation
//       players: [{
//         name: String,
//         id: Number,
//         totalMoney: Number,
//         hands: [{
//           bet: Number,
//           cards: [{suit: String, rank: Number}]
//         }]
//       }],
//       currentPlayer: String,
//       currentPlayerHand: Number
//   });
//   Game = mongoose.model('Game', gameSchema);
// });




// var game = new Game();
// game.addPlayer('Judy', 33);
// game.addPlayer('Jamey', 81);
// game.addPlayer('Ingrid', 17);

// game.players[0].hands[0] = new Hand(game.deck);
// game.players[0].hands[0].addNewCard();
// game.players[0].hands[0].addNewCard();

// console.log(game.players[0].hands[0].cards);
// console.log(game.players[0].hands[0].sumTotal());
// game.players[0].placeBet(50);

var server = require('http').createServer();