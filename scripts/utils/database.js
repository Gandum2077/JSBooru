const { databaseFile } = require("scripts/utils/constants")

function createDB() {
  if ($file.exists(databaseFile)) {
    $file.delete(databaseFile)
  };
  const db = $sqlite.open(databaseFile);
  db.update(`CREATE TABLE favorites (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        site TEXT,
        id TEXT,
        preview_url TEXT,
        info TEXT)`)
  $sqlite.close(db)
}

function insertFavorite({
  site,
  id,
  preview_url,
  info
}) {
  const db = $sqlite.open(databaseFile)
  db.update({
    sql: "DELETE FROM favorites WHERE site=? AND id=?",
    args: [site, id]
  })
  db.update({
    sql: "INSERT INTO favorites (site, id, preview_url, info) VALUES (?,?,?,?)",
    args: [
      site,
      id,
      preview_url,
      JSON.stringify(info)
    ]
  });
  $sqlite.close(db)
}

function deleteFavorite({
  site,
  id
}) {
  const db = $sqlite.open(databaseFile);
  db.update({
    sql: "DELETE FROM favorites WHERE site=? AND id=?",
    args: [site, id]
  })
  $sqlite.close(db)
}

function search(clause, args = null) {
  const db = $sqlite.open(databaseFile)
  const result = []
  db.query({
    sql: clause,
    args: args
  }, (rs, err) => {
    while (rs.next()) {
      const values = rs.values
      result.push(values)
    }
    rs.close()
  })
  $sqlite.close(db)
  return result
}

function handleQuery({
  page = 1,
  site = null
}) {
  const condition_clauses = []
  const args = []
  if (site) {
    condition_clauses.push("(site = ?)")
    args.push(site)
  }
  let where_clause = ''
  if (condition_clauses.length) {
    where_clause = ' WHERE ' + condition_clauses.join(' AND ')
  }
  const sort_clause = ' ORDER BY order_id DESC'
  const limit_clause = ' LIMIT 50 OFFSET ' + (parseInt(page) - 1) * 50
  return {
    clause: "SELECT DISTINCT * FROM favorites" + where_clause + sort_clause + limit_clause,
    args: args
  }
}

function searchFavorites({
  site = null,
  page = 1
}) {
  const { clause, args } = handleQuery({ site, page })
  const result = search(clause, args)
  return result.map(n => {
    return {
      site_id: n.site_id,
      id: n.id,
      thumbnail_url: n.thumbnail_url,
      info: JSON.parse(n.info)
    }
  })
}

function getCount() {
  const clause = "SELECT COUNT() FROM favorites"
  const result = search(clause)
  return Object.values(result[0])[0]
}

module.exports = {
  createDB,
  insertFavorite,
  deleteFavorite,
  searchFavorites,
  getCount
}