/**
 * 自定义的颜色配置
 * 不在此处记录的颜色只有9种语义化颜色，以及clear、white、black、red（仅用于特殊语义环境，比如删除、收藏）四种
 * 其余一律写在此处
 * 
 */

module.exports = {
  sheetNavBarColor: $color("tint", $color("secondarySurface")),
  footBarDefaultSegmentColor: $color("#b7bec6", "#6e6e6e"),
  fixedSecondarySurface: $color("#f2f2f7", $color("secondarySurface")), // 让 secondarySurface 在light mode下可以和纯白区分
  gold: $color("#ffd700")
};
