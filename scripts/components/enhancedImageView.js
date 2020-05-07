/**
 * 此视图是为了加强imageView，实现以下目的：
 *   - 点击实现上下翻页
 *   - 双指放大缩小
 * 属性:
 *   - src 读写
 * 事件:
 *   - upperLocationTouched
 *   - lowerLocationTouched
 */

const BaseView = require("./baseView");

class EnhancedImageView extends BaseView {
  constructor({ props, layout, events = {} }) {
    super();
    this._props = { ...this.constructor.defaultProps, ...props };
    this._layout = layout;
    this._events = events;
    this.prepared = false;
    this._src = this._props.src;
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
      views: [image],
      events: {
        touchesEnded: (sender, location, locations) => {
          if (sender.super.zoomScale !== 1) {
            sender.super.zoomScale = 1;
            return;
          }
          if (location.y <= sender.frame.height / 2) {
            if (this._events.upperLocationTouched)
              this._events.upperLocationTouched();
          } else {
            if (this._events.lowerLocationTouched)
              this._events.lowerLocationTouched();
          }
        }
      }
    };
    const scroll = {
      type: "scroll",
      props: {
        id: "scroll",
        zoomEnabled: true,
        doubleTapToZoom: false,
        maxZoomScale: 2
      },
      layout: $layout.fill,
      views: [content],
      events: {
        ready: sender => {
          sender.get("content").frame = $rect(
            0,
            0,
            sender.frame.width,
            sender.frame.height
          );
          this.prepared = true;
        }
      }
    };
    return {
      type: "view",
      props: {
        ...this._props,
        id: this.id
      },
      views: [scroll],
      layout: this._layout,
      events: {
        layoutSubviews: sender => {
          if (!this.prepared) return;
          const scroll = sender.get("scroll");
          scroll.zoomScale = 1;
          sender.get("content").frame = $rect(
            0,
            0,
            sender.frame.width,
            sender.frame.height
          );
          scroll.zoomScale = 1;
        }
      }
    };
  }

  get src() {
    return this._src;
  }

  set src(src) {
    this._src = src;
    if (this.view.get("scroll").zoomScale !== 1) {
      this.view.get("scroll").zoomScale = 1;
    }
    this.view.get("image").src = src;
  }

  get image() {
    return this.view.get("image").image;
  }
}

EnhancedImageView.defaultProps = {};

module.exports = EnhancedImageView;
