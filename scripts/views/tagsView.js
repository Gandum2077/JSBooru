const BaseView = require("../components/baseView");
const SearchBar = require("./searchBar");
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
    const classThis = this;
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
        make.left.right.equalTo(0);
        make.top.equalTo(view.prev.bottom).inset(1);
        make.height.equalTo(44);
      },
      events: {
        changed: sender => {
          classThis.changedEvent(sender);
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
  constructor({ searchEvent }) {
    super();
    this.searchEvent = searchEvent;
  }

  _defineView() {
    const classThis = this;
    return {
      type: "list",
      props: {
        id: this.id,
        style: 2,
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
        }
      },
      layout: (make, view) => {
        make.left.right.bottom.inset(0);
        make.top.equalTo(view.prev.bottom);
      },
      events: {
        didSelect: (sender, indexPath, data) => {
          const name = classThis._rawData[indexPath.item].name;
          classThis.searchEvent(name);
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
    const classThis = this;
    this.searchBar = new SearchBar({
      placeholder: $l10n("SEARCH"),
      useAccessoryView: false,
      layout: (make, view) => {
        make.top.inset(1);
        make.left.right.inset(5);
        make.height.equalTo(35);
      },
      changedEvent: text => classThis.reload()
    });
    this.menu = new Menu({
      items: [...FIXED_ITEMS, ...constants.userConfig.tag_categoires],
      changedEvent: text => classThis.reload()
    });
    this.listView = new ListView({ searchEvent: this.searchEvent });
    return {
      type: "view",
      props: {
        id: this.id,
        bgcolor: $color("primarySurface")
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
