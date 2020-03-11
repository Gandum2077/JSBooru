const Controller = require("./controller");
const plainAlert = require("./dialogs/plainAlert");
const constants = require("./utils/constants");
const { insertExampleData } = require("./utils/example");
const { checkLatestVersion } = require("./utils/updater")

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
      try {
        await plainAlert({
          title: $l10n("TIPS"),
          message: $l10n("TIPS_CONTENT"),
          cancelText: $l10n("CANCEL_TEXT"),
          confirmText: $l10n("CONFIRM_TEXT")
        });
        constants.userConfig.closeTips();
        controller.loadFavorites();
        checkLatestVersion()
        await $wait(0.3);
        await controller.loadBooru({ useUiLoading: false });
      } catch (err) {
        $app.close();
      }
    } else {
      controller.loadFavorites();
      checkLatestVersion()
      await $wait(0.3);
      await controller.loadBooru();
    }
  } catch (e) {
    console.info(e);
  }
}

module.exports = {
  init
};
