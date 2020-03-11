const BaseView = require("../components/baseView");

class PrefetchView extends BaseView {
  constructor({ layout } = {}) {
    super();
    this.layout = layout;
  }

  _defineView() {
    return {
      type: "matrix",
      props: {
        id: this.id,
        frame: $rect(0, 0, 96, 32),
        bgcolor: $color("clear"),
        spacing: 1,
        selectable: false,
        scrollEnabled: false,
        direction: $scrollDirection.horizontal,
        template: {
          views: [
            {
              type: "image",
              props: {
                id: "image",
                contentMode: 1,
                bgcolor: $color("clear")
              },
              layout: $layout.fill
            }
          ]
        }
      },
      events: {
        itemSize: (sender, indexPath) => {
          if (indexPath.item === 0) {
            return $size(30, 30);
          } else {
            return $size(15, 30);
          }
        }
      }
    };
  }

  set urls(urls) {
    this.view.data = urls.map(n => {
      return { image: { src: n } };
    });
  }
}

module.exports = PrefetchView;
