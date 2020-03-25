const database = require("../utils/database");
const search = require("./search");

async function* generatorForSite({
  site,
  tags = [],
  limit = 50,
  random = false,
  startPage = 1
}) {
  let currentPage = startPage;
  let continueFlag = true;
  while (continueFlag) {
    try {
      const result = await search({
        site,
        tags,
        limit,
        random,
        page: currentPage
      });
      yield result;
      currentPage++;
    } catch (err) {
      continueFlag = false;
      return;
    }
  }
}

function* generatorForFavorites({ tags = [], site = null, startPage = 1 }) {
  let currentPage = startPage;
  const totalPage = Math.ceil(database.getPostCount() / 50);
  do {
    const items = database
      .searchPost({ tags, site, page: currentPage })
      .map(n => n.info);
    yield items;
    currentPage++;
  } while (currentPage <= totalPage);
}

module.exports = {
  generatorForSite,
  generatorForFavorites
};
