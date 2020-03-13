const Controller = require("./control/widget");

async function init() {
  const controller = new Controller();
  controller.render();
  controller.refresh();
}

module.exports = {
  init
};
