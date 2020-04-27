const constants = require("./constants");

function querySiteNameByIndex(index) {
  return constants.sitesConfig[index].name;
}

function checkRandomSupport(site) {
  return constants.sitesConfig.find(n => n.name === site).random;
}

module.exports = {
  querySiteNameByIndex,
  checkRandomSupport
};
