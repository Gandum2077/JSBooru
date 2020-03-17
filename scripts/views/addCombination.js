const formDialogs = require("../dialogs/formDialogs");

async function addCombination({
  title = $l10n("ADD_COMBINATION_TITLE"),
  combination_name,
  combination_title
} = {}) {
  const sections = [
    {
      title: $l10n("COMBINATION"),
      rows: [
        {
          type: "string",
          title: $l10n("CONTENT"),
          key: "combination_name",
          value: combination_name,
          placeholder: $l10n("REQUIRED")
        },
        {
          type: "string",
          title: $l10n("TITLE"),
          key: "combination_title",
          value: combination_title,
          placeholder: $l10n("OPTIONAL")
        }
      ]
    }
  ];
  const result = await formDialogs({ sections, title });
  return result;
}

module.exports = addCombination;
