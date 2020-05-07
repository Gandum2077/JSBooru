const constants = require("../utils/constants");
const database = require("../utils/database");
const icloudManager = require("../utils/icloud");
const inputAlert = require("../dialogs/inputAlert");
const editListDialogs = require("../dialogs/editListDialogs");
const { ContentView } = require("../views/views");
const TabBar = require("../components/tabBar");
const ThumbnailsView = require("../views/thumbnailsView");
const SearchBar = require("../views/searchBar");
const AccessoryView = require("../views/accessoryView");
const TagsView = require("../views/tagsView");
const selectServers = require("../views/selectServers");
const addTag = require("../views/addTag");
const addCombination = require("../views/addCombination");
const {
  generatorForSite,
  generatorForFavorites
} = require("../booru/generator");
const { safeSearchFilter, nonauthorizedFilter } = require("../booru/filter");
const { checkRandomSupport } = require("../utils/utils");
const SubController = require("./reader");

class Controller {
  constructor({
    tabBarIndex = 0,
    booruSite = constants.sitesConfig[$prefs.get("default_site")].name
  } = {}) {
    this.views = {};
    this._createdPermanentView();
    this.tabBarIndex = tabBarIndex;
    this.booruInfo = {
      site: booruSite,
      tags: [],
      random: false,
      startPage: 1
    };
    this.favoritesInfo = {
      startPage: 1
    };
  }

  _createdPermanentView() {
    this.views.main = new ContentView({
      bgcolor: $color("backgroundColor"),
      layout: $layout.fill
    });
    this.views.tabBar = new TabBar({
      props: {
        items: [
          {
            symbol: "photo.fill",
            title: "Booru"
          },
          {
            symbol: "bookmark.fill",
            title: "Favorites"
          },
          {
            symbol: "tag.fill",
            title: "Tags"
          }
        ]
      },
      events: {
        changed: index => this.changeIndex(index)
      }
    });
    this.views.booruView = new ContentView({
      layout: (make, view) => {
        make.left.right.top.equalTo(view.super.safeArea);
        make.bottom.equalTo(this.views.tabBar.view.top);
      }
    });
    this.views.favoritesView = new ContentView({
      layout: (make, view) => {
        make.left.right.top.equalTo(view.super.safeArea);
        make.bottom.equalTo(this.views.tabBar.view.top);
      }
    });
    this.views.thumbnailsViewBooru = new ThumbnailsView({
      layout: $layout.fill,
      events: {
        itemSize: (sender, indexPath) => {
          const index = indexPath.item;
          const info = this.booruItems[index];
          const width = info.width;
          let height = info.height;
          if (height > width * 2) {
            height = width * 2;
          } else if (height < width / 2) {
            height = width / 2;
          }
          return $size(width, height);
        },
        pulled: async sender => {
          if (this.isLoading) {
            sender.endRefreshing();
            return;
          }
          await this.loadBooru({
            tags: this.booruInfo.tags,
            random: this.booruInfo.random,
            startPage: this.booruInfo.startPage
          });
          sender.endRefreshing();
        },
        willBeginDragging: sender => {
          this.views.searchBarBooru.initial();
        },
        didSelect: (sender, indexPath, data) => {
          const s = new SubController({
            items: this.booruItems,
            index: indexPath.item,
            searchEvent: async text => {
              await this.loadBooru({ tags: [text] });
            }
          });
          s.push();
        },
        didReachBottom: async sender => {
          if (this.isLoading) {
            sender.endFetchingMore();
            return;
          }
          const result = await this.generatorBooru.next();
          if (!result.done) {
            this.booruItems.push(...this._filter(result.value));
            this.views.thumbnailsViewBooru.items = this.booruItems;
          }
          sender.endFetchingMore();
        }
      }
    });
    this.views.thumbnailsViewFavorites = new ThumbnailsView({
      layout: $layout.fill,
      events: {
        itemSize: (sender, indexPath) => {
          const index = indexPath.item;
          const info = this.favoritesItems[index];
          const width = info.width;
          let height = info.height;
          if (height > width * 2) {
            height = width * 2;
          } else if (height < width / 2) {
            height = width / 2;
          }
          return $size(width, height);
        },
        pulled: async sender => {
          this.loadFavorites({
            tags: this.favoritesInfo.tags,
            startPage: 1
          });
          sender.endRefreshing();
        },
        willBeginDragging: sender => {
          this.views.searchBarFavorites.initial();
        },
        didSelect: (sender, indexPath, data) => {
          const s = new SubController({
            items: this.favoritesItems,
            index: indexPath.item,
            searchEvent: async text => {
              this.views.tabBar.index = 0;
              this.changeIndex(0);
              await this.loadBooru({ tags: [text] });
            }
          });
          s.push();
        },
        didReachBottom: async sender => {
          const result = this.generatorFavorites.next();
          if (!result.done) {
            this.favoritesItems.push(...result.value);
            this.views.thumbnailsViewFavorites.items = this.favoritesItems;
          }
          sender.endFetchingMore();
        }
      }
    });
    this.views.accessoryViewBooru = new AccessoryView({
      selectEvent: text => (this.views.searchBarBooru.text = text)
    });
    this.views.searchBarBooru = new SearchBar({
      placeholder: $l10n("SEARCH"),
      accessoryView: this.views.accessoryViewBooru,
      layout: (make, view) => {
        make.height.equalTo(36);
        make.left.right.equalTo(view.super.super).inset(10);
        make.top.greaterThanOrEqualTo(view.super.super).inset(1);
        make.top.equalTo(view.super.get("header")).inset(5);
      },
      searchEvent: async text => {
        if (!text) return;
        const tags = text.split(" ");
        if (!tags || !tags.length) return;
        await this.loadBooru({ tags });
      }
    });
    this.views.accessoryViewFavorites = new AccessoryView({
      selectEvent: text => (this.views.searchBarFavorites.text = text)
    });
    this.views.searchBarFavorites = new SearchBar({
      placeholder: $l10n("SEARCH"),
      accessoryView: this.views.accessoryViewFavorites,
      layout: (make, view) => {
        make.height.equalTo(36);
        make.left.right.equalTo(view.super.super).inset(10);
        make.top.greaterThanOrEqualTo(view.super.super).inset(1);
        make.top.equalTo(view.super.get("header")).inset(5);
      },
      searchEvent: text => {
        if (!text) return;
        const tags = text.split(" ");
        if (!tags || !tags.length) return;
        this.loadFavorites({ tags });
      }
    });
    this.views.tagsView = new TagsView({
      layout: (make, view) => {
        make.left.right.top.equalTo(view.super.safeArea);
        make.bottom.equalTo(this.views.tabBar.view.top);
      },
      searchEvent: async (text, type = "booru") => {
        if (type === "booru") {
          this.views.tabBar.index = 0;
          this.changeIndex(0);
          const tags = text.split(" ");
          if (!tags || !tags.length) return;
          await this.loadBooru({ tags });
        } else if (type === "favorites") {
          this.views.tabBar.index = 1;
          this.changeIndex(1);
          const tags = text.split(" ");
          if (!tags || !tags.length) return;
          this.loadFavorites({ tags });
        }
      }
    });
  }

  _defineNavBottons() {
    return [
      {
        symbol: "plus",
        handler: async sender => {
          switch (this.tabBarIndex) {
            case 0: {
              const { index } = await $ui.popover({
                sourceView: sender,
                sourceRect: sender.bounds,
                directions: $popoverDirection.up,
                size: $size(200, 44 * 5),
                items: [
                  $l10n("JUMP_TO_PAGE"),
                  $l10n("BROWSE_ALL"),
                  $l10n("RANDOM"),
                  $l10n("SERVERS"),
                  $l10n("SETTINGS")
                ]
              });
              switch (index) {
                case 0: {
                  if (this.isLoading) return;
                  let startPage = await inputAlert({
                    title: $l10n("JUMP_TO_PAGE"),
                    message:
                      $l10n("CURRENT_PAGE") + ": " + this.booruInfo.startPage
                  });
                  startPage = startPage.trim();
                  if (/^\d+$/.test(startPage) && parseInt(startPage) > 0) {
                    await this.loadBooru({
                      tags: this.booruInfo.tags,
                      random: this.booruInfo.random,
                      startPage: parseInt(startPage)
                    });
                  } else {
                    $ui.error($l10n("INVALID_VALUES"));
                  }
                  break;
                }
                case 1: {
                  await this.loadBooru();
                  break;
                }
                case 2: {
                  if (checkRandomSupport(this.booruInfo.site)) {
                    await this.loadBooru({ random: true });
                  } else {
                    $ui.error($l10n("RANDOM_SUPPORT_ERROR"));
                  }
                  break;
                }
                case 3: {
                  const newSite = await selectServers(this.booruInfo.site);
                  this.booruInfo.site = newSite;
                  await this.loadBooru();
                  $ui.title = newSite;
                  break;
                }
                case 4: {
                  await this.openPrefs();
                  break;
                }
                default:
                  break;
              }
              break;
            }
            case 1: {
              const { index } = await $ui.popover({
                sourceView: sender,
                sourceRect: sender.bounds,
                directions: $popoverDirection.up,
                size: $size(200, 44 * 3),
                items: [
                  $l10n("JUMP_TO_PAGE"),
                  $l10n("BROWSE_ALL"),
                  $l10n("SETTINGS")
                ]
              });
              switch (index) {
                case 0: {
                  let startPage = await inputAlert({
                    title: $l10n("JUMP_TO_PAGE"),
                    message:
                      $l10n("CURRENT_PAGE") +
                      ": " +
                      this.favoritesInfo.startPage
                  });
                  startPage = startPage.trim();
                  if (/^\d+$/.test(startPage) && parseInt(startPage) > 0) {
                    this.loadFavorites({
                      tags: this.favoritesInfo.tags,
                      startPage: parseInt(startPage)
                    });
                  } else {
                    $ui.error($l10n("INVALID_VALUES"));
                  }
                  break;
                }
                case 1: {
                  this.loadFavorites();
                  break;
                }
                case 2: {
                  await this.openPrefs();
                  break;
                }
                default:
                  break;
              }
              break;
            }
            case 2: {
              const { index } = await $ui.popover({
                sourceView: sender,
                sourceRect: sender.bounds,
                directions: $popoverDirection.up,
                size: $size(200, 44 * 4),
                items: [
                  $l10n("ADD_TAG"),
                  $l10n("ADD_COMBINATION"),
                  $l10n("MANAGE_CATEGORIES"),
                  $l10n("SETTINGS")
                ]
              });
              switch (index) {
                case 0: {
                  const { name, title, category, favorited } = await addTag({
                    name_editable: true
                  });
                  database.safeAddSavedTag({
                    name,
                    title,
                    category,
                    favorited
                  });
                  this.views.tagsView.reload(true);
                  break;
                }
                case 1: {
                  const result = await addCombination();
                  database.safeAddCombination(result);
                  this.views.tagsView.reload(true);
                  break;
                }
                case 2: {
                  const result = await editListDialogs({
                    title: $l10n("MANAGE_CATEGORIES"),
                    items: constants.userConfig.tag_categoires,
                    renameHandler: ({ oldItem, newItem, index, items }) => {
                      database.renameCategory(oldItem, newItem);
                    },
                    deleteHandler: ({ deletedItem, index, items }) => {
                      database.renameCategory(deletedItem, null);
                    }
                  });
                  constants.userConfig.saveTagCategoires(result);
                  this.views.tagsView.reloadAll();
                  break;
                }
                case 3: {
                  await this.openPrefs();
                  break;
                }
                default:
                  break;
              }
              break;
            }
            default:
              break;
          }
        }
      },
      {
        symbol: "questionmark.circle",
        handler: () => {
          $ui.push({
            props: {
              title: "README",
              navButtons: [
                {
                  symbol: "safari",
                  handler: () => {
                    $app.openURL($addin.current.website);
                  }
                }
              ]
            },
            views: [
              {
                type: "markdown",
                props: {
                  content: $file.read("README.md").string
                },
                layout: $layout.fillSafeArea
              }
            ]
          });
        }
      }
    ];
  }

  render() {
    $ui.render({
      props: {
        title: "",
        navButtons: this._defineNavBottons()
      },
      views: [this.views.main.definition]
    });
    this.views.main.add(this.views.tabBar.definition);
    this.views.main.add(this.views.tagsView.definition);
    this.views.main.add(this.views.favoritesView.definition);
    this.views.main.add(this.views.booruView.definition);
    this.views.booruView.add(this.views.thumbnailsViewBooru.definition);
    this.views.favoritesView.add(this.views.thumbnailsViewFavorites.definition);
    this.views.tabBar.index = this.tabBarIndex;
    this.changeIndex(this.tabBarIndex);
    $delay(0.1, () => {
      this.views.thumbnailsViewBooru.add(this.views.searchBarBooru.definition);
      this.views.thumbnailsViewFavorites.add(
        this.views.searchBarFavorites.definition
      );
    });
  }

  changeIndex(index) {
    this.tabBarIndex = index;
    switch (index) {
      case 0: {
        this.views.booruView.moveToFront();
        $ui.title = this.booruInfo.site;
        break;
      }
      case 1: {
        this.views.favoritesView.moveToFront();
        $ui.title = $l10n("FAVORITES");
        break;
      }
      case 2: {
        this.views.tagsView.moveToFront();
        $ui.title = $l10n("TAGS");
        this.views.tagsView.reload();
        break;
      }
      default:
        break;
    }
  }

  async loadBooru({
    tags = [],
    random = false,
    startPage = 1,
    useUiLoading = true
  } = {}) {
    this.views.thumbnailsViewBooru.items = [];
    this.booruItems = undefined;
    if (useUiLoading) $ui.loading(true);
    this.isLoading = true;
    console.info("loading");
    try {
      this.generatorBooru = generatorForSite({
        site: this.booruInfo.site,
        tags,
        random,
        startPage
      });
      const result = await this.generatorBooru.next();
      this.booruItems = this._filter(result.value);
      this.views.thumbnailsViewBooru.items = this.booruItems;
      this.views.thumbnailsViewBooru.view.scrollTo({
        indexPath: $indexPath(0, 0),
        animated: false
      });
      this.booruInfo.tags = tags;
      this.booruInfo.random = random;
      this.booruInfo.startPage = startPage;
      constants.userConfig.addSearchHistory(tags.join(" "));
      this.views.searchBarBooru.text = tags.join(" ");
      this.isLoading = false;
      if (useUiLoading) $ui.loading(false);
    } catch (e) {
      console.info(e);
      this.isLoading = false;
      if (useUiLoading) $ui.loading(false);
    }
  }

  loadFavorites({ tags = [], startPage = 1 } = {}) {
    this.views.thumbnailsViewFavorites.items = [];
    this.favoritesItems = undefined;
    this.generatorFavorites = generatorForFavorites({ tags, startPage });
    const result = this.generatorFavorites.next();
    this.favoritesItems = result.value;
    this.views.thumbnailsViewFavorites.items = this.favoritesItems;
    this.views.thumbnailsViewFavorites.view.scrollTo({
      indexPath: $indexPath(0, 0),
      animated: false
    });
    this.favoritesInfo.tags = tags;
    this.favoritesInfo.startPage = startPage;
    constants.userConfig.addSearchHistory(tags.join(" "));
    this.views.searchBarFavorites.text = tags.join(" ");
  }

  _filter(items) {
    if ($prefs.get("safe_search")) items = safeSearchFilter(items);
    if ($prefs.get("filter_nonauthorized_images"))
      items = nonauthorizedFilter(items);
    return items;
  }

  async openPrefs() {
    await $prefs.open(() => this.checkPrefs());
  }

  checkPrefs() {
    const intervals = $prefs.get("slideshow_intervals");
    if (intervals < 1 || intervals > 30) $prefs.set("slideshow_intervals", 5);
    const databaseSyncEnabled = $prefs.get("sync_database");
    if (!$file.exists(constants.databaseFileOnIcloud))
      icloudManager.copyDatabaseToIcloud();
    database.closeDB();
    database.databaseFile = databaseSyncEnabled
      ? constants.databaseFileOnIcloud
      : constants.databaseFile;
    database.openDB();
  }
}

module.exports = Controller;
