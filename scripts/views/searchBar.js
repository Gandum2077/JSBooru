const BaseView = require("../components/baseView");
const AccessoryView = require("./accessoryView");
const colors = require("../utils/colors");

class SearchBar extends BaseView {
  constructor({
    placeholder,
    layout,
    useAccessoryView = true,
    cancelText = $l10n("CANCEL"),
    changedEvent,
    searchEvent
  } = {}) {
    super();
    this.placeholder = placeholder;
    this.layout = layout;
    this.useAccessoryView = useAccessoryView;
    this.cancelText = cancelText;
    this.searchEvent = searchEvent;
    this.changedEvent = changedEvent;
    this.buttonWidth =
      $text.sizeThatFits({
        text: this.cancelText,
        width: 320,
        font: $font(17),
        lineSpacing: 0
      }).width + 3;
  }

  _defineView() {
    this.accessoryView = this.useAccessoryView
      ? new AccessoryView({
          selectEvent: text => this.text = text
        })
      : undefined;
    const image = {
      type: "view",
      props: {
        id: "image"
      },
      views: [
        {
          type: "image",
          props: {
            tintColor: colors.searchBarSymbolColor,
            symbol: "magnifyingglass"
          },
          layout: (make, view) => {
            make.size.equalTo($size(20, 20));
            make.center.equalTo(view.super);
          }
        }
      ],
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.width.equalTo(20);
        make.left.inset(6);
      }
    };
    const button = {
      type: "button",
      props: {
        id: "button",
        radius: 0,
        bgcolor: $color("clear"),
        title: this.cancelText,
        titleColor: $color("tintColor"),
        font: $font(17),
        alpha: 0
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.right.inset(10);
        make.width.equalTo(this.buttonWidth);
      },
      events: {
        tapped: sender => this.blur()
      }
    };

    const input = {
      type: "input",
      props: {
        id: "input",
        type: $kbType.search,
        placeholder: this.placeholder,
        bgcolor: $color("clear"),
        radius: 0,
        accessoryView: this.useAccessoryView
          ? this.accessoryView.definition
          : undefined
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.prev.right);
        make.right.equalTo(view.prev.left);
      },
      events: {
        changed: sender => {
          if (this.changedEvent) {
            this.changedEvent(sender.text);
          }
        },
        didBeginEditing: sender => this.activate(),
        didEndEditing: sender => this.initial(),
        returned: async sender => {
          sender.blur();
          if (this.searchEvent) {
            this.searchEvent(sender.text.trim().toLowerCase());
          }
        }
      }
    };
    const wrapper = {
      props: {
        bgcolor: colors.searchBarInputColor,
        radius: 8
      },
      views: [image, button, input],
      layout: $layout.fill
    };
    const view = {
      props: {
        id: this.id,
        alpha: 0.6,
        clipsToBounds: true
      },
      views: [wrapper],
      layout: this.layout
    };
    return view;
  }

  initial() {
    if (this.useAccessoryView) this.accessoryView.initial();
    this.view.alpha = 0.6;
    $ui.animate({
      duration: 0.2,
      animation: () => {
        this.view.get("button").alpha = 0;
      }
    });
    this.blur();
  }

  activate() {
    if (this.useAccessoryView) this.accessoryView.initial();
    this.view.alpha = 1;
    $ui.animate({
      duration: 0.2,
      animation: () => {
        this.view.get("button").alpha = 1;
      }
    });
  }

  focus() {
    this.view.get("input").focus();
  }

  blur() {
    this.view.get("input").blur();
  }

  set text(text) {
    this.view.get("input").text = text;
  }

  get text() {
    return this.view.get("input").text;
  }
}

module.exports = SearchBar;
