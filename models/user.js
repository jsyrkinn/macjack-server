
function User(playerID, name) {
  this.playerID = playerID;
  this.playerName = name;
  this.money = 2000;
  this.numLoses = 0;
  this.inGame = false;
}

module.exports = User;
