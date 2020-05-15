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
        distribution: $stackViewDistribution.equalCentering,
        axis: $stackViewAxis.horizontal,
        alignment: $stackViewAlignment.fill,
        stack: {
          views: this.items
        }
      },
      layout: this.layout
    };
  }
}

module.exports = FooterStackView;
