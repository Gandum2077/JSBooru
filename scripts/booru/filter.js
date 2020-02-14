function safeSearchFilter(items) {
  return items.filter(n => n.rating === 's')
}

module.exports = {
  safeSearchFilter
}