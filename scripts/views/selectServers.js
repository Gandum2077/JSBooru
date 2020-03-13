const listDialogs = require("../dialogs/listDialogs");
const constants = require("../utils/constants");

function map(items) {
  const colors = {
    recommand: "#006600",
    good: "#00bb00",
    fixed: "#00bb00",
    unstable: "orange",
    slow: "orange",
    bad: "red"
  };
  const statuses = {
    recommand: $l10n("STATUS_RECOMMAND"),
    good: $l10n("STATUS_GOOD"),
    fixed: $l10n("STATUS_FIXED"),
    unstable: $l10n("STATUS_UNSTABLE"),
    slow: $l10n("STATUS_SLOW"),
    bad: $l10n("STATUS_BAD")
  };
  return items.map(n => {
    return {
      styledText: {
        text: statuses[n.status] + "  " + n.name,
        font: $font(17),
        color: $color("black"),
        styles: [
          {
            range: $range(0, statuses[n.status].length),
            bgcolor: $color(colors[n.status]),
            color: $color("white")
          }
        ]
      }
    };
  });
}

async function selectServers(site) {
  const currentIndex = constants.sitesConfig.findIndex(n => n.name === site);
  const result = await listDialogs({
    title: $l10n("SERVERS"),
    items: map(constants.sitesConfig),
    multiSelectEnabled: false,
    value: currentIndex
  });
  const newSite = constants.sitesConfig[result].name;
  return newSite;
}

module.exports = selectServers;
