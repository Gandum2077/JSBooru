/**
 * 自定义的颜色配置
 * 9种语义化颜色，以及clear、white、black、red（仅用于特殊语义环境，比如删除、收藏）四种不在此处记录
 * 
 */

module.exports = {
  sheetNavBarColor: $color("tint", $color("secondarySurface")),
  footBarDefaultSegmentColor: $color("#b7bec6", "#6e6e6e"),
  //fixedSecondarySurface: $color("#f2f2f7", $color("secondarySurface")), // 让 secondarySurface 在light mode下可以和纯白区分
  searchBarSymbolColor: $color("#777", "#aaa"),
  searchBarInputColor: $color("#e0e1e3", "secondarySurface"),
  gold: $color("#ffd700"),
  sectionHeaderColor: $color({
    light: "#666666",
    dark: "#acacac",
    black: "#ababab"
  })
};
