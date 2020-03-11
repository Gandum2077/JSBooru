const fix = require("./fix");

function booruSearch({ site, tags, limit, random, page }) {
  return new Promise((resolve, reject) => {
    $nodejs.run({
      path: "scripts/booru/booru.js",
      query: { site, tags, limit, random, page },
      listener: {
        id: "booruSearch",
        handler: result => {
          if (result.posts) {
            const fixedPosts = result.posts.map(n => fix(n));
            resolve(fixedPosts);
          } else {
            reject(result.error);
          }
        }
      }
    });
  });
}

module.exports = booruSearch;
