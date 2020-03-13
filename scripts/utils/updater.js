function checkLatestVersion() {
  const current_version = JSON.parse($file.read("config.json").string).info
    .version;
  const url = "https://api.github.com/repos/Gandum2077/JSBooru/releases/latest";
  $http.get({
    url: url,
    timeout: 10,
    handler: function(resp) {
      if (resp.data && resp.response.statusCode === 200) {
        const info = resp.data;
        const latest_version = info["tag_name"];
        if (current_version !== latest_version) {
          $ui.toast($l10n("UPDATE_TIPS"));
        }
      }
    }
  });
}

module.exports = {
  checkLatestVersion
};
