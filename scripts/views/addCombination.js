const formDialogs = require("../dialogs/formDialogs");

async function addCombination({ name, title } = {}) {
  const sections = [
    {
      title: $l10n("COMBINATION"),
      rows: [
        {
          type: "string",
          title: $l10n("CONTENT"),
          key: "name",
          value: name,
          placeholder: $l10n("REQUIRED")
        },
        {
          type: "string",
          title: $l10n("TITLE"),
          key: "title",
          value: title,
          placeholder: $l10n("OPTIONAL")
        }
      ]
    }
  ];
  const result = await formDialogs({
    sections,
    title: $l10n("ADD_COMBINATION_TITLE")
  });
  return result;
}

module.exports = addCombination;
