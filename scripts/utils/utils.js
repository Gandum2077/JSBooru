const constants = require("./constants");

// 立即获得window size
function getWindowSize() {
  const window = $objc("UIWindow")
    .$keyWindow()
    .jsValue();
  return window.size;
}

function querySiteNameByIndex(index) {
  return constants.sitesConfig[index].name;
}

function checkRandomSupport(site) {
  return constants.sitesConfig.find(n => n.name === site).random;
}

module.exports = {
  getWindowSize,
  querySiteNameByIndex,
  checkRandomSupport
};
