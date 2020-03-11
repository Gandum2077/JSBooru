const BaseView = require("../components/baseView");
const idManager = require("../utils/id");
const AccessoryView = require("./accessoryView");

class SearchBar extends BaseView {
  constructor({ placeholder, layout, useAccessoryView = true, changedEvent, searchEvent } = {}) {
    super();
    this.textViewId = idManager.newId;
    this.placeholder = placeholder;
    this.layout = layout;
    this.useAccessoryView = useAccessoryView;
    this.searchEvent = searchEvent;
    this.changedEvent = changedEvent;
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
        id: "image",
        bgcolor: $color("#f3f3f4")
      },
      views: [
        {
          type: "image",
          props: {
            tintColor: $color("darkGray"),
            symbol: "magnifyingglass"
          },
          layout: function(make, view) {
            make.edges.insets($insets(5, 5, 5, 5));
            make.center.equalTo(view.super);
          }
        }
      ],
      layout: function(make, view) {
        make.left.top.bottom.inset(0);
        make.width.equalTo(35);
      }
    };
    const button = {
      type: "label",
      props: {
        id: "button",
        radius: 0,
        bgcolor: $color("#f3f3f4"),
        text: $l10n("CANCEL"),
        textColor: $color("darkGray"),
        userInteractionEnabled: true,
        hidden: true,
        lines: 0,
        align: $align.center
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.right.inset(0);
        make.width.equalTo(70);
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
        bgcolor: $color("#f3f3f4"),
        radius: 0,
        accessoryView: this.useAccessoryView ? this.accessoryView.definition : undefined
      },
      layout: function(make, view) {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.prev.right);
        make.right.inset(0);
      },
      events: {
        changed: function(sender) {
          if (classThis.changedEvent) {
            classThis.changedEvent(sender.text)
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
            classThis.searchEvent(sender.text.trim().toLowerCase())
          }
        }
      }
    };
    const blur = {
      type: "blur",
      props: {
        id: this.id,
        style: 1,
        radius: 8,
        alpha: 1
      },
      views: [image, button, input],
      layout: this.layout,
      events: {
        ready: sender => {
          sender.alpha = 0.5;
        }
      }
    };
    return blur;
  }

  initial() {
    if (this.useAccessoryView) this.accessoryView.initial();
    this.view.get("button").hidden = true;
    $(this.textViewId).remakeLayout((make, view) => {
      make.top.bottom.inset(0);
      make.left.equalTo(view.prev.prev.right);
      make.right.inset(0);
    });
    this.blur()
    this.view.alpha = 0.5;
  }

  activate() {
    if (this.useAccessoryView) this.accessoryView.initial();
    $(this.textViewId).remakeLayout((make, view) => {
      make.top.bottom.inset(0);
      make.left.equalTo(view.prev.prev.right);
      make.right.equalTo(view.prev.left);
    });
    this.view.alpha = 1;
    this.view.get("button").hidden = false;
  }

  focus() {
    $(this.textViewId).focus();
  }

  blur() {
    $(this.textViewId).blur();
  }

  get text() {
    return $(this.textViewId).text;
  }
}

module.exports = SearchBar;
