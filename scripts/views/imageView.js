const constants = require("scripts/utils/constants");

let FOOTER_HIDDEN;
let TIMER;
let ITEMS, INDEX;

function getSrc(type = "sample") {
  const item = ITEMS[INDEX];
  if (type === "sample") {
    return item.sampleUrl;
  } else {
    return item.data.file_url || item.data.jpeg_url;
  }
}

function startTimer() {
  TIMER = $timer.schedule({
    interval: $prefs.get("slideshow_intervals"),
    handler: () => {
      const newIndex = Math.min(INDEX + 1, ITEMS.length - 1);
      if (INDEX !== newIndex) {
        INDEX = newIndex;
        refresh();
      }
    }
  });
}

function stopTimer() {
  if (TIMER) TIMER.invalidate();
}

function definefooterView() {
  const footerView = {
    type: "view",
    props: {
      id: "footerView",
      bgcolor: $color("#f3f3f4")
    },
    views: [
      {
        type: "button",
        props: {
          id: "refresh",
          symbol: "arrow.counterclockwise",
          bgcolor: $color("clear")
        },
        layout: function(make, view) {
          make.size.equalTo($size(50, 50));
          make.centerY.equalTo(view.super);
          make.centerX.equalTo(view.super).dividedBy(2);
        },
        events: {
          tapped: function(sender) {}
        }
      },
      {
        type: "button",
        props: {
          id: "autoload",
          symbol: "forward",
          bgcolor: $color("clear"),
          info: {
            selected: false
          }
        },
        layout: function(make, view) {
          make.size.equalTo($size(50, 50));
          make.centerY.equalTo(view.super);
          make.centerX.equalTo(view.super);
        },
        events: {
          tapped: function(sender) {
            if (!sender.info.selected) {
              sender.info = {
                selected: true
              };
              sender.tintColor = $color("red");
              startTimer();
            } else {
              sender.info = {
                selected: false
              };
              sender.tintColor = undefined;
              stopTimer();
            }
          }
        }
      },
      {
        type: "button",
        props: {
          id: "setting",
          symbol: "gear",
          bgcolor: $color("clear")
        },
        layout: function(make, view) {
          make.size.equalTo($size(50, 50));
          make.centerY.equalTo(view.super);
          make.centerX.equalTo(view.super).dividedBy(2 / 3);
        },
        events: {
          tapped: async function(sender) {}
        }
      }
    ],
    layout: function(make, view) {
      make.bottom.inset(0);
      make.left.right.inset(0);
      make.height.equalTo(50);
    }
  };
  return footerView;
}

function defineEnhancedImageView() {
  const imageView = {
    type: "image",
    props: {
      contentMode: 1
    },
    layout: $layout.fill,
    events: {
      ready: function(sender) {
        refresh();
      }
    }
  };

  const contentView = {
    type: "view",
    props: {
      id: "contentView",
      userInteractionEnabled: true
    },
    events: {
      touchesEnded: function(sender, location, locations) {
        if (sender.super.zoomScale !== 1) {
          sender.super.zoomScale = 1;
        } else if (!FOOTER_HIDDEN) {
          FOOTER_HIDDEN = true;
          $("footerView").hidden = FOOTER_HIDDEN;
        } else {
          if (location.y <= 100 || sender.frame.height - 100 <= location.y) {
            FOOTER_HIDDEN = false;
            $("footerView").hidden = FOOTER_HIDDEN;
          } else if (
            100 < location.y &&
            location.y <= sender.frame.height - 100
          ) {
            const newIndex =
              location.y <= sender.frame.height / 2
                ? Math.max(INDEX - 1, 0)
                : Math.min(INDEX + 1, ITEMS.length - 1);
            if (INDEX !== newIndex) {
              INDEX = newIndex;
              refresh();
            }
          }
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
    views: [contentView]
  };

  const enhancedImageView = {
    props: {
      id: "enhancedImageView",
      bgcolor: $color("white")
    },
    views: [scroll],
    layout: function(make, view) {
      make.left.right.inset(0);
      make.top.bottom.inset(0);
    },
    events: {
      ready: async function(sender) {
        await $wait(0.1);
        sender.get("scroll").get("contentView").frame = $rect(
          0,
          0,
          sender.get("scroll").frame.width,
          sender.get("scroll").frame.height
        );
        sender
          .get("scroll")
          .get("contentView")
          .add(imageView);
      }
    }
  };
  return enhancedImageView;
}

function refresh() {
  const mpv = $ui.window.get("mpv");
  if (mpv.get("scroll").zoomScale !== 1) {
    mpv.get("scroll").zoomScale = 1;
  }
  mpv
    .get("scroll")
    .get("contentView")
    .get("image").src = getSrc();
  $ui.title = `${INDEX + 1} / ${ITEMS.length}`;
}

function init(items, index = 0) {
  FOOTER_HIDDEN = false;
  ITEMS = items;
  INDEX = index;
  const enhancedImageView = defineEnhancedImageView();
  const footerView = definefooterView();
  $ui.push({
    props: {
      title: `${INDEX + 1} / ${ITEMS.length}`,
      navButtons: [
        {
          symbol: "info.circle",
          handler: () => {}
        }
      ]
    },
    views: [
      {
        type: "view",
        props: {
          id: "mpv"
        },
        views: [enhancedImageView, footerView],
        layout: $layout.fillSafeArea
      }
    ],
    events: {
      layoutSubviews: async function(sender) {
        if (sender.get("mpv")) {
          const scroll = sender.get("mpv").get("scroll");
          await $wait(0.05);
          scroll.zoomScale = 1;
          sender
            .get("mpv")
            .get("scroll")
            .get("contentView").frame = $rect(
            0,
            0,
            scroll.size.width,
            scroll.size.height
          );
          scroll.zoomScale = 1;
        }
      }
    }
  });
}

module.exports = init;
