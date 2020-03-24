const BaseView = require("../components/baseView");

// 计算特定字号的文字长度
// 此函数不应该用于处理超长文本
function getTextSize(text, { font = $font(17) } = {}) {
  return $text.sizeThatFits({
    text,
    width: 10000,
    font,
    align: $align.center,
    lineSpacing: 0
  });
}

class Cell extends BaseView {
  constructor(
    {
      type,
      key,
      title,
      value,
      titleColor = $color("primaryText"),
      iconColor = $color("tintColor"),
      icon,
      iconEdgeInsets = $insets(12, 12, 12, 12),
      disabled
    } = { type }
  ) {
    super();
    this.type = type;
    this.key = key;
    this.title = title;
    this.value = value;
    this.titleColor = titleColor;
    this.iconColor = iconColor;
    this.icon = icon;
    this.iconEdgeInsets = iconEdgeInsets;
    this.disabled = disabled;
  }

  _defineView() {
    return {
      type: "view",
      props: {
        userInteractionEnabled: !this.disabled
      },
      layout: $layout.fill,
      views: this.icon
        ? [
            this._defineIconView(),
            this._defineTitleView(),
            this._defineValueView()
          ]
        : [this._defineTitleView(), this._defineValueView()]
    };
  }

  _defineTitleView() {
    return {
      type: "label",
      props: {
        id: "title",
        text: this.title,
        textColor: this.titleColor,
        font: $font(17)
      },
      layout: function(make, view) {
        const icon = view.super.get("icon");
        make.height.equalTo(89 / 2);
        make.width.equalTo(getTextSize(view.text).width + 10);
        make.top.inset(0);
        if (icon) {
          make.left.equalTo(icon.right).inset(10);
        } else {
          make.left.inset(15);
        }
      }
    };
  }

  _defineIconView() {
    const classThis = this;
    return {
      type: "view",
      props: {
        id: "icon"
      },
      views: [
        {
          type: "image",
          props: {
            id: "icon",
            tintColor: this.iconColor,
            image: this.icon.alwaysTemplate
          },
          layout: function(make, view) {
            make.edges.insets(classThis.iconEdgeInsets);
          }
        }
      ],
      layout: function(make, view) {
        make.size.equalTo($size(89 / 2, 89 / 2));
        make.left.inset(10);
      }
    };
  }
}

class BaseStringCell extends Cell {
  constructor(props, values) {
    super(props);
    const {
      autocorrectionType = 0,
      autocapitalizationType = 0,
      spellCheckingType = 0,
      placeholder,
      textColor
    } = props;
    this.autocorrectionType = autocorrectionType;
    this.autocapitalizationType = autocapitalizationType;
    this.spellCheckingType = spellCheckingType;
    this.placeholder = placeholder;
    this.textColor = textColor;
    this.values = values;
  }

  _defineValueView() {
    const classThis = this;
    return {
      type: "input",
      props: {
        id: "valueView",
        text: this._handleText(this.value),
        kbType: this.kbType,
        align: $align.left,
        textColor: this.textColor,
        bgcolor: $color("clear"),
        placeholder: this.placeholder,
        secure: this.secure,
        autocorrectionType: this.autocorrectionType,
        autocapitalizationType: this.autocapitalizationType,
        spellCheckingType: this.spellCheckingType
      },
      layout: function(make, view) {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
      events: {
        changed: function(sender) {
          if (classThis.key)
            classThis.values[classThis.key] = classThis._handleText(
              sender.text
            );
        },
        didEndEditing: function(sender) {
          const result = classThis._handleText(sender.text);
          sender.text = result;
          if (classThis.key)
            classThis.values[classThis.key] = classThis._handleText(result);
        },
        returned: function(sender) {
          sender.blur();
        }
      }
    };
  }
}

class StringCell extends BaseStringCell {
  constructor(props, values) {
    super(props, values);
  }

  _handleText(text) {
    return text;
  }
}

class NumberCell extends BaseStringCell {
  constructor(props, values) {
    super(props, values);
    this.kbType = $kbType.number;
  }

  _handleText(text) {
    return parseFloat(text);
  }
}

class IntegerCell extends BaseStringCell {
  constructor(props, values) {
    super(props, values);
    this.kbType = $kbType.number;
  }

  _handleText(text) {
    return parseInt(text);
  }
}

class PasswordCell extends BaseStringCell {
  constructor(props, values) {
    super(props, values);
    this.kbType = $kbType.ascii;
    this.secure = true;
  }

  _handleText(text) {
    return text;
  }
}

class BooleanCell extends Cell {
  constructor(props, values) {
    super(props);
    const { onColor, thumbColor } = props;
    this.onColor = onColor;
    this.thumbColor = thumbColor;
    this.values = values;
  }

  _defineValueView() {
    const classThis = this;
    return {
      type: "switch",
      props: {
        id: "valueView",
        on: this.value,
        onColor: this.onColor,
        thumbColor: this.thumbColor
      },
      layout: function(make, view) {
        make.size.equalTo($size(51, 31));
        make.centerY.equalTo(view.super);
        make.right.inset(15);
      },
      events: {
        changed: function(sender) {
          if (classThis.key) classThis.values[classThis.key] = sender.on;
        }
      }
    };
  }
}

class SliderCell extends Cell {
  constructor(props, values) {
    super(props);
    const {
      decimal = 1,
      min = 0,
      max = 1,
      minColor,
      maxColor,
      thumbColor
    } = props;
    this.decimal = decimal;
    this.min = min;
    this.max = max;
    this.minColor = minColor;
    this.maxColor = maxColor;
    this.thumbColor = thumbColor;
    this.values = values;
  }

  _defineValueView() {
    const classThis = this;
    return {
      type: "view",
      props: {
        id: "valueView"
      },
      views: [
        {
          type: "label",
          props: {
            id: "sliderValue",
            text: this.value.toFixed(this.decimal),
            align: $align.right
          },
          layout: function(make, view) {
            make.top.right.bottom.inset(0);
            make.width.equalTo(30);
          }
        },
        {
          type: "slider",
          props: {
            id: "slider",
            value: this.value,
            max: this.max,
            min: this.min,
            minColor: this.minColor,
            maxColor: this.maxColor,
            thumbColor: this.thumbColor,
            continuous: true
          },
          layout: function(make, view) {
            make.top.left.bottom.inset(0);
            make.right.equalTo(view.prev.left);
          },
          events: {
            changed: function(sender) {
              const adjustedValue = sender.value.toFixed(classThis.decimal);
              sender.prev.text = adjustedValue;
              if (classThis.key)
                classThis.values[classThis.key] = parseFloat(adjustedValue);
            }
          }
        }
      ],
      layout: function(make, view) {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      }
    };
  }
}

class ListCell extends Cell {
  constructor(props, values) {
    super(props);
    const { items, listType = "menu" } = props;
    this.items = items;
    this.listType = listType;
    this.values = values;
  }

  _defineValueView() {
    const classThis = this;
    return {
      type: "label",
      props: {
        id: "valueView",
        text: this.value,
        textColor: $color("tintColor"),
        align: $align.right,
        userInteractionEnabled: true
      },
      events: {
        tapped: async function(sender) {
          let title;
          if (classThis.listType === "menu") {
            const result = await $ui.menu({ items: classThis.items });
            title = result.title;
          } else if (classThis.listType === "popover") {
            const result = await $ui.popover({
              sourceView: sender.super,
              sourceRect: sender.super.bounds,
              directions: $popoverDirection.up,
              size: $size(320, 200),
              items: classThis.items
            });
            title = result.title;
          }
          if (title) {
            sender.text = title;
            if (classThis.key) classThis.values[classThis.key] = title;
          }
        }
      },
      layout: function(make, view) {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      }
    };
  }
}

class SegmentedControlCell extends Cell {
  constructor(props, values) {
    super(props);
    const { items, index = -1 } = props;
    this.items = items;
    this.index = index;
    this.values = values;
  }

  _defineValueView() {
    const classThis = this;
    return {
      type: "tab",
      props: {
        id: "valueView",
        items: this.items,
        index: this.index
      },
      layout: function(make, view) {
        make.centerY.equalTo(view.super);
        make.height.equalTo(40);
        make.left.equalTo($("title").right).inset(10);
        make.right.inset(15);
      },
      events: {
        changed: function(sender) {
          if (classThis.key) classThis.values[classThis.key] = sender.index;
        }
      }
    };
  }
}

class DatetimeCell extends Cell {
  constructor(props, values) {
    super(props);
    const { min, max, mode = 0, interval = 1 } = props;
    this.min = min;
    this.max = max;
    this.mode = mode;
    this.interval = interval;
    this.values = values;
  }

  _defineValueView() {
    const classThis = this;
    return {
      type: "label",
      props: {
        id: "valueView",
        text: this.value.toISOString(),
        align: $align.right,
        userInteractionEnabled: true
      },
      layout: function(make, view) {
        make.right.inset(15);
        make.centerY.equalTo(view.super);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
      events: {
        tapped: async function(sender) {
          const result = await $picker.date({
            date: classThis.value,
            min: classThis.min,
            max: classThis.max,
            mode: classThis.mode,
            interval: classThis.interval
          });
          const date = new Date(result);
          sender.text = date.toISOString();
          if (classThis.key) classThis.values[classThis.key] = date;
        }
      }
    };
  }
}

class InfoCell extends Cell {
  constructor(props) {
    super(props);
  }

  _defineValueView() {
    return {
      type: "label",
      props: {
        id: "valueView",
        text: this.value,
        textColor: $color("secondaryText"),
        align: $align.right
      },
      layout: function(make, view) {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      }
    };
  }
}

class LinkCell extends Cell {
  constructor(props) {
    super(props);
  }

  _defineValueView() {
    const classThis = this;
    return {
      type: "view",
      props: {
        id: "valueView"
      },
      views: [
        {
          type: "label",
          props: {
            id: "valueView",
            styledText: {
              text: this.value,
              font: $font(17),
              userInteractionEnabled: true,
              styles: [
                {
                  range: $range(0, this.value.length),
                  link: this.value
                }
              ]
            },
            align: $align.right
          },
          layout: $layout.fill
        }
      ],
      layout: function(make, view) {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
      events: {
        tapped: sender => {
          $safari.open({
            url: classThis.value
          });
        }
      }
    };
  }
}

class ActionCell extends Cell {
  constructor(props) {
    super(props);
    const { buttonType = 0, buttonTitle } = props;
    this.buttonType = buttonType;
    this.buttonTitle = buttonTitle;
  }

  _defineValueView() {
    const classThis = this;
    if (this.buttonType === 0) {
      return {
        type: "button",
        props: {
          id: "valueView",
          title: this.buttonTitle,
          titleColor: $color("tintColor"),
          bgcolor: $color("clear"),
          radius: 0
        },
        layout: function(make, view) {
          make.top.bottom.inset(0);
          make.left.equalTo(view.prev.left);
          make.right.inset(15);
        },
        events: {
          tapped: function(sender) {
            classThis.value();
          }
        }
      };
    } else if (this.buttonType === 1) {
      return {
        type: "button",
        props: {
          id: "valueView",
          title: this.buttonTitle
        },
        layout: function(make, view) {
          make.top.bottom.inset(5);
          make.width.equalTo(100);
          make.right.inset(15);
        },
        events: {
          tapped: function(sender) {
            classThis.value();
          }
        }
      };
    }
  }
}

class ListView extends BaseView {
  constructor({ sections, props, layout }) {
    super();
    this.sections = sections;
    this._values = {};
    const excludedTypes = ["action", "info", "link"];
    sections.forEach(section => {
      section.rows.forEach(row => {
        if (row.key && !excludedTypes.includes(row.type)) {
          this._values[row.key] = row.value;
        }
      });
    });
    this._props = props;
    this._layout = layout;
  }

  _defineView() {
    return {
      type: "list",
      props: {
        ...this._props,
        id: this.id,
        data: this.sections.map(section => {
          const title = section.title;
          const rows = section.rows.map(
            props => this._createCell(props).definition
          );
          return { title, rows };
        })
      },
      layout: this._layout
    };
  }

  _createCell(props) {
    const map = {
      string: StringCell,
      number: NumberCell,
      integer: IntegerCell,
      password: PasswordCell,
      boolean: BooleanCell,
      slider: SliderCell,
      list: ListCell,
      segmentedControl: SegmentedControlCell,
      datetime: DatetimeCell,
      info: InfoCell,
      link: LinkCell,
      action: ActionCell
    };
    const type = props.type;
    const Cell = map[type];
    return new Cell(props, this._values);
  }

  get values() {
    return this._values;
  }
}

module.exports = ListView;
