const constants = require("./utils/constants");
const database = require("./utils/database");
const inputAlert = require("./dialogs/inputAlert");
const editListDialogs = require("./dialogs/editListDialogs");
const { ContentView } = require("./views/views");
const FooterBar = require("./views/footerBar");
const ThumbnailsView = require("./views/thumbnailsView");
const SearchBar = require("./views/searchBar");
const TagsView = require("./views/tagsView");
const selectServers = require("./views/selectServers");
const addTag = require("./views/addTag");
const addCombination = require("./views/addCombination");
const {
  generatorForSite,
  generatorForFavorites
} = require("./booru/generator");
const { safeSearchFilter, nonauthorizedFilter } = require("./booru/filter");
const { checkRandomSupport } = require("./utils/utils");
const SubController = require("./subController");

class Controller {
  constructor({
    footerBarIndex = 0,
    booruSite = constants.sitesConfig[$prefs.get("default_site")].name
  } = {}) {
    this.views = {};
    this._createdPermanentView();
    this.footerBarIndex = footerBarIndex;
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
    const classThis = this;
    this.views.main = new ContentView();
    this.views.footerBar = new FooterBar({
      items: [
        ["photo.fill", "Booru"],
        ["bookmark.fill", "Favorites"],
        ["tag.fill", "Tags"]
      ].map(n => {
        return {
          image: { symbol: n[0] },
          label: { text: n[1] }
        };
      }),
      events: {
        changed: index => {
          classThis.changeIndex(index);
        }
      }
    });
    this.views.booruView = new ContentView({
      bgcolor: $color("#333"),
      layout: (make, view) => {
        make.left.right.top.inset(0);
        make.bottom.equalTo(this.views.footerBar.view.top);
      }
    });
    this.views.favoritesView = new ContentView({
      bgcolor: $color("#333"),
      layout: (make, view) => {
        make.left.right.top.inset(0);
        make.bottom.equalTo(this.views.footerBar.view.top);
      }
    });
    this.views.thumbnailsViewBooru = new ThumbnailsView({
      layout: (make, view) => {
        make.left.right.bottom.inset(0);
        make.top.inset(36);
      },
      events: {
        itemSize: function(sender, indexPath) {
          const index = indexPath.item;
          const info = classThis.booruItems[index];
          const width = info.width;
          let height = info.height;
          if (height > width * 2) {
            height = width * 2;
          } else if (height < width / 2) {
            height = width / 2;
          }
          return $size(width, height);
        },
        pulled: async function(sender) {
          if (classThis.isLoading) {
            sender.endRefreshing();
            return;
          }
          await classThis.loadBooru({
            tags: classThis.booruInfo.tags,
            random: classThis.booruInfo.random,
            startPage: classThis.booruInfo.startPage
          });
          sender.endRefreshing();
        },
        willBeginDragging: function(sender) {
          classThis.views.searchBarBooru.initial();
        },
        didSelect: function(sender, indexPath, data) {
          const s = new SubController({
            items: classThis.booruItems,
            index: indexPath.item,
            searchEvent: async text => {
              await classThis.loadBooru({ tags: [text] });
            }
          });
          s.push();
        },
        didReachBottom: async function(sender) {
          if (classThis.isLoading) {
            sender.endFetchingMore();
            return;
          }
          const result = await classThis.generatorBooru.next();
          if (!result.done) {
            classThis.booruItems.push(...classThis._filter(result.value));
            classThis.views.thumbnailsViewBooru.items = classThis.booruItems;
          }
          sender.endFetchingMore();
        }
      }
    });
    this.views.thumbnailsViewFavorites = new ThumbnailsView({
      layout: (make, view) => {
        make.left.right.bottom.inset(0);
        make.top.inset(36);
      },
      events: {
        itemSize: function(sender, indexPath) {
          const index = indexPath.item;
          const info = classThis.favoritesItems[index];
          const width = info.width;
          let height = info.height;
          if (height > width * 2) {
            height = width * 2;
          } else if (height < width / 2) {
            height = width / 2;
          }
          return $size(width, height);
        },
        pulled: async function(sender) {
          classThis.loadFavorites({
            startPage: classThis.favoritesInfo.startPage
          });
          sender.endRefreshing();
        },
        willBeginDragging: function(sender) {
          classThis.views.searchBarFavorites.initial();
        },
        didSelect: function(sender, indexPath, data) {
          const s = new SubController({
            items: classThis.favoritesItems,
            index: indexPath.item,
            searchEvent: async text => {
              classThis.views.footerBar.index = 0;
              classThis.changeIndex(0);
              await classThis.loadBooru({ tags: [text] });
            }
          });
          s.push();
        },
        didReachBottom: async function(sender) {
          const result = classThis.generatorFavorites.next();
          if (!result.done) {
            classThis.favoritesItems.push(...result.value);
            classThis.views.thumbnailsViewFavorites.items =
              classThis.favoritesItems;
          }
          sender.endFetchingMore();
        }
      }
    });
    this.views.searchBarBooru = new SearchBar({
      placeholder: $l10n("SEARCH"),
      layout: (make, view) => {
        make.top.inset(1);
        make.left.right.inset(5);
        make.height.equalTo(35);
      },
      searchEvent: async text => {
        const tags = text.split(" ");
        if (!tags || !tags.length) return;
        await classThis.loadBooru({ tags });
        constants.userConfig.addSearchHistory(text);
      }
    });
    this.views.searchBarFavorites = new SearchBar({
      placeholder: $l10n("SEARCH"),
      layout: (make, view) => {
        make.top.inset(1);
        make.left.right.inset(5);
        make.height.equalTo(35);
      }
    });
    this.views.tagsView = new TagsView({
      layout: (make, view) => {
        make.left.right.top.inset(0);
        make.bottom.equalTo(this.views.footerBar.view.top);
      },
      searchEvent: async text => {
        classThis.views.footerBar.index = 0;
        classThis.changeIndex(0);
        const tags = text.split(" ");
        if (!tags || !tags.length) return;
        await classThis.loadBooru({ tags });
        constants.userConfig.addSearchHistory(text);
      }
    });
  }

  _defineNavBottons() {
    const classThis = this;
    return [
      {
        symbol: "plus",
        handler: async sender => {
          switch (classThis.footerBarIndex) {
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
                  if (classThis.isLoading) return;
                  let startPage = await inputAlert({
                    title: $l10n("JUMP_TO_PAGE"),
                    message:
                      $l10n("CURRENT") + ": " + classThis.booruInfo.startPage
                  });
                  startPage = startPage.trim();
                  if (/^\d+$/.test(startPage) && parseInt(startPage) > 0) {
                    await classThis.loadBooru({
                      tags: classThis.booruInfo.tags,
                      random: classThis.booruInfo.random,
                      startPage: parseInt(startPage)
                    });
                  } else {
                    $ui.error($l10n("INVALID_VALUES"));
                  }
                  break;
                }
                case 1: {
                  await classThis.loadBooru();
                  break;
                }
                case 2: {
                  if (checkRandomSupport(classThis.booruInfo.site)) {
                    await classThis.loadBooru({ random: true });
                  } else {
                    $ui.error($l10n("RANDOM_SUPPORT_ERROR"));
                  }
                  break;
                }
                case 3: {
                  const newSite = await selectServers(classThis.booruInfo.site);
                  classThis.booruInfo.site = newSite;
                  await classThis.loadBooru();
                  $ui.title = newSite;
                  break;
                }
                case 4: {
                  await classThis.openPrefs();
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
                size: $size(200, 44 * 2),
                items: [$l10n("JUMP_TO_PAGE"), $l10n("SETTINGS")]
              });
              switch (index) {
                case 0: {
                  let startPage = await inputAlert({
                    title: $l10n("JUMP_TO_PAGE"),
                    message:
                      $l10n("CURRENT") +
                      ": " +
                      classThis.favoritesInfo.startPage
                  });
                  startPage = startPage.trim();
                  if (/^\d+$/.test(startPage) && parseInt(startPage) > 0) {
                    await this.loadFavorites({
                      startPage: parseInt(startPage)
                    });
                  } else {
                    $ui.error($l10n("INVALID_VALUES"));
                  }
                  break;
                }
                case 1: {
                  await classThis.openPrefs();
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
                    tag_name_editable: true
                  });
                  database.safeAddSavedTag({
                    name,
                    title,
                    category,
                    favorited
                  });
                  classThis.views.tagsView.reload(true);
                  break;
                }
                case 1: {
                  const {
                    combination_name: name,
                    combination_title: title
                  } = await addCombination();
                  database.safeAddCombination({ name, title });
                  classThis.views.tagsView.reload(true);
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
                  classThis.views.tagsView.reloadAll();
                  break;
                }
                case 3: {
                  await classThis.openPrefs();
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
        handler: function() {
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
    this.views.main.add(this.views.footerBar.definition);
    this.views.main.add(this.views.tagsView.definition);
    this.views.main.add(this.views.favoritesView.definition);
    this.views.main.add(this.views.booruView.definition);
    this.views.booruView.add(this.views.thumbnailsViewBooru.definition);
    this.views.booruView.add(this.views.searchBarBooru.definition);
    this.views.favoritesView.add(this.views.thumbnailsViewFavorites.definition);
    this.views.favoritesView.add(this.views.searchBarFavorites.definition);
    this.views.footerBar.index = this.footerBarIndex;
    this.changeIndex(this.footerBarIndex);
  }

  changeIndex(index) {
    this.footerBarIndex = index;
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
      this.isLoading = false;
      if (useUiLoading) $ui.loading(false);
    } catch (e) {
      console.info(e);
      this.isLoading = false;
      if (useUiLoading) $ui.loading(false);
    }
  }

  loadFavorites({ startPage = 1 } = {}) {
    this.views.thumbnailsViewFavorites.items = [];
    this.favoritesItems = undefined;
    this.generatorFavorites = generatorForFavorites({ startPage });
    const result = this.generatorFavorites.next();
    this.favoritesItems = result.value;
    this.views.thumbnailsViewFavorites.items = this.favoritesItems;
    this.views.thumbnailsViewFavorites.view.scrollTo({
      indexPath: $indexPath(0, 0),
      animated: false
    });
    this.favoritesInfo.startPage = startPage;
  }

  _filter(items) {
    if ($prefs.get("safe_search")) items = safeSearchFilter(items);
    if ($prefs.get("filter_nonauthorized_images")) items = nonauthorizedFilter(items);
    return items
  }

  async openPrefs() {
    await $prefs.open();
    this.checkPrefs();
  }

  checkPrefs() {
    const intervals = $prefs.get("slideshow_intervals");
    if (intervals < 1 || intervals > 30) {
      $prefs.set("slideshow_intervals", 5);
    }
  }
}

module.exports = Controller;
