const BaseView = require("../components/baseView");

class ImageView extends BaseView {
  constructor({ src, layout, upEvent, downEvent }) {
    super();
    this._src = src;
    this.layout = layout;
    this.upEvent = upEvent;
    this.downEvent = downEvent;
    this.prepared = false;
  }

  _defineView() {
    const image = {
      type: "image",
      props: {
        id: "image",
        src: this._src,
        contentMode: 1
      },
      layout: $layout.fill
    };

    const content = {
      type: "view",
      props: {
        id: "content",
        userInteractionEnabled: true
      },
      events: {
        touchesEnded: (sender, location, locations) => {
          if (sender.super.zoomScale !== 1) {
            sender.super.zoomScale = 1;
            return;
          }
          if (location.y <= sender.frame.height / 2) {
            if (this.upEvent) this.upEvent();
          } else {
            if (this.downEvent) this.downEvent();
          }
        }
      }
    };

    const scroll = {
      type: "scroll",
      props: {
        id: "scroll",
        bgcolor: $("clear"),
        zoomEnabled: true,
        doubleTapToZoom: false,
        maxZoomScale: 3
      },
      layout: $layout.fill,
      views: [content]
    };

    const enhancedImageView = {
      props: {
        id: this.id,
        bgcolor: $color("backgroundColor")
      },
      views: [scroll],
      layout: this.layout,
      events: {
        ready: async sender => {
          await $wait(0.1);
          sender.get("content").frame = $rect(
            0,
            0,
            sender.get("scroll").frame.width,
            sender.get("scroll").frame.height
          );
          sender.get("content").add(image);
          this.prepared = true;
        }
      }
    };
    return enhancedImageView;
  }

  set src(src) {
    this._src = src;
    if (this.view.get("scroll").zoomScale !== 1) {
      this.view.get("scroll").zoomScale = 1;
    }
    this.view.get("content").get("image").src = src;
  }

  get image() {
    return this.view.get("content").get("image").image;
  }
}

module.exports = ImageView;
