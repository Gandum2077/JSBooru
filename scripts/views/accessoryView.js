const BaseView = require("../components/baseView");
const constants = require("../utils/constants");

class AccessoryView extends BaseView {
  constructor({ textViewId }) {
    super();
    this.textViewId = textViewId;
  }

  _defineView() {
    const classThis = this;
    return {
      type: "matrix",
      props: {
        id: this.id,
        height: 44,
        bgcolor: $color("#eee"),
        borderWidth: 0.5,
        borderColor: $color("#ccc"),
        keyboardDismissMode: 0,
        spacing: 5,
        direction: $scrollDirection.horizontal,
        alwaysBounceVertical: false,
        showsHorizontalIndicator: false,
        template: {
          props: {},
          views: [
            {
              type: "label",
              props: {
                id: "label",
                font: $font("menlo", 13),
                borderWidth: 0.5,
                align: $align.center,
                bgcolor: $color("white"),
                textColor: $color("black"),
                radius: 5
              },
              layout: function(make, view) {
                make.center.equalTo(view.super);
                make.width.equalTo(view.super);
                make.height.equalTo(28);
              }
            }
          ]
        }
      },
      events: {
        itemSize: function(sender, indexPath) {
          const textWidth = $text.sizeThatFits({
            text: sender.data[indexPath.item].label.text,
            width: 1000,
            font: $font("menlo", 13),
            lineSpacing: 0
          }).width;
          const adjustedWidth = Math.min(Math.max(40, textWidth), 290) + 10;
          return $size(adjustedWidth, 32);
        },
        didSelect: function(sender, indexPath, data) {
          if (indexPath.item === 0) {
            $(classThis.textViewId).text = $clipboard.text;
          } else {
            $(classThis.textViewId).text = data.label.text;
          }
        }
      }
    };
  }

  initial() {
    this.view.data = ["剪贴板", ...constants.userConfig.search_history].map(
      n => {
        return {
          label: { text: n }
        };
      }
    );
  }
}

module.exports = AccessoryView;
