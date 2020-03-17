const BaseView = require("../components/baseView");
const addTag = require("./addTag");
const database = require("../utils/database");

class InfoView extends BaseView {
  constructor({ item, searchEvent }) {
    super();
    this.item = item;
    this.searchEvent = searchEvent;
  }

  _defineView() {
    const classThis = this;
    const postRows = [];
    if (this.item.sampleUrl)
      postRows.push({
        label: {
          styledText: {
            text: `Sample  ${this.item.sampleWidth} × ${this.item.sampleHeight}`,
            font: $font(15),
            color: $color("secondaryText"),
            styles: [
              {
                range: $range(0, 6),
                font: $font(17),
                color: $color("primaryText")
              }
            ]
          }
        }
      });
    if (this.item.fileUrl)
      postRows.push({
        label: {
          styledText: {
            text: `Original  ${this.item.width} × ${this.item.height}`,
            font: $font(15),
            color: $color("secondaryText"),
            styles: [
              {
                range: $range(0, 8),
                font: $font(17),
                color: $color("primaryText")
              }
            ]
          }
        }
      });
    if (this.item.source)
      postRows.push({
        label: {
          styledText: {
            text: `Source  ${this.item.source}`,
            font: $font(15),
            color: $color("secondaryText"),
            styles: [
              {
                range: $range(0, 6),
                font: $font(17),
                color: $color("primaryText")
              }
            ]
          }
        }
      });
    const tagsRows = this.item.tags.map(n => {
      return {
        label: { text: n }
      };
    });
    const infosRows = [];
    infosRows.push({
      label: {
        styledText: {
          text: `Site  ${this.item.booru.site.domain}`,
          font: $font(15),
          color: $color("secondaryText"),
          styles: [
            {
              range: $range(0, 4),
              font: $font(17),
              color: $color("primaryText")
            }
          ]
        }
      }
    });
    if (this.item.id)
      infosRows.push({
        label: {
          styledText: {
            text: `ID  ${this.item.id}`,
            font: $font(15),
            color: $color("secondaryText"),
            styles: [
              {
                range: $range(0, 2),
                font: $font(17),
                color: $color("primaryText")
              }
            ]
          }
        }
      });
    if (this.item.rating)
      infosRows.push({
        label: {
          styledText: {
            text: `Rating  ${this.item.rating}`,
            font: $font(15),
            color: $color("secondaryText"),
            styles: [
              {
                range: $range(0, 6),
                font: $font(17),
                color: $color("primaryText")
              }
            ]
          }
        }
      });
    return {
      type: "list",
      props: {
        id: this.id,
        template: {
          views: [
            {
              type: "label",
              props: {
                id: "label"
              },
              layout: (make, view) => {
                make.top.bottom.equalTo(0);
                make.left.right.inset(15);
              }
            }
          ]
        },
        data: [
          { title: "Post", rows: postRows },
          { title: "Tags", rows: tagsRows },
          { title: "Infos", rows: infosRows }
        ]
      },
      layout: (make, view) => {
        make.top.bottom.right.inset(0);
        if ($device.isIpad) {
          make.width.equalTo(view.super).multipliedBy(1 / 2);
        } else {
          make.width.equalTo(view.super).multipliedBy(2 / 3);
        }
      },
      events: {
        didSelect: async function(sender, indexPath, data) {
          switch (indexPath.section) {
            case 0: {
              break;
            }
            case 1: {
              const tag_name = data.label.text;
              const savedTagInfo = database.searchSavedTag(tag_name);
              const totalHeight = $ui.window.frame.height;
              const positionY =
                sender.cell(indexPath).frame.y - sender.bounds.y;
              const directions =
                positionY > totalHeight / 2 && totalHeight - positionY < 300
                  ? $popoverDirection.down
                  : $popoverDirection.up;
              const { index } = await $ui.popover({
                sourceView: sender.cell(indexPath),
                sourceRect: sender.cell(indexPath).bounds,
                directions,
                size: $size(250, 220),
                items: [
                  $l10n("SEARCH_DIRECTLY"),
                  $l10n("COPY_TO_CLIPBOARD"),
                  $l10n("ADD_TO_CLIPBOARD"),
                  savedTagInfo ? $l10n("DELETE_IT_FROM_SAVED") : $l10n("SAVE_DIRECTLY"),
                  $l10n("OPEN_SAVED_TAGS_INTERFACE")
                ]
              });
              switch (index) {
                case 0: {
                  $ui.pop();
                  await $wait(0.5);
                  await classThis.searchEvent(tag_name);
                  break;
                }
                case 1: {
                  $clipboard.text = tag_name;
                  break;
                }
                case 2: {
                  const old_text = $clipboard.text;
                  $clipboard.text = old_text.trim() + " " + tag_name;
                  break;
                }
                case 3: {
                  if (savedTagInfo) {
                    database.deleteSavedTag(tag_name);
                  } else {
                    database.safeAddSavedTag({ name: tag_name });
                  }
                  break;
                }
                case 4: {
                  const result = await addTag({
                    tag_name,
                    tag_title: savedTagInfo ? savedTagInfo.title : undefined,
                    category: savedTagInfo ? savedTagInfo.category : undefined,
                    add_to_favorited: savedTagInfo
                      ? savedTagInfo.favorited
                      : undefined
                  });
                  database.safeAddSavedTag({
                    name: result.name,
                    title: result.title,
                    category: result.category,
                    favorited: result.favorited
                  });
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
      }
    };
  }
}

module.exports = InfoView;
