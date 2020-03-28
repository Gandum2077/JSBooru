const BaseView = require("../components/baseView");
const SearchBar = require("./searchBar");
const addTag = require("./addTag");
const addCombination = require("./addCombination");
const database = require("../utils/database");
const constants = require("../utils/constants");
const colors = require("../utils/colors");

const FIXED_ITEMS = [
  $l10n("COMBINATIONS"),
  $l10n("FAVORITED"),
  $l10n("UNCATEGORIZED")
];

class Menu extends BaseView {
  constructor({ index = 0, items = FIXED_ITEMS, changedEvent } = {}) {
    super();
    this._items = items;
    this._index = index;
    this.changedEvent = changedEvent;
  }

  _defineView() {
    return {
      type: "menu",
      props: {
        id: this.id,
        segmentWidthStyle: 1,
        dynamicWidth: true,
        items: this._items,
        index: this._index
      },
      layout: (make, view) => {
        make.left.right.inset(10);
        make.top.equalTo(view.prev.bottom).inset(5);
        make.height.equalTo(44);
      },
      events: {
        changed: sender => {
          this.changedEvent(sender);
        }
      }
    };
  }

  get index() {
    return this.view.index;
  }

  set index(index) {
    this.view.index = index;
  }

  get currentItem() {
    return this.view.items[this.index];
  }

  set customItems(items) {
    this._items = [...FIXED_ITEMS, ...items];
    this.view.items = this._items;
  }

  get customItems() {
    return this._items.slice(3);
  }
}

class ListView extends BaseView {
  constructor({ searchEvent, reloadEvent, bgcolor }) {
    super();
    this.searchEvent = searchEvent;
    this.reloadEvent = reloadEvent;
    this.bgcolor = bgcolor;
  }

  _defineView() {
    return {
      type: "list",
      props: {
        id: this.id,
        bgcolor: this.bgcolor,
        template: {
          props: {
            bgcolor: $color("secondarySurface")
          },
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
                symbol: "star.fill",
                tintColor: colors.gold,
                contentMode: 1
              },
              layout: (make, view) => {
                make.top.bottom.right.inset(10);
                make.width.equalTo(30);
              }
            }
          ]
        },
        actions: [
          {
            title: $l10n("REMOVE"),
            color: $color("red"),
            handler: (sender, indexPath) => {
              const item = this._rawData[indexPath.item];
              if (item.hasOwnProperty("favorited")) {
                database.deleteSavedTag(item.name)
                this.reloadEvent()
              } else {
                database.deleteSavedCombination(item.name)
                this.reloadEvent()
              }
            }
          },
          {
            title: $l10n("EDIT"),
            handler: async (sender, indexPath) => {
              const item = this._rawData[indexPath.item];
              if (item.hasOwnProperty("favorited")) {
                const result = await addTag(item);
                database.safeAddSavedTag(result);
                this.reloadEvent()
              } else {
                const result = await addCombination(item);
                database.safeAddCombination(result);
                this.reloadEvent()
              }
            }
          }
        ]
      },
      layout: (make, view) => {
        make.left.right.inset(10);
        make.bottom.inset(0);
        make.top.equalTo(view.prev.bottom).inset(2);
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          const name = this._rawData[indexPath.item].name;
          this.searchEvent(name);
        },
        didLongPress: async (sender, indexPath, data) => {
          const item = this._rawData[indexPath.item];
          const type = item.hasOwnProperty("favorited") ? "savedTag" : "savedCombination"
          const totalHeight = $ui.window.frame.height;
          const positionY =
            sender.cell(indexPath).frame.y - sender.bounds.y;
          const directions =
            positionY > totalHeight / 2 && totalHeight - positionY < 300
              ? $popoverDirection.down
              : $popoverDirection.up;
          const items = [
            $l10n("SEARCH_ON_FAVORITES"),
            $l10n("COPY_TO_CLIPBOARD"),
            $l10n("ADD_TO_CLIPBOARD")
          ]
          if (type === "savedTag" && item.favorited) items.push($l10n("UNFAVORITE_THIS_TAG"))
          if (type === "savedTag" && !item.favorited) items.push($l10n("FAVORITE_THIS_TAG"))
          const { index } = await $ui.popover({
            sourceView: sender.cell(indexPath),
            sourceRect: sender.cell(indexPath).bounds,
            directions,
            size: $size(250, items.length * 44),
            items
          });
          switch (index) {
            case 0: {
              this.searchEvent(item.name, "favorites");
              break;
            }
            case 1: {
              $clipboard.text = item.name;
              break;
            }
            case 2: {
              const old_text = $clipboard.text;
              $clipboard.text = old_text.trim() + " " + item.name;
              break;
            }
            case 3: {
              if (item.favorited) {
                item.favorited = false
                database.safeAddSavedTag(item)
              } else {
                item.favorited = true
                database.safeAddSavedTag(item)
              }
              this.reloadEvent()
              break;
            }
            default:
              break;
          }
        }
      }
    };
  }

  set items(items) {
    const len = text => {
      if (!text) return 0;
      return text.length;
    };
    this._rawData = items;
    this.view.data = items.map(n => {
      return {
        label: {
          styledText: {
            text: `${n.title ? n.title + "  " : ""}${n.name}`,
            markdown: false,
            styles: [
              {
                range: $range(0, len(n.title)),
                font: $font(17),
                color: $color("primaryText")
              },
              {
                range: $range(n.title ? len(n.title) + 2 : 0, len(n.name)),
                color: $color("secondaryText"),
                font: $font(14),
                obliqueness: 0.3
              }
            ]
          }
        },
        image: {
          hidden: n.favorited ? false : true
        }
      };
    });
  }
}

class TagsView extends BaseView {
  constructor({ layout, searchEvent }) {
    super();
    this.layout = layout;
    this.searchEvent = searchEvent;
  }

  _defineView() {
    this.searchBar = new SearchBar({
      placeholder: $l10n("SEARCH"),
      useAccessoryView: false,
      layout: (make, view) => {
        make.top.inset(5);
        make.left.right.inset(10);
        make.height.equalTo(36);
      },
      changedEvent: text => this.reload()
    });
    this.menu = new Menu({
      items: [...FIXED_ITEMS, ...constants.userConfig.tag_categoires],
      changedEvent: text => this.reload()
    });
    this.listView = new ListView({
      searchEvent: this.searchEvent,
      reloadEvent: () => this.reload(),
      bgcolor: $color("backgroundColor")
    });
    return {
      type: "view",
      props: {
        id: this.id,
        bgcolor: $color("backgroundColor")
      },
      views: [
        this.searchBar.definition,
        this.menu.definition,
        this.listView.definition
      ],
      layout: this.layout
    };
  }

  _filter(data, keyword) {
    if (!data) return [];
    return keyword.length === 0
      ? data
      : data.filter(
          n =>
            n.name.includes(keyword) || (n.title && n.title.includes(keyword))
        );
  }

  reload() {
    const searchKeyword = this.searchBar.text.trim().toLowerCase();
    const menuIndex = this.menu.index;
    if (menuIndex === 0) {
      this.listView.items = this._filter(
        database.getAllSavedCombinations(),
        searchKeyword
      );
    } else if (menuIndex === 1) {
      this.listView.items = this._filter(
        database.getAllFavoritedSavedTags(),
        searchKeyword
      );
    } else if (menuIndex === 2) {
      this.listView.items = this._filter(
        database.getSavedTagsByCategory(null),
        searchKeyword
      );
    } else if (menuIndex > 2) {
      const category = this.menu.currentItem;
      this.listView.items = this._filter(
        database.getSavedTagsByCategory(category),
        searchKeyword
      );
    }
  }

  reloadAll() {
    this.menu.customItems = constants.userConfig.tag_categoires;
    this.menu.index = 0;
    this.reload();
  }
}

module.exports = TagsView;
