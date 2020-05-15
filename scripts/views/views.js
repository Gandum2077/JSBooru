const BaseView = require("../components/baseView");

class ContentView extends BaseView {
  constructor({
    bgcolor = $color("primarySurface"),
    layout = $layout.fillSafeArea
  } = {}) {
    super();
    this.bgcolor = bgcolor;
    this.layout = layout;
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
    this.layout = layout;
    this.tapped = tapped;
  }

  _defineView() {
    return {
      props: {
        id: this.id,
        userInteractionEnabled: true,
        bgcolor: this.bgcolor
      },
      layout: this.layout,
      events: {
        tapped: sender => {
          if (this.tapped) this.tapped(sender);
        }
      }
    };
  }
}

class Button extends BaseView {
  constructor({ symbol, tapped }) {
    super();
    this._symbol = symbol;
    this.tapped = tapped;
  }

  _defineView() {
    return {
      type: "button",
      props: {
        id: this.id,
        radius: 0,
        bgcolor: $color("clear")
      },
      events: {
        tapped: this.tapped
      },
      views: [
        {
          type: "image",
          props: {
            id: "image",
            symbol: this._symbol,
            tintColor: $color("primaryText"),
            contentMode: 1
          },
          layout: (make, view) => {
            make.top.bottom.inset(12.5);
            make.centerX.equalTo(view.super);
            make.width.equalTo(view.height);
          }
        }
      ]
    };
  }

  set tintColor(tintColor) {
    this.view.get("image").tintColor = tintColor;
  }

  set symbol(symbol) {
    this._symbol = symbol;
    this.view.get("image").symbol = symbol;
  }

  get symbol() {
    return this._symbol;
  }
}

class Label extends BaseView {
  constructor({ bgcolor = $color("clear"), layout } = {}) {
    super();
    this.bgcolor = bgcolor;
    this.layout = layout;
  }

  _defineView() {
    return {
      type: "label",
      props: {
        id: this.id,
        align: $align.center,
        font: $font("bold", 18),
        bgcolor: this.bgcolor
      },
      layout: this.layout
    };
  }

  set text(text) {
    this.view.text = text;
  }
}

module.exports = {
  ContentView,
  MaskView,
  Button,
  Label
};
