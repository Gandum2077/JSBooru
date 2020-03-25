const { databaseFile } = require("./constants");

class Database {
  constructor(databaseFile) {
    this.databaseFile = databaseFile;
    if (!$file.exists(this.databaseFile)) {
      this.createDB();
    }
    this.openDB();
  }

  createDB() {
    if ($file.exists(this.databaseFile)) {
      $file.delete(this.databaseFile);
    }
    const db = $sqlite.open(this.databaseFile);
    db.update(`CREATE TABLE posts (
              order_id INTEGER PRIMARY KEY AUTOINCREMENT,
              site TEXT,
              id TEXT,
              preview_url TEXT,
              info TEXT,
              tags TEXT,
              favorited INTEGER
              )`);
    db.update(`CREATE TABLE tags (
              id INTEGER PRIMARY KEY, 
              name TEXT,
              category_name INTEGER,
              other_names TEXT,
              wiki TEXT
              )`); // id: danbooru_tag_id; category_name: 0, 1, 3, 4 (general, artist, copyright, character)
    db.update(`CREATE TABLE saved_tags (
              name TEXT PRIMARY KEY,
              title TEXT,
              category TEXT,
              favorited INTEGER
              )`);
    db.update(`CREATE TABLE saved_combinations (
              name TEXT PRIMARY KEY,
              title TEXT
              )`);
    db.commit();
    $sqlite.close(db);
  }

  openDB() {
    this.db = $sqlite.open(this.databaseFile);
  }

  closeDB() {
    $sqlite.close(this.db);
  }

  search(clause, args = null) {
    const result = [];
    this.db.query(
      {
        sql: clause,
        args: args
      },
      (rs, err) => {
        while (rs.next()) {
          const values = rs.values;
          result.push(values);
        }
        rs.close();
      }
    );
    return result;
  }

  deletePost({ site, id }) {
    this.db.update({
      sql: "DELETE FROM posts WHERE site=? AND id=?",
      args: [site, id]
    });
    this.db.commit();
  }

  insertPost({ info, favorited }) {
    const { id, previewUrl: preview_url } = info;
    const site = info.booru.domain;
    const tags = " " + info.tags.join(" ") + " ";
    this.deletePost({ site, id });
    this.db.update({
      sql:
        "INSERT INTO posts (site, id, preview_url, info, tags, favorited) VALUES (?,?,?,?,?,?)",
      args: [site, id, preview_url, JSON.stringify(info), tags, favorited]
    });
    this.db.commit();
  }

  queryPostFavorited({ site, id }) {
    const clause = "SELECT favorited FROM posts WHERE site=? AND id=? LIMIT 1";
    const args = [site, id];
    const result = this.search(clause, args);
    if (result.length) {
      return result[0]["favorited"] ? true : false;
    } else {
      return false;
    }
  }

  updatePostFavorited({ site, id, favorited = true }) {
    this.db.update({
      sql: "UPDATE posts SET favorited = ? WHERE site=? AND id=?",
      args: [favorited, site, id]
    });
    this.db.commit();
  }

  searchPost({ site = null, page = 1, favorited = true } = {}) {
    const { clause, args } = this.handleQuery({ site, page, favorited });
    const result = this.search(clause, args);
    return result.map(n => {
      return {
        site_id: n.site_id,
        id: n.id,
        thumbnail_url: n.thumbnail_url,
        info: JSON.parse(n.info),
        favorited: n.favorited ? true : false
      };
    });
  }

  handleQuery({ page = 1, site = null, favorited = true }) {
    const condition_clauses = [];
    const args = [];
    if (site) {
      condition_clauses.push("(site = ?)");
      args.push(site);
    }
    if (favorited) {
      condition_clauses.push("(favorited = ?)");
      args.push(favorited);
    }
    let where_clause = "";
    if (condition_clauses.length) {
      where_clause = " WHERE " + condition_clauses.join(" AND ");
    }
    const sort_clause = " ORDER BY order_id DESC";
    const limit_clause = " LIMIT 50 OFFSET " + (parseInt(page) - 1) * 50;
    return {
      clause:
        "SELECT DISTINCT * FROM posts" +
        where_clause +
        sort_clause +
        limit_clause,
      args: args
    };
  }

  getRandomPost({ limit = 4 } = {}) {
    const clause =
      "SELECT * FROM posts WHERE order_id IN (SELECT order_id FROM posts ORDER BY RANDOM() LIMIT ?)";
    const args = [limit];
    const result = this.search(clause, args);
    return result.map(n => {
      return {
        site_id: n.site_id,
        id: n.id,
        thumbnail_url: n.thumbnail_url,
        info: JSON.parse(n.info),
        favorited: n.favorited ? true : false
      };
    });
  }

  getPostCount(favorited = true) {
    const where_clause = favorited ? " WHERE favorited = 1" : "";
    const clause = "SELECT COUNT() FROM posts" + where_clause;
    const result = this.search(clause);
    return Object.values(result[0])[0];
  }

  deleteTag({ id, name }) {
    if (id) {
      this.db.update({
        sql: "DELETE FROM tags WHERE id=?",
        args: [id]
      });
    } else if (name) {
      this.db.update({
        sql: "DELETE FROM tags WHERE name=?",
        args: [name]
      });
    }
    this.db.commit();
  }

  insertTag({ id, name, category_name, other_names, wiki }) {
    this.deleteTag({ id });
    const other_names_json =
      other_names && other_names.length ? JSON.stringify(other_names) : null;
    this.db.update({
      sql:
        "INSERT INTO tags (id, name, category_name, other_names, wiki) VALUES (?,?,?,?,?)",
      args: [id, name, category_name, other_names_json, wiki]
    });
    this.db.commit();
  }

  searchTag(name) {
    const clause = "SELECT * FROM tags WHERE name = ? LIMIT 1";
    const args = [name];
    const result = this.search(clause, args);
    if (result.length) {
      const info = result[0];
      info.other_names = JSON.parse(info.other_names);
      return info;
    } else {
      return null;
    }
  }

  deleteSavedTag(name) {
    this.db.update({
      sql: "DELETE FROM saved_tags WHERE name=?",
      args: [name]
    });
    this.db.commit();
  }

  insertSavedTag({ name, title, category, favorited }) {
    this.db.update({
      sql:
        "INSERT INTO saved_tags (name, title, category, favorited) VALUES (?,?,?,?)",
      args: [name, title, category, favorited]
    });
    this.db.commit();
  }

  searchSavedTag(name) {
    const clause = "SELECT * FROM saved_tags WHERE name = ? LIMIT 1";
    const args = [name];
    const result = this.search(clause, args);
    if (result.length) {
      const info = result[0];
      return info;
    } else {
      return null;
    }
  }

  updateSavedTag({ name, title, category, favorited }) {
    this.db.update({
      sql:
        "UPDATE saved_tags SET title = ?, category = ?, favorited = ? WHERE name=?",
      args: [title, category, favorited, name]
    });
    this.db.commit();
  }

  getAllSavedTags() {
    const clause = "SELECT * FROM saved_tags";
    const result = this.search(clause);
    if (result.length) {
      return result;
    } else {
      return null;
    }
  }

  getAllFavoritedSavedTags() {
    const clause = "SELECT * FROM saved_tags WHERE favorited = 1";
    const result = this.search(clause);
    if (result.length) {
      return result;
    } else {
      return null;
    }
  }

  getSavedTagsByCategory(category) {
    const clause = category
      ? "SELECT * FROM saved_tags WHERE category=?"
      : "SELECT * FROM saved_tags WHERE category IS NULL";
    const args = category ? [category] : null;
    const result = this.search(clause, args);
    if (result.length) {
      return result;
    } else {
      return null;
    }
  }

  safeAddSavedTag({ name, title, category, favorited }) {
    if (!name) return;
    if (!title) title = null;
    const result = this.searchSavedTag(name);
    if (result) {
      this.updateSavedTag({ name, title, category, favorited });
    } else {
      this.insertSavedTag({ name, title, category, favorited });
    }
  }

  renameCategory(oldname, newname) {
    if (!newname) newname = null;
    this.db.update({
      sql: "UPDATE saved_tags SET category = ? WHERE category = ?",
      args: [newname, oldname]
    });
    this.db.commit();
  }

  deleteSavedCombination(name) {
    this.db.update({
      sql: "DELETE FROM saved_combinations WHERE name=?",
      args: [name]
    });
    this.db.commit();
  }

  insertSavedCombination({ name, title }) {
    this.db.update({
      sql: "INSERT INTO saved_combinations (name, title) VALUES (?,?)",
      args: [name, title]
    });
    this.db.commit();
  }

  updateSavedCombination({ name, title }) {
    this.db.update({
      sql: "UPDATE saved_combinations SET title = ? WHERE name=?",
      args: [title, name]
    });
    this.db.commit();
  }

  searchSavedCombination(name) {
    const clause = "SELECT * FROM saved_combinations WHERE name = ? LIMIT 1";
    const args = [name];
    const result = this.search(clause, args);
    if (result.length) {
      const info = result[0];
      return info;
    } else {
      return null;
    }
  }

  getAllSavedCombinations() {
    const clause = "SELECT * FROM saved_combinations";
    const result = this.search(clause);
    if (result.length) {
      return result;
    } else {
      return null;
    }
  }

  safeAddCombination({ name, title }) {
    if (!name) return;
    if (!title) title = null;
    const result = this.searchSavedCombination(name);
    if (result) {
      this.updateSavedCombination({ name, title });
    } else {
      this.insertSavedCombination({ name, title });
    }
  }
}

const database = new Database(databaseFile);

module.exports = database;
