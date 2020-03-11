const urlParse = require("../modules/url-parse");

const BASE_URL = "https://danbooru.donmai.us";
const TAGS_URL = "/tags.json";
const WIKI_PAGE_URL = "/wiki_pages.json";
const ARTISTS_URL = "/artists.json";

async function request(url) {
  const { data, response, error } = await $http.get({ url, timeout: 5 });
  if (!error && response.statusCode === 200) {
    return data;
  } else {
    throw new Error("network error");
  }
}

function check(data) {
  if (data.length !== 1) return;
  return true;
}

function createUrlForSearchTagByName(name) {
  const url = urlParse(BASE_URL, true);
  url.set("pathname", TAGS_URL);
  url.query = { "search[name]": name };
  return url.toString();
}

function createUrlForSearchWikiPageByTitle(title) {
  const url = urlParse(BASE_URL, true);
  url.set("pathname", WIKI_PAGE_URL);
  url.query = { "search[title]": title };
  return url.toString();
}

function createUrlForSearchArtistByName(name) {
  const url = urlParse(BASE_URL, true);
  url.set("pathname", ARTISTS_URL);
  url.query = { "search[name]": name };
  return url.toString();
}

async function searchTagByName(name) {
  const url = createUrlForSearchTagByName(name);
  const data = await request(url);
  if (check(data)) {
    return data[0];
  } else {
    throw new Error("error on search");
  }
}

async function searchWikiPageByTitle(title) {
  const url = createUrlForSearchWikiPageByTitle(title);
  const data = await request(url);
  if (check(data)) {
    return data[0];
  } else {
    throw new Error("error on search");
  }
}

async function searchArtistByName(name) {
  const url = createUrlForSearchArtistByName(name);
  const data = await request(url);
  if (check(data)) {
    return data[0];
  } else {
    throw new Error("error on search");
  }
}

async function searchTag(name) {
  const { id, category: category_name } = await searchTagByName(name); // category, id
  if (category_name === 1) {
    const { other_names } = await searchArtistByName(name);
    return {
      id,
      name,
      category_name,
      other_names,
      wiki: null
    };
  } else {
    const { other_names, body: wiki } = await searchWikiPageByTitle(name);
    return {
      id,
      name,
      category_name,
      other_names,
      wiki
    };
  }
}

module.exports = {
  searchTag
};
