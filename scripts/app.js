const Controller = require("./control/main");
const constants = require("./utils/constants");
const { insertExampleData } = require("./utils/example");
const { checkLatestVersion } = require("./utils/updater");

async function init() {
  try {
    const controller = new Controller({
      footerBarIndex: $prefs.get("favorites_on_startup") ? 1 : 0
    });
    controller.render();
    if (constants.userConfig.inset_example_data) {
      insertExampleData();
      constants.userConfig.inset_example_data = false;
      constants.userConfig.save();
    }
    if (constants.userConfig.show_tips) {
      const { index } = await $ui.alert({
        title: $l10n("TIPS"),
        message: $l10n("TIPS_CONTENT"),
        actions: [
          { title: $l10n("CANCEL_TEXT") },
          { title: $l10n("CONFIRM_TEXT") }
        ]
      });
      if (index) {
        constants.userConfig.closeTips();
        checkLatestVersion();
        await $wait(0.3);
        controller.loadFavorites();
        await controller.loadBooru({ useUiLoading: false });
      } else {
        $app.close();
      }
    } else {
      checkLatestVersion();
      await $wait(0.3);
      controller.loadFavorites();
      await controller.loadBooru();
    }
  } catch (e) {
    console.info(e);
  }
}

module.exports = {
  init
};
