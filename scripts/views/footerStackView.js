const BaseView = require("../components/baseView");

class FooterStackView extends BaseView {
  constructor({
    layout = (make, view) => {
      make.left.right.bottom.equalTo(view.super.safeArea);
      make.height.equalTo(50);
    },
    items
  } = {}) {
    super();
    this.layout = layout;
    this.items = items;
  }

  _defineView() {
    return {
      type: "stack",
      props: {
        id: this.id,
        spacing: 0,
        distribution: $stackViewDistribution.fillEqually,
        axis: $stackViewAxis.horizontal,
        stack: {
          views: this.items
        }
      },
      layout: this.layout
    };
  }
}

module.exports = FooterStackView;
