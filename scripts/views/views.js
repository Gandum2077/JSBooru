const BaseView = require("../components/baseView");


class ContentView extends BaseView {
  constructor({
    bgcolor = $color("white"),
    layout = $layout.fill
  } = {}) {
    super();
    this.bgcolor = bgcolor;
    this.layout = layout
  }

  _defineView() {
    return {
      type: "view",
      props: {
        id: this.id,
        bgcolor: this.bgcolor
      },
      layout: this.layout
    };
  }
}

class MaskView extends BaseView {
  constructor({
    bgcolor = $rgba(0, 0, 0, 0.2),
    layout = $layout.fill,
    tapped
  } = {}) {
    super();
    this.bgcolor = bgcolor;
    this.layout = layout
    this.tapped = tapped
  }

  _defineView() {
    const classThis = this
    return {
      props: {
        id: this.id,
        userInteractionEnabled: true,
        bgcolor: this.bgcolor
      },
      layout: this.layout,
      events: {
        tapped: function(sender) {
          if (classThis.tapped) classThis.tapped(sender)
        }
      }
    };
  }
}

class Button extends BaseView {
  constructor({ symbol, tapped }) {
    super();
    this._symbol = symbol;
    this.tapped = tapped
  }

  _defineView() {
    return {
      type: "button",
      props: {
        id: this.id,
        bgcolor: $color("clear"),
      },
      views: [
        {
          type: "image",
          props: {
            id: "image",
            symbol: this._symbol,
            tintColor: $color("black"),
            contentMode: 1
          },
          layout: (make, view) => {
            make.top.bottom.inset(12.5)
            make.centerX.equalTo(view.super)
            make.width.equalTo(view.height)
          },
          events: {
            tapped: this.tapped
          }
        }
      ]
    }
  }

  set tintColor(tintColor) {
    this.view.get("image").tintColor = tintColor
  }

  set symbol(symbol) {
    this._symbol = symbol
    this.view.get("image").symbol = symbol
  }

  get symbol() {
    return this._symbol
  }
}

module.exports = {
  ContentView,
  MaskView,
  Button
}