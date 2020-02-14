const imagePath = "image"
const sitesConfigFile = 'scripts/utils/sites.json'
const userConfigFile = 'assets/userConfig.json'
const databaseFile = "assets/favorites.db"

const sitesConfig = JSON.parse($file.read(sitesConfigFile).string)
const userConfig = {}
const defaultUserConfig = {
  sites_order: Object.keys(sitesConfig),
  temp_tags: [],
  stored_tags: []
}

function initConfig() {
  if (!$file.exists(userConfigFile)) {
    $file.write({
      data: $data({string: JSON.stringify(defaultUserConfig, null, 2)}),
      path: userConfigFile
    })
  }
  Object.assign(userConfig, JSON.parse($file.read(userConfigFile).string))
}

function saveConfig() {
  $file.write({
    data: $data({string: JSON.stringify(userConfig, null, 2)}),
    path: userConfigFile
  })
}

module.exports = {
  imagePath,
  databaseFile,
  sitesConfig,
  userConfig,
  initConfig,
  saveConfig
}

