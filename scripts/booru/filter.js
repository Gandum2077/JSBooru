function safeSearchFilter(items) {
  return items.filter(n => n.rating === "s");
}

function nonauthorizedFilter(items) {
  return items.filter(n => n.previewUrl)
}

module.exports = {
  safeSearchFilter,
  nonauthorizedFilter
};
