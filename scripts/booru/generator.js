const { searchFavorites, getCount } = require('scripts/utils/database')
const search = require('./search')

async function* generatorForSite({
  site,
  tags = [],
  limit = 50,
  random = false,
  startPage = 1
}) {
  let currentPage = startPage
  let continueFlag = true
  while (continueFlag) {
    try {
      const result = await search({
        site,
        tags,
        limit,
        random,
        page: currentPage
      })
      yield result
      currentPage++
    } catch(err) {
      continueFlag = false
      console.error(result)
      return
    }
  }
}

async function* generatorForFavorites({
  site = null,
  startPage = 1
}) {
  let currentPage = startPage
  const totalPage = Math.ceil(getCount() / 50)
  do {
    const items = searchFavorites({
      site, 
      page: currentPage
    })
    yield items
    currentPage++
  }  while (currentPage < totalPage)
}

module.exports = {
  generatorForSite,
  generatorForFavorites
}