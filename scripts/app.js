const constants = require("scripts/utils/constants");
const listView = require("scripts/views/listView");
const { createDB } = require("scripts/utils/database");

function initDatabase() {
  if (!$file.exists(constants.databaseFile)) {
    createDB();
  }
}

function checkPrefs() {
  const intervals = $prefs.get("slideshow_intervals");
  if (intervals < 1 || intervals > 30) {
    $prefs.set("slideshow_intervals", 5);
  }
}

async function init() {
  constants.initConfig();
  initDatabase();
  checkPrefs();
  await listView();
  $app.tips("右上角按钮 - Servers切换站点，Settings进行设置，Help查看帮助");
}

module.exports = {
  init
};
