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
          const url = info.assets[0].browser_download_url;
          $ui.alert({
            title: $l10n("UPDATE_TIPS") + " " + latest_version,
            message: info.body,
            actions: [
              {
                title: $l10n("CANCEL_UPDATE")
              },
              {
                title: $l10n("CONFIRM_UPDATE"),
                handler: async () => {
                  const { data } = await $http.download({ 
                    url,
                    showsProgress: true,
                    backgroundFetch: false
                  });
                  $addin.save({
                    name: "JSBooru",
                    data,
                    handler: success => $addin.restart()
                  })
                }
              }
            ]
          });
        }
      }
    }
  });
}

module.exports = {
  checkLatestVersion
};
