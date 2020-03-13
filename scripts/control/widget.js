const database = require("../utils/database");
const { TopBar, ThumbnailsView, ImageView, TipsLabel } = require("../views/widgetViews");
const { ContentView } = require("../views/views");

class Controller {
  constructor() {
    this.views = {};
    this._createdPermanentView();
  }

  _createdPermanentView() {
    const classThis = this;
    this.views.main = new ContentView({ bgcolor: $color("clear") });
    this.views.topBar = new TopBar({
      symbol: "bookmark.fill",
      title: $l10n("FAVORITES"),
      tapped: sender => classThis.refresh(),
      layout: (make, view) => {
        make.top.left.right.inset(0);
        make.height.equalTo(30);
      }
    });
    this.views.thumbnailsView = new ThumbnailsView({
      layout: (make, view) => {
        make.top.equalTo(this.views.topBar.view.bottom).inset(5);
        make.left.right.bottom.inset(0);
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          classThis.expand(data.image.src)
        }
      }
    });
    this.views.imageView = new ImageView({
      hidden: true,
      tapped: sender => {
        classThis.collapse()
      }
    });
    this.views.tipsLabel = new TipsLabel()
  }

  render() {
    $ui.render({
      props: {
        navBarHidden: true
      },
      views: [this.views.main.definition]
    });
    this.views.main.add(this.views.topBar.definition);
    this.views.main.add(this.views.thumbnailsView.definition);
    this.views.main.add(this.views.imageView.definition);
    this.views.main.add(this.views.tipsLabel.definition);
  }

  refresh() {
    const urls = database
      .getRandomPost({limit: 3})
      .map(n =>
        $prefs.get("orginal_image_first") ? n.info.fileUrl : n.info.sampleUrl
      );
    if (urls.length) {
      this.views.thumbnailsView.urls = urls;
    } else {
      this.showTips()
    }
  }

  expand(src) {
    this.views.topBar.view.hidden = true
    this.views.thumbnailsView.view.hidden = true
    this.views.imageView.view.hidden = false
    this.views.imageView.view.src = src
  }

  collapse() {
    this.views.topBar.view.hidden = false
    this.views.thumbnailsView.view.hidden = false
    this.views.imageView.view.hidden = true
  }

  showTips() {
    this.views.topBar.view.hidden = true
    this.views.thumbnailsView.view.hidden = true
    this.views.imageView.view.hidden = true
    this.views.tipsLabel.view.hidden = false
  }
}

module.exports = Controller;
