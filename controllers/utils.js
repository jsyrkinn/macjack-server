
exports.hasID = function(authDict, playerID) {
  for (var code in authDict) {
    if(authDict.hasOwnProperty(code)) {
      if(authDict[code].playerID == playerID) {
        return true;
      }
    }
  }
  return false;
}
