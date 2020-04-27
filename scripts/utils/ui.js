// 立即获得window size
function getWindowSize() {
  const window = $objc("UIWindow")
    .$keyWindow()
    .jsValue();
  return window.size;
}

// 获取指定字符串应有的长度
function getTextWidth(text, { font = $font(17) } = {}) {
  return (
    Math.ceil(
      $text.sizeThatFits({
        text,
        width: 10000,
        font,
        lineSpacing: 0
      }).width
    ) + 3
  );
}

module.exports = {
  getWindowSize,
  getTextWidth
};
