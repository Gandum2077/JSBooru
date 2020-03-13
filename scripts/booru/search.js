const fix = require("./fix");

function booruSearch({ site, tags, limit, random, page }) {
  return new Promise((resolve, reject) => {
    $nodejs.run({
      path: "scripts/booru/booru.js",
      query: { site, tags, limit, random, page },
      listener: {
        id: "booruSearch",
        handler: ({ posts, error }) => {
          if (posts) {
            //console.info(posts);
            const fixedPosts = posts.map(n => fix(n));
            resolve(fixedPosts);
          } else {
            console.info(error);
            reject(error);
          }
        }
      }
    });
  });
}

module.exports = booruSearch;
