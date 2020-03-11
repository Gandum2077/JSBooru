class ID {
  constructor({ prefix = "id_", startNumber = 0 } = {}) {
    this.prefix = prefix;
    this.number = startNumber;
    this._aliasIds = {};
  }

  get newId() {
    return this.generateNewIdWithAlias()
  }

  generateNewIdWithAlias(alias) {
    const number = this.number;
    this.number++;
    const id = this.prefix + number;
    if (alias) {
      this._addIdToAlias(alias, id);
    }
    return id;
  }

  getAliasId(alias) {
    const ids = this._aliasIds[alias];
    if (ids) {
      return ids[0];
    } else {
      return;
    }
  }

  getAliasAllIds(alias) {
    const ids = this._aliasIds[alias];
    if (ids) {
      return ids;
    } else {
      return;
    }
  }

  _addIdToAlias(alias, id) {
    if (!this._aliasIds[alias]) this._aliasIds[alias] = [];
    this._aliasIds[alias].push(id);
  }
}

const idManager = new ID();

module.exports = idManager;
