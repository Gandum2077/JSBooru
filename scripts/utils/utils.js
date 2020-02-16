const constants = require("scripts/utils/constants");

function querySiteNameByIndex(idx) {
  const items = [
    "e621.net",
    "e926.net",
    "hypnohub.net",
    "danbooru.donmai.us",
    "konachan.com",
    "konachan.net",
    "yande.re",
    "gelbooru.com",
    "rule34.xxx",
    "safebooru.org",
    "tbib.org",
    "xbooru.com",
    "lolibooru.moe",
    "rule34.paheal.net",
    "derpibooru.org",
    "furry.booru.org",
    "realbooru.com"
  ];
  return items[idx];
}

function checkRandomSupport(site) {
  return constants.sitesConfig[site].random;
}

// 冻结屏幕，并播放动画，表示等待状态
// dirty work - 它要求整个应用中不能再有同id的view（即loadingView_bca2d7e3）
function startLoading(title) {
  if (!title) {
    title = "请等待……";
  }
  const titleView = {
    type: "label",
    props: {
      id: "titleView",
      text: title,
      align: $align.center,
      font: $font("bold", 17),
      bgcolor: $color("clear")
    },
    layout: function(make, view) {
      make.top.equalTo($("lottieView").bottom).inset(-50);
      make.centerX.equalTo($("lottieView"));
      make.size.equalTo($size(100, 20));
    }
  };

  const lottieView = {
    type: "lottie",
    props: {
      id: "lottieView",
      loop: true,
      src: "assets/icons/lottie_loading.json"
    },
    layout: (make, view) => {
      make.size.equalTo($size(200, 200));
      make.center.equalTo(view.super);
    },
    events: {
      ready: sender => sender.play()
    }
  };

  const maskView = {
    props: {
      bgcolor: $rgba(255, 255, 255, 0.5)
    },
    layout: $layout.fill
  };
  const loadingView = {
    props: {
      id: "loadingView_bca2d7e3"
    },
    views: [maskView, lottieView, titleView],
    layout: $layout.fillSafeArea
  };
  $ui.window.add(loadingView);
}

// 改变等待画面的标题
// dirty work - 它要求整个应用中不能再有同id的view（即loadingView_bca2d7e3）
function changeLoadingTitle(title) {
  $ui.window.get("loadingView_bca2d7e3").get("titleView").text = title;
}

// 结束等待
// dirty work - 它要求整个应用中不能再有同id的view（即loadingView_bca2d7e3）
function stopLoading() {
  if ($ui.window && $ui.window.get("loadingView_bca2d7e3")) {
    $ui.window.get("loadingView_bca2d7e3").remove();
  }
}

module.exports = {
  querySiteNameByIndex,
  checkRandomSupport,
  startLoading,
  stopLoading,
  changeLoadingTitle
};
