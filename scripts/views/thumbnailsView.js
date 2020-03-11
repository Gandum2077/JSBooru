const BaseView = require("../components/baseView");

class ThumbnailsView extends BaseView {
  constructor({ columns = $device.isIpad ? 4 : 2, layout = $layout.fill, events } = {}) {
    super();
    this.columns = columns;
    this.layout = layout
    this.events = events
  }

  _defineView() {
    return {
      type: "matrix",
      props: {
        id: this.id,
        square: true,
        columns: this.columns,
        spacing: 5,
        bgcolor: $color("#333"),
        header: {
          type: "view",
          props: {
            height: 36,
            bgcolor: $color("clear")
          }
        },
        template: {
          props: {
            bgcolor: $color("clear")
          },
          views: [
            {
              type: "image",
              props: {
                id: "thumbnail",
                bgcolor: $color("#efeff4"),
                contentMode: 1
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

  set items(items) {
    this.view.data = items.map(n => {
      return {
        thumbnail: { src: n.previewUrl }
      };
    });
  }
}

module.exports = ThumbnailsView;
