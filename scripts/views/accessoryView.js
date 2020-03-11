const BaseView = require("../components/baseView");

class AccessoryView extends BaseView {
  constructor({ textViewId }) {
    super();
    this.textViewId = textViewId;
  }

  _defineView() {
    const classThis = this;
    const matrix = {
      type: "matrix",
      props: {
        id: "matrix",
        keyboardDismissMode: 0,
        spacing: 5,
        direction: $scrollDirection.horizontal,
        bgcolor: $color("#eee"),
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
      layout: (make, view) => {
        make.left.top.bottom.inset(0);
        make.right.equalTo(view.prev.left);
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

        }
      }
    };
    const button = {
      type: "button",
      props: {
        id: "button",
        title: $l10n("More⤓"),
        font: $font("bold", 14),
        titleColor: $color("#333333"),
        bgcolor: $color("clear"),
        borderWidth: 0
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.right.inset(5);
        make.width.equalTo(60);
      },
      events: {
        tapped: sender => {
        }
      }
    };
    return {
      type: "view",
      props: {
        height: 44,
        bgcolor: $color("#eee"),
        borderWidth: 0.5,
        borderColor: $color("#ccc")
      },
      views: [button, matrix]
    };
  }

  _deactivate() {
    const textView = $(this.textViewId)
  }

  _activate() {
    const textView = $(this.textViewId)
  }
  
  initial() {
    const textView = $(this.textViewId)
  }
}

module.exports = AccessoryView;
