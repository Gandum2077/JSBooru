const ImageView = require("../components/enhancedImageView");
const FooterStackView = require("../views/footerStackView");
const FooterBlur = require("../components/footerBlur");
const PrefetchView = require("../views/prefetchView");
const InfoView = require("../views/infoView");
const { ContentView, MaskView, Button, Label } = require("../views/views");
const database = require("../utils/database");
const constants = require("../utils/constants");

function cacheImage(image, filename) {
  const imagePath = constants.cachedImagePath;
  const fullpath = imagePath + "/" + filename;
  if ($file.exists(fullpath)) return;
  let scaledImage;
  const originSize = image.size;
  const scales = [originSize.height/300, originSize.width / 300]
  const max = Math.max(...scales)
  const min = Math.min(...scales)
  if (min < 1 && max < 2) {
    scaledImage = image
  } else if (max / min > 2) {
    scaledImage = $imagekit.scaleBy(image, 2 / max)
  } else {
    scaledImage = $imagekit.scaleBy(image, 1 / min)
  }
  $file.write({
    path: fullpath,
    data: scaledImage.png
  });
}

function deleteImage(filename) {
  const imagePath = constants.cachedImagePath;
  const fullpath = imagePath + "/" + filename;
  if (!$file.exists(fullpath)) return;
  $file.delete(fullpath);
}

class SubCotroller {
  constructor({ items, index, searchEvent }) {
    this.items = items;
    this._index = index;
    this.searchEvent = searchEvent;
    this.views = {};
    this._createdPermanentView();
  }

  _createdPermanentView() {
    this.views.main = new ContentView({
      bgcolor: $color("backgroundColor"),
      layout: $layout.fill
    });
    this.views.favoritedButton = new Button({
      symbol: "bookmark",
      tapped: sender => {
        const id = this.item.id;
        const site = this.item.booru.domain;
        const favorited = database.queryPostFavorited({ site, id });
        if (favorited) {
          database.deletePost({ site, id });
          this.views.favoritedButton.symbol = "bookmark";
          this.views.favoritedButton.tintColor = $color("primaryText");
          $delay(0.1, () => {
            const image = this.views.imageView.image;
            if (image && favorited)
              cacheImage(
                image,
                this.item.booru.domain + "_" + this.item.id + ".png"
              );
          });
        } else {
          database.insertPost({ info: this.item, favorited: true });
          this.views.favoritedButton.symbol = "bookmark.fill";
          this.views.favoritedButton.tintColor = $color("red");
          const image = this.views.imageView.image;
          deleteImage(this.item.booru.domain + "_" + this.item.id + ".png");
        }
      }
    });
    this.views.slideshowButton = new Button({
      symbol: "play",
      tapped: sender => {
        if (this.timer) {
          this.views.slideshowButton.symbol = "play";
          this.stopTimer();
        } else {
          this.views.slideshowButton.symbol = "pause";
          this.startTimer();
        }
      }
    });
    this.views.shareButton = new Button({
      symbol: "square.and.arrow.up",
      tapped: sender => {
        const image = this.views.imageView.image;
        if (image) $share.sheet(image);
      }
    });
    this.views.indexLabel = new Label();
    this.views.footerStackView = new FooterStackView({
      items: [
        this.views.favoritedButton.definition,
        this.views.slideshowButton.definition,
        this.views.shareButton.definition,
        this.views.indexLabel.definition
      ],
      layout: (make, view) => {
        make.top.inset(0);
        make.left.right.equalTo(view.super.safeArea).inset(20);
        make.height.equalTo(50);
      }
    });
    this.views.footBlur = new FooterBlur();
    this.views.imageView = new ImageView({
      layout: (make, view) => {
        make.top.inset(0);
        make.left.right.equalTo(view.super.safeArea);
        make.bottom.equalTo(view.prev.top);
      },
      events: {
        upperLocationTouched: () => {
          this.index -= 1;
          this.refresh();
        },
        lowerLocationTouched: () => {
          this.index += 1;
          this.refresh();
        }
      }
    });
    this.views.prefetchView = new PrefetchView({
      layout: (make, view) => {
        make.size.equalTo($size(150, 30));
        make.bottom.equalTo(view.super.bottom);
      }
    });
  }

  _defineNavButtons() {
    return [
      {
        symbol: "info.circle",
        handler: sender => {
          if (this.infoViewPresented) {
            this.removeInfoView();
          } else {
            this.presentInfoView();
          }
        }
      }
    ];
  }

  push() {
    $ui.push({
      props: {
        titleView: this.views.prefetchView.definition,
        navButtons: this._defineNavButtons()
      },
      views: [this.views.main.definition],
      events: {
        dealloc: () => this.stopTimer()
      }
    });
    $app.tips($l10n("READER_TIPS"));
    this.views.main.add(this.views.footBlur.definition);
    this.views.footBlur.add(this.views.footerStackView.definition);
    this.views.main.add(this.views.imageView.definition);
    $delay(0.3, () => this.refresh());
  }

  refresh() {
    const src = $prefs.get("orginal_image_first")
      ? this.item.fileUrl
      : this.item.sampleUrl;
    this.views.imageView.src = src;
    const id = this.item.id;
    const site = this.item.booru.domain;
    const favorited = database.queryPostFavorited({ site, id });
    if (favorited) {
      this.views.favoritedButton.symbol = "bookmark.fill";
      this.views.favoritedButton.tintColor = $color("red");
    } else {
      this.views.favoritedButton.symbol = "bookmark";
      this.views.favoritedButton.tintColor = $color("primaryText");
    }
    this.views.indexLabel.text = `${this.index + 1} / ${this.items.length}`;
    const prefetch = $prefs.get("prefetch") + 1;
    this.views.prefetchView.urls = [
      ...this.items
        .slice(this.index, prefetch + this.index)
        .map(n =>
          $prefs.get("orginal_image_first") ? n.fileUrl : n.sampleUrl
        ),
      ...this.items
        .slice(this.index + prefetch, 5 + this.index)
        .map(n => n.previewUrl)
    ];
    $delay(0.1, () => {
      const image = this.views.imageView.image;
      if (image && favorited)
        cacheImage(image, this.item.booru.domain + "_" + this.item.id + ".png");
    });
  }

  presentInfoView() {
    this.infoViewPresented = true;
    this.views.infoView = new InfoView({
      item: this.item,
      searchEvent: async text => {
        await this.searchEvent(text);
      }
    });
    this.views.maskView = new MaskView({
      tapped: sender => this.removeInfoView()
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
    this.timer = $timer.schedule({
      interval: $prefs.get("slideshow_intervals"),
      handler: () => {
        this.index += 1;
        this.refresh();
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
