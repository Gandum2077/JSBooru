const Sheet = require("../components/sheet");
const BaseView = require("../components/baseView");

class ListView extends BaseView {
  constructor({ items = [], multiSelectEnabled = false, values }) {
    super();
    this.items = items;
    this.multiSelectEnabled = multiSelectEnabled;
    this._values = values;
  }

  _defineView() {
    const classThis = this;
    const list = {
      type: "list",
      props: {
        id: this.id,
        style: 2,
        data: this.items.map((n, i) => {
          if (typeof n === "string") {
            return {
              label: { text: n },
              image: { hidden: !this._values.includes(i) }
            };
          } else {
            return {
              label: n,
              image: { hidden: !this._values.includes(i) }
            };
          }
        }),
        template: {
          views: [
            {
              type: "label",
              props: {
                id: "label"
              },
              layout: (make, view) => {
                make.top.bottom.inset(0);
                make.left.inset(20);
                make.right.inset(50);
              }
            },
            {
              type: "image",
              props: {
                id: "image",
                symbol: "checkmark",
                contentMode: 1
              },
              layout: (make, view) => {
                make.top.bottom.right.inset(10);
                make.width.equalTo(30);
              }
            }
          ]
        }
      },
      events: {
        didSelect: function(sender, indexPath) {
          const data = sender.data;
          if (classThis.multiSelectEnabled) {
            data[indexPath.item].image.hidden = !data[indexPath.item].image
              .hidden;
          } else {
            data.forEach((n, i) => {
              n.image.hidden = i !== indexPath.item;
            });
          }
          sender.data = data;
        }
      }
    };
    return list;
  }

  get values() {
    const filtered = this.view.data
      .map((n, i) => (n.image.hidden ? -1 : i))
      .filter(n => n !== -1);
    if (this.multiSelectEnabled) return filtered;
    else return filtered[0];
  }
}

function presentSheet({
  title,
  items,
  multiSelectEnabled,
  values,
  presentMode = 1
}) {
  const listView = new ListView({ items, multiSelectEnabled, values });
  const sheet = new Sheet({
    title,
    presentMode,
    view: listView.definition,
    doneEvent: sender => listView.values
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}

function listDialogs({
  title = "",
  items,
  multiSelectEnabled = false,
  value = 0,
  values,
  presentMode
}) {
  if (!multiSelectEnabled) {
    values = [value];
  }
  if (presentMode === undefined) {
    presentMode = $device.isIpad ? 2 : 1;
  }
  return presentSheet({
    title,
    items,
    multiSelectEnabled,
    values,
    presentMode
  });
}

module.exports = listDialogs;
