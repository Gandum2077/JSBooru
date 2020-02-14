const constants = require("scripts/utils/constants")
const { createDB } = require("scripts/utils/database")

function clearCache() {
  $ui.alert({
    title: "Sure to clear download cache?",
    actions: [
      {
        title: "Cancel"
      }, 
      {
        title: "OK",
        handler: () => {
          $file.delete(constants.imagePath)
          $file.mkdir(constants.imagePath)
          $ui.toast("Finished")
        }
      }
    ]
  })
}

function rebuildDatabase() {
  $ui.alert({
    title: "Sure to rebuild database?",
    actions: [
      {
        title: "Cancel"
      }, 
      {
        title: "OK",
        handler: () => {
          createDB()
          $ui.toast("Finished")
        }
      }
    ]
  })
}


function reset() {
  $ui.alert({
    title: "Sure to reset?",
    actions: [
      {
        title: "Cancel"
      }, 
      {
        title: "OK",
        handler: () => {
          $file.delete(constants.imagePath)
          $file.mkdir(constants.imagePath)
          createDB()
          $prefs.set("default_site", 5)
          $prefs.set("safe_search", true)
          $ui.toast("Finished")
        }
      }
    ]
  })
}

module.exports = {
  clearCache,
  rebuildDatabase,
  reset
}
