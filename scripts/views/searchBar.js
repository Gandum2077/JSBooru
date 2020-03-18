const BaseView = require("../components/baseView");
const idManager = require("../utils/id");
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
    this.textViewId = idManager.newId;
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
    this.wrapperLayout1 = $layout.fill;
    this.wrapperLayout2 = (make, view) => {
      make.left.top.bottom.inset(0);
      make.right.equalTo(view.prev.left).inset(5);
    };
  }

  _defineView() {
    const classThis = this;
    this.accessoryView = this.useAccessoryView
      ? new AccessoryView({
          textViewId: this.textViewId
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
            tintColor: colors.searchSymbolColor,
            symbol: "magnifyingglass"
          },
          layout: function(make, view) {
            make.size.equalTo($size(20, 20));
            make.center.equalTo(view.super);
          }
        }
      ],
      layout: function(make, view) {
        make.top.bottom.inset(0);
        make.width.equalTo(20);
        make.left.inset(6);
      }
    };
    const button = {
      type: "label",
      props: {
        id: "button",
        radius: 0,
        bgcolor: $color("clear"),
        text: this.cancelText,
        textColor: $color("tintColor"),
        font: $font(17),
        userInteractionEnabled: true,
        hidden: true,
        lines: 0,
        align: $align.center
        //autoFontSize: true
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.right.inset(0);
        make.width.equalTo(classThis.buttonWidth);
      },
      events: {
        tapped: sender => classThis.blur()
      }
    };

    const input = {
      type: "input",
      props: {
        id: this.textViewId,
        type: $kbType.search,
        placeholder: this.placeholder,
        bgcolor: $color("clear"),
        radius: 0,
        accessoryView: this.useAccessoryView
          ? this.accessoryView.definition
          : undefined
      },
      layout: function(make, view) {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right);
        make.right.inset(0);
      },
      events: {
        changed: function(sender) {
          if (classThis.changedEvent) {
            classThis.changedEvent(sender.text);
          }
        },
        didBeginEditing: function(sender) {
          classThis.activate();
        },
        didEndEditing: function(sender) {
          classThis.initial();
          sender.blur();
        },
        returned: async function(sender) {
          sender.blur();
          if (classThis.searchEvent) {
            classThis.searchEvent(sender.text.trim().toLowerCase());
          }
        }
      }
    };
    const symbolInputWrapper = {
      type: "view",
      props: {
        id: "wrapper",
        bgcolor: colors.searchInputColor,
        radius: 8
      },
      views: [image, input],
      layout: this.wrapperLayout1
    };
    const view = {
      type: "view",
      props: {
        id: this.id
      },
      views: [button, symbolInputWrapper],
      layout: this.layout
    };
    return view;
  }

  initial() {
    if (this.useAccessoryView) this.accessoryView.initial();
    this.view.get("button").hidden = true;
    const wrapper = this.view.get("wrapper");
    wrapper.remakeLayout(this.wrapperLayout1);
    $ui.animate({
      duration: 0.2,
      animation: () => {
        wrapper.relayout();
      }
    });
    this.blur();
  }

  activate() {
    const classThis = this;
    if (this.useAccessoryView) this.accessoryView.initial();
    const wrapper = this.view.get("wrapper");
    wrapper.remakeLayout(this.wrapperLayout2);
    $ui.animate({
      duration: 0.2,
      animation: () => {
        wrapper.relayout();
      },
      completion: () => {
        classThis.view.get("button").hidden = false;
      }
    });
  }

  focus() {
    $(this.textViewId).focus();
  }

  blur() {
    $(this.textViewId).blur();
  }

  set text(text) {
    $(this.textViewId).text = text;
  }

  get text() {
    return $(this.textViewId).text;
  }
}

module.exports = SearchBar;
