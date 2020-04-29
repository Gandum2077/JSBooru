const constants = require("./constants");

class IcloudManager {
  constructor(
    path = constants.icloudSyncPath,
    databaseFile = constants.databaseFileOnIcloud
  ) {
    this.path = path;
    this.databaseFile = databaseFile;
    this.initial();
  }

  initial() {
    if (!$file.exists(this.path)) $file.mkdir(this.path);
  }

  copyDatabaseToIcloud() {
    this.initial()
    if (!$file.exists(this.databaseFile)) return false;
    return $file.copy({
      src: constants.databaseFile,
      dst: this.databaseFile
    });
  }

  copyDatabaseFromIcloud() {
    if (!$file.exists(this.databaseFile)) return false;
    return $file.copy({
      src: this.databaseFile,
      dst: constants.databaseFile
    });
  }
}

const icloudManager = new IcloudManager();

module.exports = icloudManager;
