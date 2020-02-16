function booruSearch({ site, tags, limit, random, page }) {
  return new Promise((resolve, reject) => {
    $nodejs.run({
      path: "scripts/booru/booru.js",
      query: { site, tags, limit, random, page },
      listener: {
        id: "booruSearch",
        handler: result => {
          if (result.posts) {
            resolve(result.posts);
          } else {
            reject(result.error);
          }
        }
      }
    });
  });
}

module.exports = booruSearch;
