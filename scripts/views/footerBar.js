const BaseView = require("../components/baseView");
const colors = require("../utils/colors");

class FooterBar extends BaseView {
  constructor({
    items = [],
    index = 0,
    selectedSegmentTintColor = $color("tintColor"),
    defaultSegmentTintColor = colors.footBarDefaultSegmentColor,
    bgcolor = $color("secondarySurface"),
    layout = (make, view) => {
      make.left.right.bottom.equalTo(view.super.safeArea);
      make.height.equalTo(50);
    },
    events
  }) {
    super();
    this.items = items;
    this._index = index;
    this.selectedSegmentTintColor = selectedSegmentTintColor;
    this.defaultSegmentTintColor = defaultSegmentTintColor;
    this.bgcolor = bgcolor;
    this.layout = layout;
    this.events = events;
  }

  _defineView() {
    return {
      type: "matrix",
      props: {
        id: this.id,
        columns: this.items.length,
        itemHeight: 60,
        spacing: 1,
        scrollEnabled: false,
        bgcolor: this.bgcolor,
        template: [
          {
            type: "image",
            props: {
              id: "image",
              bgcolor: $color("clear")
            },
            layout: (make, view) => {
              make.centerX.equalTo(view.super);
              make.width.height.equalTo(25);
              make.top.inset(7);
            }
          },
          {
            type: "label",
            props: {
              id: "label",
              font: $font(10)
            },
            layout: (make, view) => {
              var preView = view.prev;
              make.centerX.equalTo(preView);
              make.bottom.inset(13);
            }
          }
        ],
        data: this._map(this.items),
        header: {
          props: {
            height: 0.5,
            bgcolor: $color("separatorColor")
          }
        }
      },
      layout: this.layout,
      events: {
        didSelect: async (sender, indexPath, data) => {
          this.index = indexPath.item;
          if (this.events.changed) {
            this.events.changed(indexPath.item);
          }
        }
      }
    };
  }

  _map(items) {
    return items.map(n => {
      return {
        image: {
          symbol: n.symbol,
          tintColor: this.defaultSegmentTintColor
        },
        label: {
          text: n.title,
          textColor: this.defaultSegmentTintColor
        }
      };
    });
  }

  get index() {
    return this._index;
  }

  set index(index) {
    this._index = index;
    const data = this.view.data;
    data.forEach((n, i) => {
      if (i === index) {
        n.label.textColor = this.selectedSegmentTintColor;
        n.image.tintColor = this.selectedSegmentTintColor;
      } else {
        n.label.textColor = this.defaultSegmentTintColor;
        n.image.tintColor = this.defaultSegmentTintColor;
      }
    });
    this.view.data = data;
  }
}

module.exports = FooterBar;
