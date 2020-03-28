const BaseView = require("../components/baseView");
const constants = require("../utils/constants");
const colors = require("../utils/colors");

class AccessoryView extends BaseView {
  constructor({ textViewId }) {
    super();
    this.textViewId = textViewId;
  }

  _defineView() {
    return {
      type: "matrix",
      props: {
        id: this.id,
        height: 44,
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
                align: $align.center,
                bgcolor: $color("secondarySurface"),
                radius: 5
              },
              layout: (make, view) => {
                make.center.equalTo(view.super);
                make.width.equalTo(view.super);
                make.height.equalTo(28);
              }
            }
          ]
        }
      },
      events: {
        itemSize: (sender, indexPath) => {
          const textWidth = $text.sizeThatFits({
            text: sender.data[indexPath.item].label.text,
            width: 1000,
            font: $font("menlo", 13),
            lineSpacing: 0
          }).width;
          const adjustedWidth = Math.min(Math.max(40, textWidth), 290) + 10;
          return $size(adjustedWidth, 32);
        },
        didSelect: (sender, indexPath, data) => {
          if (indexPath.item === 0) {
            $(this.textViewId).text = $clipboard.text;
          } else {
            $(this.textViewId).text = data.label.text;
          }
        }
      }
    };
  }

  initial() {
    this.view.data = [
      $l10n("CLIPBOARD"),
      ...constants.userConfig.search_history
    ].map(n => {
      return {
        label: { text: n }
      };
    });
  }
}

module.exports = AccessoryView;
