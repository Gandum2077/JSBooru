const sitesConfigFile = "scripts/utils/siteInfos.json";
const userConfigFile = "assets/userConfig.json";

const databaseFile = "assets/database.db";
const savedTagsFile = "assets/savedTags.json";
const favoritedTagsFile = "assets/favoritedTags.json";
const tagCombinationsFile = "assets/tagCombinations.json";

const icloudSyncPath = "drive://_JSBooruSync";
const databaseFileOnIcloud = "drive://_JSBooruSync/database.db";

const sitesConfig = JSON.parse($file.read(sitesConfigFile).string);

class UserConfig {
  constructor(file) {
    this.file = file;
    this.defaultConfig = {
      inset_example_data: true,
      show_tips: true,
      search_history: [],
      tag_categoires: []
    };
    if (!$file.exists(this.file)) this.create();
    this.open();
  }

  create() {
    if ($file.exists(this.file)) $file.delete(this.file);
    $file.write({
      data: $data({ string: JSON.stringify(this.defaultConfig, null, 2) }),
      path: this.file
    });
  }

  open() {
    Object.assign(this, JSON.parse($file.read(this.file).string));
  }

  save() {
    const filtered = {
      inset_example_data: this.inset_example_data,
      show_tips: this.show_tips,
      search_history: this.search_history,
      tag_categoires: this.tag_categoires
    };
    $file.write({
      data: $data({ string: JSON.stringify(filtered, null, 2) }),
      path: this.file
    });
  }

  clear() {
    this.content = this.defaultConfig;
    this.save();
  }

  addSearchHistory(text) {
    if (!text) return;
    const index = this.search_history.indexOf(text);
    if (index !== -1) {
      this.search_history.splice(index, 1);
    }
    this.search_history.unshift(text);
    if (this.search_history.length > 10) {
      this.search_history.splice(10);
    }
    this.save();
  }

  saveTagCategoires(tag_categoires) {
    if (tag_categoires.find(n => !n)) throw new Error("Null is not allowed");
    if (find_duplicate_in_array(tag_categoires).length)
      throw new Error("Duplicate values are not allowed");
    this.tag_categoires = tag_categoires;
    this.save();
  }

  closeTips() {
    this.show_tips = false;
    this.save();
  }
}

function find_duplicate_in_array(arra1) {
  const object = {};
  const result = [];

  arra1.forEach(item => {
    if (!object[item]) object[item] = 0;
    object[item] += 1;
  });

  for (const prop in object) {
    if (object[prop] >= 2) {
      result.push(prop);
    }
  }

  return result;
}

const userConfig = new UserConfig(userConfigFile);

module.exports = {
  userConfigFile,
  databaseFile,
  savedTagsFile,
  favoritedTagsFile,
  tagCombinationsFile,
  icloudSyncPath,
  databaseFileOnIcloud,
  sitesConfig,
  userConfig
};
