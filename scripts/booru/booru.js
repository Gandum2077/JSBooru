const Booru = require("booru");

const {
  site = "safebooru",
  tags = [],
  limit = 50,
  random = false,
  page = 1
} = $context.query;
//console.log(site, tags);

// Search with promises
Booru.search(site, tags, { limit, random, page })
  .then(posts => {
    //Log the direct link to each image
    $jsbox.notify("booruSearch", { posts });
  })
  .catch(err => {
    if (err instanceof Booru.BooruError) {
      // It's a custom error thrown by the package
      // Typically results from errors the boorus returns, eg. "too many tags"
      $jsbox.notify("booruSearch", { error: err.message });
    } else {
      // This means something pretty bad happened
      $jsbox.notify("booruSearch", { error: err });
    }
  });
