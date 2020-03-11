const database = require("../utils/database");
const { searchTag } = require("./api");
const { getCategory } = require("./category");

async function getTagInfo(name) {
  const category = getCategory(name);
  if (category !== "plain") {
    throw new Error(category);
  } else {
    const queryResult = database.searchTag(name);
    if (queryResult) return queryResult;
    const searchResult = await searchTag(name);
    database.insertTag(searchResult);
    return searchResult;
  }
}

module.exports = getTagInfo;
