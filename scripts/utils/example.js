const database = require("./database");
const constants = require("./constants");

const example_categories = ["Meta Tags", "示例分类"];

const example_saved_tags = [
  {
    name: "summer",
    title: "示例1",
    category: "示例分类",
    favorited: true
  },
  {
    name: "order:rank",
    category: "Meta Tags",
    favorited: false
  },
  {
    name: "beach",
    favorited: false
  }
];

const example_saved_combinations = [
  {
    name: "summer beach",
    title: "夏日海边"
  }
];

function insertExampleData() {
  example_saved_tags.forEach(tag => database.insertSavedTag(tag));
  example_saved_combinations.forEach(combination =>
    database.insertSavedCombination(combination)
  );
  constants.userConfig.saveTagCategoires(example_categories);
}

module.exports = {
  insertExampleData
};
