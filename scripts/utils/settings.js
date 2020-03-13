const constants = require("./constants");
const database = require("./database");

function rebuildDatabase() {
  $ui.alert({
    title: $l10n("REBUILD_DATABASE_TIPS"),
    actions: [
      {
        title: $l10n("CANCEL")
      },
      {
        title: $l10n("OK"),
        handler: () => {
          database.closeDB();
          database.createDB();
          database.openDB();
          $ui.toast($l10n("FINISHED"));
        }
      }
    ]
  });
}

function reset() {
  $ui.alert({
    title: $l10n("RESET_TIPS"),
    actions: [
      {
        title: $l10n("CANCEL")
      },
      {
        title: $l10n("OK"),
        handler: () => {
          database.closeDB();
          database.createDB();
          if ($file.exists("assets/.files")) $file.delete("assets/.files");
          if ($file.exists(constants.userConfigFile))
            $file.delete(constants.userConfigFile);
          $addin.restart();
        }
      }
    ]
  });
}

module.exports = {
  rebuildDatabase,
  reset
};
