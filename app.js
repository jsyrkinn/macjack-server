
var Card = require('./models/card');
var Deck = require('./models/deck');
var Player = require('./models/player');
var Hand = require('./models/hand'); 
var Game = require('./models/game');



var game = new Game();
game.addPlayer('Judy', 33);
game.addPlayer('Jamey', 81);
game.addPlayer('Ingrid', 17);

game.players[0].hands[0] = new Hand(game.deck);
game.players[0].hands[0].addNewCard();
game.players[0].hands[0].addNewCard();

console.log(game.players[0].hands[0].cards);
console.log(game.players[0].hands[0].sumTotal());
game.players[0].placeBet(50);
console.log(game.players[0].hands[0].bet);


var server = require('http').createServer();
var io = require('socket.io')(server);



//server.listen(8080);
