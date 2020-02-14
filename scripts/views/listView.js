const constants = require("scripts/utils/constants")
const inputAlert = require('scripts/dialogs/inputAlert')
const imageView = require("scripts/views/imageView")
const { generatorForSite, generatorForFavorites } = require("scripts/booru/generator")
const { querySiteNameByIndex, checkRandomSupport } = require("scripts/utils/utils")
const { safeSearchFilter } = require("scripts/booru/filter")

let GENERATOR
let SITE, TAGS, RANDOM, STARTPAGE, ITEMS

function initViewStatus(clearSearch=true) {
  const input = $("titleViewOfListView").get("input")
  if (!input.hidden) {
    input.hidden = true
    input.blur()
    if (clearSearch) input.text = ''
  }
}

function search(text) {
  $ui.toast(text)
}

function defineTitleView() {
  const titleView = {
    type: "view",
    props: {
      id: "titleViewOfListView",
      size: $size(10000, 32)
    },
    views: [{
        type: "label",
        props: {
          id: "label",
          bgcolor: $color("clear"),
          textColor: $color("white"),
          font: $font(18),
          align: $align.center
        }
      },
      {
        type: "input",
        props: {
          id: "input",
          bgcolor: $color("white"),
          textColor: $color("black"),
          align: $align.left,
          hidden: true,
          accessoryView: {
            type: "matrix",
            props: {
              id: "accessoryViewMatrix",
              keyboardDismissMode: 0,
              height: 44,
              spacing: 5,
              direction: $scrollDirection.horizontal,
              bgcolor: $color("clear"),
              alwaysBounceVertical: false,
              showsHorizontalIndicator: false,
              data: ['\u{1f4cb}Clipboard'].map(n => {
                return {
                  button: {
                    title: n
                  }
                }
              }),
              template: {
                props: {},
                views: [{
                  type: "button",
                  props: {
                    id: "button",
                    font: $font('menlo', 13),
                    borderWidth: 0.5,
                    bgcolor: $color("white"),
                    titleColor: $color("black")
                  },
                  layout: function(make, view) {
                    make.center.equalTo(view.super)
                    make.width.equalTo(view.super)
                    make.height.equalTo(28)
                  }
                }]
              }
            },
            events: {
              itemSize: function(sender, indexPath) {
                const textWidth = $text.sizeThatFits({
                  text: sender.data[indexPath.item].button.title,
                  width: 1000,
                  font: $font('menlo', 13),
                  lineSpacing: 0
                }).width
                const adjustedWidth = Math.min(Math.max(40, textWidth), 290) + 10
                return $size(adjustedWidth, 32);
              }
            }
          }
        },
        events: {
          didEndEditing: function (sender) {
            sender.hidden = true
            sender.blur()
          },
          returned: function (sender) {
            sender.hidden = true
            sender.blur()
            if (sender.text) {
              search(sender.text)
            }
          }
        }
      }
    ],
    events: {
      layoutSubviews: sender => {
        const label = sender.get("label")
        const input = sender.get("input")
        // 居中显示
        label.frame = $rect(
          sender.super.super.frame.width / 2 - sender.super.frame.x - 150,
          0, 300, 32
        )
        input.frame = $rect(
          0, 0, sender.size.width, sender.size.height
        )
      }
    }
  }
  return titleView
}

function defineNavBottons() {
  const navButtons = [
    {
      symbol: "square.grid.2x2.fill",
      handler: async sender => {
        const { title } = await $ui.popover({
          sourceView: sender,
          sourceRect: sender.bounds, 
          directions: $popoverDirection.up, 
          size: $size(200, 350), 
          items: ["Jump to Page", "Browse All", "Saved Tags", "Random", "Favorites", "Servers", "Settings", "Help"]
        })
        switch (title) {
          case "Jump to Page":
            const startPage = await inputAlert({
              title: 'Jump to Page',
              message: 'Current: ' + STARTPAGE
            })
            await load({
              site: SITE,
              tags: TAGS,
              random: RANDOM,
              startPage: startPage
            })
            break;
          case "Browse All":
            await load({
              site: SITE,
              tags: [],
              random: false,
              startPage: 1
            })
            break;
          case "Saved Tags":
            
            break;
          case "Random":
            if (checkRandomSupport(SITE)) {
              await load({
                site: SITE,
                tags: [],
                random: true,
                startPage: 1
              })
            } else {
              $ui.alert("Random search is not supported by this site")
            }
            break;
          case "Favorites":
            await load({
              site: "favorites",
              startPage: 1
            })
            break;
          case "Servers":
            $ui.push({
              props: {
                title: "Servers",
                navButtons: [{
                  symbol: "questionmark.circle",
                  handler: sender => {
                    $ui.alert({
                      title: "提示",
                      message: "可以长按排序，将喜爱的站点放在前面"
                    })
                  }
                }]
              },
              views: [{
                type: "list",
                props: {

                }
              }]
            })
            break;
          case "Settings":
            $prefs.open()
            break;
          case "Help":
            $ui.push({
              props: {
                title: "README",
                navButtons: [{
                  symbol: "safari",
                  handler: () => {
                    $app.openURL("https://github.com/Gandum2077/jsbox-booru")
                  }
                }]
              },
              views: [{
                  type: "markdown",
                  props: {
                    content: $file.read("README.md").string
                  },
                  layout: $layout.fillSafeArea
              }]
          })
            break;
          default:
            break;
        }
      }
    },
    {
      symbol: "magnifyingglass",
      handler: function () {
        const input = $("titleViewOfListView").get("input")
        if (input.hidden) {
          input.hidden = false
          input.focus()
        } else if (input.text) {
          input.hidden = true
          input.blur()
          search(input.text)
        } else {
          input.hidden = true
          input.blur()
        }
      }
    }
  ]
  return navButtons
}
function getDataForListView(items) {
  return items.map(n => {
    return {
      thumbnail: {
        src: n.previewUrl
      }
    }
  })
}

function defineContentView() {
  const contentView = {
    type: "matrix",
    props: {
      id: "contentView",
      square: true,
      columns: 4,
      spacing: 5,
      bgcolor: $color('#333'),
      template: {
        props: {
          bgcolor: $color("clear")
        },
        views: [
          {
            type: "image",
            props: {
              id: "thumbnail",
              bgcolor: $color('#efeff4'),
              contentMode: 1
            },
            layout: $layout.fill
          }
        ]
      }
    },
    layout: $layout.fillSafeArea,
    events: {
      willBeginDragging: function(sender) {
        initViewStatus(false)
      },
      didSelect: function(sender, indexPath, data) {
        imageView(ITEMS, indexPath.item)
      },
      didReachBottom: async function(sender) {
        if (!ITEMS) return
        const result = await GENERATOR.next()
        if (!result.done) {
          if ($prefs.get("safe_search")) {
            ITEMS.push(...safeSearchFilter(result.value))
          } else {
            ITEMS.push(...result.value)
          }
          sender.data = getDataForListView(ITEMS)
        }
        sender.endFetchingMore()
      },
    }
  }
  return contentView
}


async function load({
  site,
  tags = [],
  random = false,
  startPage = 1
}) {
  SITE = site
  TAGS = tags
  RANDOM = random
  STARTPAGE = startPage
  ITEMS = undefined
  $("titleViewOfListView").get("label").text = SITE
  console.info("loading")
  if (site === "favorites") {
    GENERATOR = generatorForFavorites({ startPage })
  } else {
    GENERATOR = generatorForSite({ site, tags, random, startPage })
  }
  const result = await GENERATOR.next()
  if ($prefs.get("safe_search")) {
    ITEMS = safeSearchFilter(result.value)
  } else {
    ITEMS = result.value
  }
  console.info(ITEMS)
  const data = getDataForListView(ITEMS)
  $("contentView").data = data
}

async function init() {
  const navButtons = defineNavBottons()
  const titleView = defineTitleView()
  const contentView = defineContentView()
  $ui.render({
    props: {
      navButtons,
      titleView
    },
    views: [contentView]
  })
  await load({ site: querySiteNameByIndex($prefs.get("default_site")) })
}

module.exports = init
