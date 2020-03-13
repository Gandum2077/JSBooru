const Controller = require("./widgetController");

async function init() {
  const controller = new Controller();
  controller.render();
  controller.refresh();
}

module.exports = {
  init
};
