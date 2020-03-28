const getTagInfo = require("../tags/getData");
const { render } = require("../utils/dtext");
const constants = require("../utils/constants");
const Sheet = require("../components/sheet");
const BaseView = require("../components/baseView");
const FlowLayout = require("../components/flowlayout");
const colors = require("../utils/colors");
const ListView = require("../dialogs/listView");

class Label extends BaseView {
  constructor({ text, layout }) {
    super();
    this._text = text;
    this.layout = layout;
  }

  _defineView() {
    return {
      type: "label",
      props: {
        id: this.id,
        text: this._text,
        font: $font(13),
        textColor: colors.sectionHeaderColor
      },
      layout: this.layout
    };
  }

  set text(text) {
    this._text = text;
    this.view.text = text;
  }
}

class Markdown extends BaseView {
  constructor({ content, layout }) {
    super();
    this._content = content;
    this.layout = layout;
  }

  _defineView() {
    return {
      type: "markdown",
      props: {
        id: this.id,
        content: this._content,
        bgcolor: $color("secondarySurface")
      },
      layout: this.layout
    };
  }

  set content(content) {
    this._content = content;
    this.view.content = content;
  }
}

class FooterView extends BaseView {
  constructor({ height, nameChangedEvent, heightChangedEvent }) {
    super();
    this._height = height;
    this.nameChangedEvent = nameChangedEvent;
    this.heightChangedEvent = heightChangedEvent;
    this.views = {};
    this._wikiHidden = true;
  }

  _defineView() {
    this.views.labelOtherNames = new Label({
      text: "Other Names",
      layout: (make, view) => {
        make.top.inset(5);
        make.left.inset(15);
        make.right.inset(0);
        make.height.equalTo(30);
      }
    });
    this.views.labelWiki = new Label({
      text: "Wiki",
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(5);
        make.left.inset(15);
        make.right.inset(0);
        make.height.equalTo(30);
      }
    });
    this.views.flowLayout = new FlowLayout({
      props: {
        bgcolor: $color("clear"),
        data: [],
        template: {
          props: {
            bgcolor: $color("secondarySurface")
          }
        }
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(5);
        make.left.right.inset(15);
        make.height.equalTo(0);
      },
      events: {
        didSelect: (sender, indexpath, data) => {
          this.nameChangedEvent(data);
        },
        layoutSubviews: sender => {
          const height = sender.contentSize.height;
          sender.updateLayout((make, view) => {
            make.height.equalTo(height);
            this.heightChangedEvent(height);
          });
        }
      }
    });
    this.views.markdown = new Markdown({
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(5);
        make.left.right.inset(15);
        make.height.equalTo(300);
      }
    });
    return {
      props: {
        id: this.id,
        height: this._height
      },
      views: [
        this.views.labelOtherNames.definition,
        this.views.flowLayout.definition,
        this.views.labelWiki.definition,
        this.views.markdown.definition
      ]
    };
  }
}

class AddTagView extends BaseView {
  constructor({ values, name_editable }) {
    super();
    this._values = values;
    this.name_editable = name_editable;
  }

  _defineView() {
    this.footerView = new FooterView({
      height: 50,
      nameChangedEvent: text => {
        const nameCell = this.listView.view.cell($indexPath(0, 1));
        nameCell.get("valueView").text = text;
        this.listView._values.title = text;
      },
      heightChangedEvent: height => {
        $delay(0.1, () => {
          this.footerheight = (this._wikiHidden ? 50 : 400) + height;
        });
      }
    });
    this.listView = new ListView({
      sections: [
        {
          title: $l10n("TAG"),
          rows: [
            {
              type: "string",
              title: $l10n("CONTENT"),
              key: "name",
              value: this._values.name,
              placeholder: $l10n("REQUIRED"),
              disabled: !this.name_editable
            },
            {
              type: "string",
              title: $l10n("TITLE"),
              key: "title",
              value: this._values.title,
              placeholder: $l10n("OPTIONAL")
            },
            {
              type: "list",
              title: $l10n("CATEGORY"),
              key: "category",
              listType: "menu",
              items: [
                $l10n("UNCATEGORIZED"),
                ...constants.userConfig.tag_categoires
              ],
              value: this._values.category
            },
            {
              type: "boolean",
              title: $l10n("ADD_TO_FAVORITED_TAGS"),
              key: "favorited",
              value: this._values.favorited
            }
          ]
        }
      ],
      props: {
        footer: this.footerView.definition
      },
      layout: $layout.fill
    });

    return {
      props: {
        id: this.id
      },
      views: [this.listView.definition]
    };
  }

  set footerheight(height) {
    const footer = this.footerView.view;
    const frame = footer.frame;
    frame.height = height;
    footer.frame = frame;
    this.listView.view.reload();
  }

  get values() {
    return this.listView.values;
  }

  initial() {
    this.footerView.views.labelOtherNames.text = "";
    this.footerView.views.flowLayout.data = [];
    this._wikiHidden = true;
    this.footerView.views.labelWiki.view.hidden = true;
    this.footerView.views.markdown.view.hidden = true;
    this.footerheight = 50;
  }

  async update() {
    if (!this.values.name) return;
    this.footerView.views.labelOtherNames.text = $l10n("WIKI_LOADING");
    let height = 50;
    try {
      const info = await getTagInfo(this.values.name);
      if (!this.view.super) return;
      this.footerView.views.flowLayout.data = info.other_names;
      this.footerView.views.labelOtherNames.text =
        info.other_names && info.other_names.length
          ? "Other Names"
          : "No Other Names";
      if (info.wiki) {
        this._wikiHidden = false;
        this.footerView.views.labelWiki.view.hidden = false;
        this.footerView.views.markdown.view.content = render(info.wiki);
        this.footerView.views.markdown.view.hidden = false;
      }
      $delay(0.05, () => {
        height += this.footerView.views.flowLayout.view.contentSize.height;
        if (!this._wikiHidden) height += 350;
        this.footerheight = height;
      });
    } catch (err) {
      this.footerView.views.labelOtherNames.text = err.message;
    }
  }
}

function presentSheet({ values, name_editable, presentMode = 1 }) {
  const addTagView = new AddTagView({ values, name_editable });
  const sheet = new Sheet({
    title: $l10n("SAVED_TAGS_TITLE"),
    presentMode,
    view: addTagView.definition,
    doneEvent: sender => addTagView.values
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
    $delay(0.3, () => {
      addTagView.initial();
      addTagView.update().then();
    });
  });
}

function addTag({
  name,
  title,
  category,
  favorited,
  name_editable = false,
  presentMode
} = {}) {
  if (presentMode === undefined) {
    presentMode = $device.isIpad ? 2 : 1;
  }
  const values = { name, title, category, favorited };
  return presentSheet({
    values,
    name_editable,
    presentMode
  });
}

module.exports = addTag;
