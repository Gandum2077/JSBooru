const idManager = require("../utils/id");

class BaseView {
  constructor() {
    this.id = idManager.newId;
  }

  get definition() {
    return this._defineView();
  }

  get created() {
    if (this._view) {
      return this._view;
    } else {
      this._view = $ui.create(this.definition);
      return this._view;
    }
  }

  get view() {
    if (this._view) {
      return this._view;
    } else {
      this._view = $(this.id);
      return this._view;
    }
  }

  add(view) {
    this.view.add(view);
  }

  moveToFront() {
    this.view.moveToFront();
  }

  moveToBack() {
    this.view.moveToBack();
  }
}

module.exports = BaseView;
