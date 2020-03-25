const Sheet = require("../components/sheet");
const BaseView = require("../components/baseView");
const inputAlert = require("./inputAlert");

class ListView extends BaseView {
  constructor({
    items,
    allowRepeatable,
    addEnabled,
    addHandler,
    moveEnabled,
    moveHandler,
    renameEnabled,
    renameHandler,
    deleteEnabled,
    deleteHandler
  }) {
    super();
    this.items = items;
    this.allowRepeatable = allowRepeatable;
    this.addEnabled = addEnabled;
    this.addHandler = addHandler;
    this.moveEnabled = moveEnabled;
    this.moveHandler = moveHandler;
    this.renameEnabled = renameEnabled;
    this.renameHandler = renameHandler;
    this.deleteEnabled = deleteEnabled;
    this.deleteHandler = deleteHandler;
  }

  _defineView() {
    const classThis = this;
    const actions = []
    if (this.deleteEnabled) {
      actions.push({
        title: $l10n("REMOVE"),
        color: $color("red"),
        handler: function(sender, indexPath) {
          const data = sender.data
          const deletedItem = data[indexPath.item]
          data.splice(indexPath.item, 1)
          sender.data = data
          classThis.deleteHandler({deletedItem, index: indexPath.item, items: sender.data})
        }
      })
    }
    if (this.renameEnabled) {
      actions.push({
        title: $l10n("EDIT"),
        handler: async function(sender, indexPath) {
          const result = await inputAlert({ title: $l10n("EDIT") })
          if (!result) {
            $ui.error($l10n("INVALID_VALUE"));
            return
          }
          if (!classThis.allowRepeatable && sender.data.includes(result)) {
            $ui.error($l10n("DUPLICATE_VALUES"));
            return 
          } 
          const data = sender.data
          const oldItem = data[indexPath.item]
          data[indexPath.item] = result
          sender.data = data
          classThis.renameHandler({oldItem, newItem: result, index: indexPath.item, items: sender.data})
        }
      })
    }
    const list = {
      type: "list",
      props: {
        id: this.id,
        style: 2,
        selectable: false,
        data: this.items,
        reorder: this.moveEnabled,
        actions
      },
      events: {
        reorderFinished: function(data) {
          classThis.moveHandler({items: data})
        }
      }
    };
    return list;
  }

  get values() {
    return this.view.data
  }

  async insert() {
    const classThis = this;
    const result = await inputAlert({ title: $l10n("ADD") });
    if (!classThis.allowRepeatable && classThis.view.data.includes(result)) {
      $ui.error($l10n("DUPLICATE_VALUES"));
      return 
    } 
    classThis.view.insert({
      indexPath: $indexPath(0, 0),
      value: result
    });
    classThis.addHandler({addedItem: result, index: 0, items: classThis.view.data})
  }
}

function presentSheet({
  title,
  items,
  allowRepeatable,
  addEnabled,
  addHandler,
  moveEnabled,
  moveHandler,
  renameEnabled,
  renameHandler,
  deleteEnabled,
  deleteHandler,
  presentMode = 1
}) {
  const listView = new ListView({
    items,
    allowRepeatable,
    addEnabled,
    addHandler,
    moveEnabled,
    moveHandler,
    renameEnabled,
    renameHandler,
    deleteEnabled,
    deleteHandler
  });
  const sheet = new Sheet({
    title,
    presentMode,
    view: listView.definition,
    doneEvent: sender => listView.values,
    customButton: addEnabled
      ? {
          symbol: "plus",
          handler: async () => await listView.insert()
        }
      : undefined
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}

function listDialogs({
  title = "",
  items,
  allowRepeatable = false,
  addEnabled = true,
  addHandler = ({addedItem, index, items}) => {},
  moveEnabled = true,
  moveHandler = ({items}) => {},
  renameEnabled = true,
  renameHandler = ({oldItem, newItem, index, items}) => {},
  deleteEnabled = true,
  deleteHandler = ({deletedItem, index, items}) => {},
  presentMode
}) {
  if (!allowRepeatable && find_duplicate_in_array(items).length !== 0) {
    throw new Error("duplicate values in items");
  }
  if (presentMode === undefined) {
    presentMode = $device.isIpad ? 2 : 1;
  }
  return presentSheet({
    title,
    items,
    allowRepeatable,
    addEnabled,
    addHandler,
    moveEnabled,
    moveHandler,
    renameEnabled,
    renameHandler,
    deleteEnabled,
    deleteHandler,
    presentMode
  });
}

function find_duplicate_in_array(arra1) {
  const object = {};
  const result = [];

  arra1.forEach(item => {
    if (!object[item]) object[item] = 0;
    object[item] += 1;
  });

  for (const prop in object) {
    if (object[prop] >= 2) {
      result.push(prop);
    }
  }

  return result;
}

module.exports = listDialogs;
