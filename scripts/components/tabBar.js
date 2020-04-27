/**
 * 本组件是为了仿制UITabBar
 * 本组件不能指定布局而是应该指定height（如果需要的话）
 * 典型的使用方式是指定items
 * props:
 *   - height: 50
 *   - items: [] // 每个子项有三个参数symbol、image、title
 *   - index: 0  // 读写
 *   - selectedSegmentTintColor: $color("tintColor")
 *   - defaultSegmentTintColor: colors.footBarDefaultSegmentColor
 *   - bgcolor: $color("secondarySurface")
 *
 * events:
 *   - changed: index => {}
 */

const BaseView = require("./baseView");
const colors = require("../utils/colors");
const { getWindowSize } = require("../utils/ui");

class Cell extends BaseView {
  constructor({
    symbol,
    image,
    text,
    index,
    selected,
    selectedSegmentTintColor,
    defaultSegmentTintColor,
    tapped
  }) {
    super();
    this._symbol = symbol;
    this._image = image;
    this._text = text;
    this._index = index;
    this._selected = selected;
    this._selectedSegmentTintColor = selectedSegmentTintColor;
    this._defaultSegmentTintColor = defaultSegmentTintColor;
    this._tapped = tapped;
    this.layouts = {
      image_tightened: (make, view) => {
        make.centerX.equalTo(view.super);
        make.size.equalTo($size(25, 25));
        make.top.inset(7);
      },
      label_tightened: (make, view) => {
        make.centerX.equalTo(view.super);
        make.top.equalTo(view.prev.bottom);
      },
      image_loosed: (make, view) => {
        make.centerX.equalTo(view.super).offset(-35);
        make.centerY.equalTo(view.super);
        make.size.equalTo($size(25, 25));
      },
      label_loosed: (make, view) => {
        make.left.equalTo(view.prev.right).inset(10);
        make.centerY.equalTo(view.super);
      }
    };
  }

  _defineView() {
    return {
      type: "view",
      props: {
        id: this.id,
        userInteractionEnabled: true
      },
      views: [
        {
          type: "image",
          props: {
            id: "image",
            symbol: this._symbol,
            image: this._image
          }
        },
        {
          type: "label",
          props: {
            id: "label",
            text: this._text,
            align: $align.center
          }
        }
      ],
      events: {
        tapped: sender => {
          if (this._tapped) this._tapped(this._index);
        }
      }
    };
  }

  set selected(selected) {
    this._selected = selected;
    const color = selected
      ? this._selectedSegmentTintColor
      : this._defaultSegmentTintColor;
    this.view.get("image").tintColor = color;
    this.view.get("label").textColor = color;
  }

  get selected() {
    return this._selected;
  }

  _useTightenedLayout() {
    this.view.get("image").remakeLayout(this.layouts.image_tightened);
    this.view.get("label").remakeLayout(this.layouts.label_tightened);
    this.view.get("label").font = $font(10);
  }

  _useLoosedLayout() {
    this.view.get("image").remakeLayout(this.layouts.image_loosed);
    this.view.get("label").remakeLayout(this.layouts.label_loosed);
    this.view.get("label").font = $font(14);
  }
}

class TabBar extends BaseView {
  constructor({ props, events = {} }) {
    super();
    this._props = { ...this.constructor.defaultProps, ...props };
    this._index = this._props.index;
    this._events = events;
  }

  _defineView() {
    this._cells = this._defineCells();
    const stack = {
      type: "stack",
      props: {
        axis: $stackViewAxis.horizontal,
        distribution: $stackViewDistribution.fillEqually,
        spacing: 0,
        stack: {
          views: this._cells.map(n => n.definition)
        }
      },
      layout: (make, view) => {
        make.height.equalTo(this._props.height - 0.5);
        make.left.right.equalTo(view.super.safeArea);
        make.top.equalTo(view.prev.bottom);
      }
    };
    const line = {
      props: {
        bgcolor: $color("separatorColor")
      },
      layout: (make, view) => {
        make.top.left.right.inset(0);
        make.height.equalTo(0.5);
      }
    };
    return {
      type: "blur",
      props: {
        id: this.id,
        style: 10
      },
      layout: (make, view) => {
        make.left.right.bottom.inset(0);
        make.top.equalTo(view.super.safeAreaBottom).inset(-this._props.height);
      },
      views: [line, stack],
      events: {
        ready: sender => (this.index = 0),
        layoutSubviews: sender => {
          const windowWidth = getWindowSize().width;
          if (windowWidth > 600) {
            this._useLoosedLayout();
          } else {
            this._useTightenedLayout();
          }
        }
      }
    };
  }

  _defineCells() {
    return this._props.items.map((n, i) => {
      return new Cell({
        symbol: n.symbol,
        image: n.image ? n.image.alwaysTemplate : undefined,
        text: n.title,
        index: i,
        selectedSegmentTintColor: this._props.selectedSegmentTintColor,
        defaultSegmentTintColor: this._props.defaultSegmentTintColor,
        tapped: index => {
          this.index = index;
          if (this._events.changed) this._events.changed(index);
        }
      });
    });
  }

  get index() {
    return this._index;
  }

  set index(index) {
    this._index = index;
    this._cells.forEach((n, i) => {
      n.selected = i === this._index;
    });
  }

  _useTightenedLayout() {
    this._cells.forEach(n => {
      n._useTightenedLayout();
    });
  }

  _useLoosedLayout() {
    this._cells.forEach(n => {
      n._useLoosedLayout();
    });
  }
}

TabBar.defaultProps = {
  height: 50,
  items: [],
  index: 0,
  selectedSegmentTintColor: $color("tintColor"),
  defaultSegmentTintColor: colors.footBarDefaultSegmentColor,
  bgcolor: $color("secondarySurface")
};

module.exports = TabBar;
