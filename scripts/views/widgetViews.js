const BaseView = require("../components/baseView");

class TopBar extends BaseView {
  constructor({ symbol, title, tapped, layout }) {
    super();
    this.symbol = symbol;
    this.title = title;
    this.tapped = tapped;
    this.layout = layout;
  }

  _defineView() {
    return {
      type: "view",
      props: {
        id: this.id
      },
      views: [
        {
          type: "image",
          props: {
            symbol: this.symbol,
            contentMode: 4
          },
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.left.inset(5);
            make.width.equalTo(view.height);
          }
        },
        {
          type: "label",
          props: {
            text: this.title,
            font: $font(17)
          },
          layout: (make, view) => {
            make.left.equalTo(view.prev.right).inset(5);
            make.top.bottom.inset(0);
            make.width.equalTo(150);
          }
        },
        {
          type: "button",
          props: {
            symbol: "arrow.2.circlepath",
            title: $l10n("REFRESH_WIDGET"),
            font: $font(17),
            titleColor: $color("primaryText"),
            bgcolor: $color("clear")
          },
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.right.inset(5);
          },
          events: {
            tapped: this.tapped
          }
        }
      ],
      layout: this.layout
    };
  }
}

class ThumbnailsView extends BaseView {
  constructor({ columns = 3, layout, events }) {
    super();
    this.columns = columns;
    this.layout = layout;
    this.events = events;
  }

  _defineView() {
    return {
      type: "matrix",
      props: {
        id: this.id,
        columns: this.columns,
        spacing: 3,
        scrollEnabled: false,
        square: true,
        template: {
          props: {
            bgcolor: $color("clear")
          },
          views: [
            {
              type: "image",
              props: {
                id: "image",
                contentMode: 2
              },
              layout: $layout.fill
            }
          ]
        }
      },
      layout: this.layout,
      events: this.events
    };
  }

  set urls(urls) {
    this.view.data = urls.map(n => {
      return { image: { src: n } };
    });
  }
}

class ImageView extends BaseView {
  constructor({ hidden = true, layout = $layout.fill, tapped }) {
    super();
    this._hidden = hidden;
    this.layout = layout;
    this.tapped = tapped;
  }

  _defineView() {
    return {
      type: "image",
      props: {
        id: this.id,
        hidden: this._hidden,
        userInteractionEnabled: true,
        contentMode: 1
      },
      layout: this.layout,
      events: {
        tapped: this.tapped
      }
    };
  }
}

class TipsLabel extends BaseView {
  constructor({ tips = $l10n("WIDGET_TIPS"), layout = $layout.fill } = {}) {
    super();
    this.tips = tips;
    this.layout = layout;
  }

  _defineView() {
    return {
      type: "label",
      props: {
        id: this.id,
        text: this.tips,
        hidden: true,
        align: $align.center,
        bgcolor: $color("clear"),
        textColor: $color("primaryText")
      },
      layout: this.layout
    };
  }
}

module.exports = {
  TopBar,
  ThumbnailsView,
  ImageView,
  TipsLabel
};
