const Booru = require("booru");
const { BooruError, sites } = require("booru");

const {
  site = "safebooru",
  tags = [],
  limit = 50,
  random = false,
  page = 1
} = $context.query;
console.log("Node.js works");

function sendResult({ posts = null, error = null }) {
  $jsbox.notify("booruSearch", {
    posts,
    error
  });
}

function search({ site, tags, limit, random, page }) {
  // Search with promises
  Booru.search(site, tags, { limit, random, page })
    .then(posts => {
      //Log the direct link to each image
      sendResult(posts);
    })
    .catch(err => {
      if (err instanceof BooruError) {
        // It's a custom error thrown by the package
        // Typically results from errors the boorus returns, eg. "too many tags"
        sendResult({
          error: err.message
        });
      } else {
        // This means something pretty bad happened
        sendResult({
          error: err
        });
      }
    });
}

search({ site, tags, limit, random, page });
