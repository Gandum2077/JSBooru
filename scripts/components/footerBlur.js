const BaseView = require("./baseView");

/**
 *  请注意本class需要指定height而非layout，自动规范layout以适配全面屏/非全面屏
 */
class FooterBar extends BaseView {
  constructor({ height = 50 } = {}) {
    super();
    this._height = height;
  }

  _defineView() {
    const line = {
      props: {
        id: "line",
        bgcolor: $color("separatorColor")
      },
      layout: (make, view) => {
        make.top.left.right.inset(0);
        make.height.equalTo(0.5);
      }
    };
    return {
      type: "blur",
      props: {
        id: this.id,
        style: 10
      },
      layout: (make, view) => {
        make.left.right.bottom.inset(0);
        make.top.equalTo(view.super.safeAreaBottom).inset(-this._height);
      },
      views: [line]
    };
  }

  add(view) {
    this.view.add(view);
    this.view.get("line").moveToFront();
  }
}

module.exports = FooterBar;
