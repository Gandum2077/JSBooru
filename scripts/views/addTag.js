const getTagInfo = require("../tags/getData");
const { render } = require("../utils/dtext");
const constants = require("../utils/constants");
const Sheet = require("../components/sheet");
const BaseView = require("../components/baseView");

class AddTagView extends BaseView {
  constructor({
    tag_name,
    tag_title,
    category,
    add_to_favorited,
    tag_name_editable
  }) {
    super();
    this.tag_name = tag_name;
    this.tag_title = tag_title;
    this.category = category;
    this.add_to_favorited = add_to_favorited;
    this.tag_name_editable = tag_name_editable;
  }

  _defineHeaderView() {
    const classThis = this;
    const sectionNames = [
      $l10n("UNCATEGORIZED"),
      ...constants.userConfig.tag_categoires
    ];
    const rows = [
      {
        type: "view",
        props: {
          bgcolor: $color("white")
        },
        layout: $layout.fill,
        views: [
          {
            type: "label",
            props: {
              id: "title",
              align: $align.left,
              bgcolor: $color("white"),
              text: $l10n("CONTENT")
            },
            layout: function(make, view) {
              make.left.inset(15);
              make.top.bottom.inset(0.5);
              make.width.equalTo(100);
            }
          },
          {
            type: "input",
            props: {
              id: "input",
              text: this.tag_name,
              placeholder: $l10n("REQUIRED"),
              radius: 0,
              autocapitalizationType: 0,
              userInteractionEnabled: this.tag_name_editable,
              bgcolor: $color("white")
            },
            layout: function(make, view) {
              make.top.bottom.inset(0.5);
              make.left.equalTo(view.prev.right);
              make.right.inset(15);
            },
            events: {
              changed: function(sender) {
                classThis.tag_name = sender.text;
              },
              didEndEditing: async function(sender) {
                sender.text = sender.text.trim();
                classThis.initStatus();
                classThis.tag_name = sender.text;
                await classThis.updateStatus();
              },
              returned: function(sender) {
                sender.blur();
              }
            }
          }
        ]
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white")
        },
        layout: $layout.fill,
        views: [
          {
            type: "label",
            props: {
              id: "title",
              align: $align.left,
              bgcolor: $color("white"),
              text: $l10n("TITLE")
            },
            layout: function(make, view) {
              make.left.inset(15);
              make.top.bottom.inset(0.5);
              make.width.equalTo(100);
            }
          },
          {
            type: "input",
            props: {
              id: "input",
              text: this.tag_title,
              placeholder: $l10n("OPTIONAL"),
              radius: 0,
              bgcolor: $color("white")
            },
            layout: function(make, view) {
              make.top.bottom.inset(0.5);
              make.left.equalTo(view.prev.right);
              make.right.inset(15);
            },
            events: {
              changed: function(sender) {
                classThis.tag_title = sender.text;
              },
              returned: function(sender) {
                sender.blur();
              }
            }
          }
        ]
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white")
        },
        layout: $layout.fill,
        views: [
          {
            type: "label",
            props: {
              id: "title",
              align: $align.left,
              bgcolor: $color("white"),
              text: $l10n("CATEGORY")
            },
            layout: function(make, view) {
              make.left.inset(15);
              make.top.bottom.inset(0.5);
              make.width.equalTo(100);
            }
          },
          {
            type: "view",
            props: {
              id: "background",
              bgcolor: $color("white")
            },
            layout: function(make, view) {
              make.top.bottom.inset(0.5);
              make.left.equalTo($("title").right);
              make.right.inset(15);
            }
          },
          {
            type: "button",
            props: {
              id: "cateogry",
              title: this.category || sectionNames[0],
              titleColor: $color("black"),
              bgcolor: $color("clear")
            },
            layout: function(make, view) {
              make.top.bottom.inset(0.5);
              make.width.equalTo(180);
              make.right.inset(20);
            },
            events: {
              tapped: async function(sender) {
                const { index } = await $ui.popover({
                  sourceView: sender.super,
                  sourceRect: sender.super.bounds,
                  directions: $popoverDirection.up,
                  size: $size(200, 44 * 5),
                  items: sectionNames
                });
                sender.title = sectionNames[index];
                classThis.category =
                  index !== 0 ? sectionNames[index] : undefined;
              }
            }
          }
        ]
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white")
        },
        layout: $layout.fill,
        views: [
          {
            type: "label",
            props: {
              id: "title",
              align: $align.left,
              bgcolor: $color("white"),
              text: $l10n("ADD_TO_FAVORITED_TAGS")
            },
            layout: function(make, view) {
              make.left.inset(15);
              make.top.bottom.inset(0.5);
              make.width.equalTo(200);
            }
          },
          {
            type: "view",
            props: {
              id: "background",
              bgcolor: $color("white")
            },
            layout: function(make, view) {
              make.top.bottom.inset(0.5);
              make.left.equalTo($("title").right);
              make.right.inset(15);
            }
          },
          {
            type: "switch",
            props: {
              id: "switch",
              on: this.add_to_favorited
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super);
              make.right.inset(40);
            },
            events: {
              changed: function(sender) {
                classThis.add_to_favorited = sender.on;
              }
            }
          }
        ]
      }
    ];
    const headerView = {
      type: "list",
      props: {
        id: "headerView",
        style: 2,
        height: 143 + 50 + 100,
        separatorHidden: false,
        scrollEnabled: false,
        bgcolor: $color("clear"),
        data: [{ title: "Tag", rows }],
        footer: {
          type: "view",
          props: {
            height: 200
          },
          views: [
            {
              type: "label",
              props: {
                id: "sectionHeaderMatrix",
                text: "",
                font: $font(13),
                textColor: $color("#666")
              },
              layout: (make, view) => {
                make.top.inset(15);
                make.left.inset(15);
              }
            }
          ]
        }
      }
    };
    return headerView;
  }

  _defineFooterView() {
    const footerView = {
      type: "view",
      props: {
        height: 200,
        id: "footerView",
        hidden: true
      },
      views: [
        {
          type: "label",
          props: {
            id: "sectionHeader",
            text: "Wiki",
            font: $font(13),
            textColor: $color("#666")
          },
          layout: (make, view) => {
            make.top.inset(15);
            make.left.inset(15);
          }
        },
        {
          type: "text",
          props: {
            id: "text_wiki",
            editable: false,
            textColor: $color("#666")
          },
          layout: (make, view) => {
            make.top.equalTo($("sectionHeader").bottom).inset(5);
            make.left.right.inset(15);
            make.bottom.inset(0);
          }
        }
      ]
    };
    return footerView;
  }

  _defineView() {
    const classThis = this;
    const matrix = {
      type: "matrix",
      props: {
        id: this.id,
        bgcolor: $color("#eee"),
        spacing: 15,
        header: this._defineHeaderView(),
        footer: this._defineFooterView(),
        template: {
          props: {
            bgcolor: $color("clear")
          },
          views: [
            {
              type: "label",
              props: {
                id: "tag",
                radius: 5,
                bgcolor: $color("white"),
                font: $font(15),
                align: $align.center
              },
              layout: $layout.fill
            }
          ]
        }
      },
      layout: function(make, view) {
        make.left.right.bottom.equalTo(view.super.safeArea);
        make.top.equalTo(view.super.safeArea);
      },
      events: {
        ready: async function(sender) {
          await $wait(0.5);
          await classThis.updateStatus();
        },
        itemSize: function(sender, indexPath) {
          const maxWidth = sender.frame.width || $device.info.screen.width;
          const data = sender.data[indexPath.item];
          const text = data.tag.text;
          const width = $text.sizeThatFits({
            text: text,
            width: 10000,
            font: $font(15),
            lineSpacing: 0
          }).width;
          return $size(Math.min(Math.max(width + 15, 50), maxWidth), 32);
        },
        didSelect: function(sender, indexPath, data) {
          classThis.view
            .get("headerView")
            .cell($indexPath(0, 1))
            .get("input").text = data.tag.text;
        }
      }
    };
    return matrix;
  }

  initStatus() {
    this.view.data = [];
    this.view.super.get("headerView").get("sectionHeaderMatrix").text = "";
    this.view.super.get("footerView").hidden = true;
  }

  async updateStatus() {
    const map = other_names => {
      if (!other_names) return;
      return other_names.map(n => {
        return {
          tag: { text: n }
        };
      });
    };
    try {
      if (!this.tag_name) return;
      this.view.super.get("headerView").get("sectionHeaderMatrix").text =
        $l10n("WIKI_LOADING");
      const info = await getTagInfo(this.tag_name);
      if (!this.view.super) return;
      this.view.data = map(info.other_names);
      this.view.super.get("headerView").get("sectionHeaderMatrix").text =
        info.other_names && info.other_names.length
          ? "Other Names"
          : "No Other Names";
      if (info.wiki) {
        this.view.super.get("footerView").hidden = false;
        this.view.super.get("footerView").get("text_wiki").html = render(
          info.wiki
        );
      }
    } catch (err) {
      this.view.super.get("headerView").get("sectionHeaderMatrix").text =
        err.message;
    }
  }

  get result() {
    return {
      name: this.tag_name,
      title: this.tag_title,
      category: this.category,
      favorited: this.add_to_favorited
    };
  }
}

function presentSheet({
  title,
  tag_name,
  tag_title,
  category,
  add_to_favorited,
  tag_name_editable,
  presentMode = 1
}) {
  const addTagView = new AddTagView({
    tag_name,
    tag_title,
    category,
    add_to_favorited,
    tag_name_editable
  });
  const sheet = new Sheet({
    title,
    presentMode,
    view: addTagView.definition,
    doneEvent: sender => {
      return addTagView.result;
    }
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}

function addTag({
  title = $l10n("SAVED_TAGS_TITLE"),
  tag_name,
  tag_title,
  category,
  add_to_favorited,
  tag_name_editable = false,
  presentMode
} = {}) {
  if (presentMode === undefined) {
    presentMode = $device.isIpad ? 2 : 1;
  }
  return presentSheet({
    title,
    tag_name,
    tag_title,
    category,
    add_to_favorited,
    tag_name_editable,
    presentMode
  });
}

module.exports = addTag;
