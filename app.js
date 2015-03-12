
var Card = require('./models/card');
var Deck = require('./models/deck');
var Player = require('./models/player');
var Hand = require('./models/hand'); 
var Game = require('./models/game');



var game = new Game();
game.addPlayer('Judy', 33);
game.addPlayer('Jamey', 81);
game.addPlayer('Ingrid', 17);



//var hand = new Hand();
//var deck = new Deck();

var server = require('http').createServer();
var io = require('socket.io')(server);



//server.listen(8080);
