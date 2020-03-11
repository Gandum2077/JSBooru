const ImageView = require("./views/imageView");
const FooterStackView = require("./views/footerStackView");
const InfoView = require("./views/infoView");
const { ContentView, MaskView, Button } = require("./views/views");
const database = require("./utils/database");

class SubCotroller {
  constructor({ items, index, searchEvent }) {
    this.items = items;
    this._index = index;
    this.searchEvent = searchEvent;
    this.views = {};
    this._createdPermanentView();
  }

  _createdPermanentView() {
    const classThis = this;
    this.views.main = new ContentView();
    this.views.favoritedButton = new Button({
      symbol: "bookmark",
      tapped: sender => {
        const id = classThis.item.id;
        const site = classThis.item.booru.domain;
        const favorited = database.queryPostFavorited({ site, id });
        if (favorited) {
          database.deletePost({ site, id });
          classThis.views.favoritedButton.symbol = "bookmark";
          classThis.views.favoritedButton.tintColor = $color("black");
        } else {
          database.insertPost({ info: classThis.item, favorited: true });
          classThis.views.favoritedButton.symbol = "bookmark.fill";
          classThis.views.favoritedButton.tintColor = $color("red");
        }
      }
    });
    this.views.slideshowButton = new Button({
      symbol: "play",
      tapped: sender => {
        if (classThis.timer) {
          classThis.views.slideshowButton.symbol = "play";
          classThis.stopTimer()
        } else {
          classThis.views.slideshowButton.symbol = "pause";
          classThis.startTimer()
        }
      }
    });
    this.views.shareButton = new Button({
      symbol: "square.and.arrow.up",
      tapped: sender => {
        const image = classThis.views.imageView.image
        if (image) $share.sheet(image);
      }
    });
    this.views.footerStackView = new FooterStackView({
      items: [
        this.views.favoritedButton.definition,
        this.views.slideshowButton.definition,
        this.views.shareButton.definition
      ]
    });
    this.views.imageView = new ImageView({
      layout: (make, view) => {
        make.left.top.right.inset(0);
        make.bottom.equalTo(view.prev.top);
      },
      upEvent: () => {
        classThis.index -= 1;
        classThis.refresh()
      },
      downEvent: () => {
        classThis.index += 1;
        classThis.refresh()
      }
    });
  }

  _defineNavButtons() {
    const classThis = this;
    return [
      {
        symbol: "info.circle",
        handler: sender => {
          if (classThis.infoViewPresented) {
            classThis.removeInfoView();
          } else {
            classThis.presentInfoView();
          }
        }
      }
    ];
  }

  push() {
    const classThis = this;
    $ui.push({
      props: {
        title: "",
        navButtons: this._defineNavButtons()
      },
      views: [this.views.main.definition],
      events: {
        layoutSubviews: sender => {
          if (!classThis.views.imageView.prepared) return;
          const scroll = classThis.views.imageView.view.get("scroll");
          $delay(0.05, function() {
            scroll.zoomScale = 1;
            sender.get("content").frame = $rect(
              0,
              0,
              scroll.size.width,
              scroll.size.height
            );
            scroll.zoomScale = 1;
          });
        },
        dealloc: function() {
          classThis.stopTimer()
        }
      }
    });
    $app.tips(
      "操作手势：两指放缩，点击上/下半部分可以前后翻页\n点击右上角图标可以查看图片信息和标签"
    );
    this.views.main.add(this.views.footerStackView.definition);
    this.views.main.add(this.views.imageView.definition);
    $delay(0.2, () => {
      classThis.refresh();
    });
  }

  refresh() {
    this.views.imageView.src = this.item.sampleUrl;
    const id = this.item.id;
    const site = this.item.booru.domain;
    const favorited = database.queryPostFavorited({ site, id });
    if (favorited) {
      this.views.favoritedButton.symbol = "bookmark.fill";
      this.views.favoritedButton.tintColor = $color("red");
    } else {
      this.views.favoritedButton.symbol = "bookmark";
      this.views.favoritedButton.tintColor = $color("black");
    }
    $ui.title = `${this.index + 1} / ${this.items.length}`;
  }

  presentInfoView() {
    const classThis = this;
    this.infoViewPresented = true;
    this.views.infoView = new InfoView({
      item: this.item,
      searchEvent: async text => {
        await classThis.searchEvent(text);
      }
    });
    this.views.maskView = new MaskView({
      tapped: sender => classThis.removeInfoView()
    });
    this.views.main.add(this.views.maskView.definition);
    this.views.main.add(this.views.infoView.definition);
  }

  removeInfoView() {
    this.infoViewPresented = false;
    this.views.maskView.view.remove();
    this.views.infoView.view.remove();
  }

  startTimer() {
    const classThis = this;
    this.timer = $timer.schedule({
      interval: $prefs.get("slideshow_intervals"),
      handler: () => {
        classThis.index += 1;
        classThis.refresh();
      }
    });
  }

  stopTimer() {
    if (this.timer) this.timer.invalidate();
    this.timer = undefined;
  }

  set index(index) {
    if (index < 0) {
      this._index = 0;
    } else if (index >= this.items.length) {
      this._index = this.items.length - 1;
    } else {
      this._index = index;
    }
  }

  get index() {
    return this._index;
  }

  get item() {
    return this.items[this.index];
  }
}

module.exports = SubCotroller;
