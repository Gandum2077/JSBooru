const Sheet = require("../components/sheet");
const ListView = require("./listView");

/**
 * 实现formDialogs
 * @param {object} sections 定义formDialogs的内容
 * @param {?string} title 标题，将显示在titleBar
 * sections为Array，里面的section定义:
 *  title: string,  // 标题行，可选。
 *  rows: array,   // 内容，必要
 * rows为Array，里面的field定义:
 *  通用:
 *    type: string  // 类型，必要。包括'string', 'number', 'integer', 'password',
 *                     'boolean', 'slider', 'list', 'segmentedControl', 'datetime',
 *                     'info', 'link', 'action'
 *    key: string   // 键，可选。如没有key则不会返回其值。
 *    title: string // 标题，可选。供人阅读的标题。
 *    value: *      // 缺省值，可选。在下面专项里有详解。
 *    titleColor: $color  // title颜色，可选。
 *    icon: $image  // 图标，可选。
 *    iconColor: $color  // icon颜色，可选。
 *    iconEdgeInsets: $insets // 图标边距，可选。icon的size是锁定为$size(89/2, 89/2)的，
 *                               因此提供此参数缩小icon，默认$insets(12, 12, 12, 12)
 *
 *  专项：  // 一律可选，不标注的即对应原控件的属性
 *    string, number, integer, password:
 *      value: string  // 对于number和integer会自动转换格式
 *      autocorrectionType: 0,1,2   // 自动改正
 *      autocapitalizationType: 0,1,2,3  // 自动首字母大写
 *      spellCheckingType: 0,1,2  // 拼写检查
 *      placeholder
 *      textColor
 *    boolean:
 *      value: boolean
 *      onColor
 *      thumbColor
 *    slider:
 *      value: number  // 即slider.value
 *      decimal: number  // 精度，默认1
 *      min
 *      max
 *      minColor
 *      maxColor
 *      thumbColor
 *    list:
 *      value: string  // seleted item
 *      items
 *      listType: "menu", "popover"
 *    segmentedControl:
 *      value: number  // 即index，-1时为不选
 *      items
 *    datetime:
 *      value: Date object  // min和max也要求Date object
 *      min
 *      max
 *      mode
 *      interval
 *    info:
 *      value: string
 *    link:
 *      value: string  // url
 *    action:
 *      value: function // 点击后会执行的函数
 *      buttonTitle: button的标题
 *      buttonType: 0, 1  // 0代表按钮占满整格，1代表按钮在右侧
 *
 */

function presentSheet({ title, sections, presentMode = 1 }) {
  const listView = new ListView({ sections });
  const sheet = new Sheet({
    title,
    presentMode,
    view: listView.definition,
    doneEvent: sender => listView.values
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}

function formDialogs({ title = "", sections, presentMode }) {
  if (presentMode === undefined) {
    presentMode = $device.isIpad ? 2 : 1;
  }
  return presentSheet({ title, sections, presentMode });
}

module.exports = formDialogs;
