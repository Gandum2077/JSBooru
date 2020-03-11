/**
 * 本模块用以呼出一个pageSheet
 * 常用参数：
 *   view  view定义，无需layout，必然被自动替换为覆盖整个sheet的layout
 *   doneEvent 点击左上角完成按钮后执行的事件，其参数sender代表上面参数view的上层view，其返回值会传递给this.result
 *   title 标题
 * 本模块的限制：
 *   由于使用了全局变量来控制reject，因此如果使用promisify，每次使用都要新创建实例，而且只能有一个实例运行
 *
 */

let REJECT;
let DONE = false;

const UIModalPresentationStyle = {
  automatic: -2,
  pageSheet: 1,
  formSheet: 2,
  fullScreen: 0,
  currentContext: 3,
  custom: 4,
  overFullScreen: 5,
  overCurrentContext: 6,
  popover: 7,
  none: -1
};

$define({
  type: "PSViewController: UIViewController",
  events: {
    "viewDidDisappear:": function() {
      if (!DONE && REJECT) REJECT("cancel");
    }
  }
});

class Sheet {
  constructor({
    view,
    doneEvent,
    title = "",
    presentMode = UIModalPresentationStyle.pageSheet,
    bgcolor = $color("white"),
    navBarHidden = false,
    customButton
  } = {}) {
    REJECT = undefined;
    DONE = false;
    this.title = title;
    this.navBarHidden = navBarHidden;
    this.customButton = customButton
    this.PSViewController = $objc("PSViewController").invoke("alloc.init");
    this.PSViewControllerView = this.PSViewController.$view();
    this.PSViewControllerView.$setBackgroundColor(bgcolor);
    this.PSViewController.$setModalPresentationStyle(presentMode);
    if (view) this.add(view, doneEvent);
    if (!navBarHidden) this._add(this.defineNavBar());
  }

  _add(view) {
    this.PSViewControllerView.jsValue().add(view);
  }

  add(view, doneEvent) {
    if (!this.view) {
      view.layout = this.navBarHidden
        ? $layout.fill
        : (make, view) => {
            make.top.inset(50);
            make.left.right.bottom.inset(0);
          };
      this.view = view;
      this._add(view);
      this.doneEvent = doneEvent;
    } else {
      throw new Error("can not add another view");
    }
  }

  present() {
    $ui.vc
      .ocValue()
      .invoke(
        "presentModalViewController:animated",
        this.PSViewController,
        true
      );
  }

  dismiss() {
    this.PSViewController.invoke("dismissModalViewControllerAnimated", true);
  }

  promisify(resolve, reject) {
    this.resolve = resolve;
    REJECT = reject;
  }

  done(sender) {
    DONE = true;
    if (this.doneEvent) this.result = this.doneEvent(sender.super.super);
    this.PSViewController.invoke("dismissModalViewControllerAnimated", true);
    this.resolve(this.result);
  }

  defineNavBar() {
    const closeButton = {
      type: "button",
      props: {
        radius: 0,
        bgcolor: $color("clear")
      },
      views: [
        {
          type: "image",
          props: {
            symbol: "xmark",
            tintColor: $color("white")
          },
          layout: function(make, view) {
            make.edges.insets($insets(5, 5, 5, 5));
          }
        }
      ],
      layout: function(make, view) {
        make.centerY.equalTo(view.super);
        make.size.equalTo($size(32, 32));
        make.left.inset(15);
      },
      events: {
        tapped: sender => this.dismiss()
      }
    };
    const titleLabel = {
      type: "label",
      props: {
        text: this.title,
        textColor: $color("white"),
        font: $font("bold", 17),
        align: $align.center
      },
      layout: function(make, view) {
        make.size.equalTo($size(300, 32));
        make.center.equalTo(view.super);
      }
    };
    const doneButton = {
      type: "button",
      props: {
        title: $l10n("DONE"),
        font: $font(17),
        radius: 0,
        titleColor: $color("white"),
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super);
        make.size.equalTo($size(50, 32));
        make.right.inset(15);
      },
      events: {
        tapped: sender => this.done(sender)
      }
    };
    const customButton = {
      type: "button",
      props: {
        radius: 0,
        bgcolor: $color("clear"),
        hidden: (this.customButton) ? false : true
      },
      views: [
        {
          type: "image",
          props: {
            symbol: this.customButton && this.customButton.symbol ? this.customButton.symbol : undefined,
            tintColor: $color("white")
          },
          layout: function(make, view) {
            make.edges.insets($insets(5, 5, 5, 5));
          }
        }
      ],
      layout: function(make, view) {
        make.centerY.equalTo(view.super);
        make.size.equalTo($size(32, 32));
        make.right.inset(80);
      },
      events: {
        tapped: sender => {
          if (this.customButton.handler) this.customButton.handler()
        } 
      }
    };
    const navBar = {
      type: "view",
      props: {
        bgcolor: $color("tint")
      },
      layout: (make, view) => {
        make.left.top.right.inset(0);
        make.height.equalTo(50);
      },
      views: [closeButton, titleLabel, doneButton, customButton]
    };
    return navBar;
  }
}

module.exports = Sheet;
