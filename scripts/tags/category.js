const metatags_prenames = [
  "user",
  "-user",
  "approver",
  "-approver",
  "commenter",
  "comm",
  "noter",
  "artcomm",
  "pool",
  "-pool",
  "newpool",
  "ordpool",
  "fav",
  "-fav",
  "ordfav",
  "favgroup",
  "-favgroup",
  "search",
  "md5",
  "rating",
  "-rating",
  "locked",
  "-locked",
  "width",
  "height",
  "mpixels",
  "ratio",
  "score",
  "favcount",
  "filesize",
  "filetype",
  "source",
  "-source",
  "id",
  "date",
  "age",
  "status",
  "-status",
  "order",
  "tagcount",
  "gentags",
  "arttags",
  "chartags",
  "copytags",
  "metatags",
  "parent",
  "-parent",
  "child",
  "-child",
  "pixiv_id",
  "pixiv",
  "limit",
  "upvote",
  "downvote"
];

const suffixes_status = [
  "pending",
  "flagged",
  "deleted",
  "banned",
  "active",
  "any",
  "all"
];

const suffixes_order = [
  "id",
  "id_asc",
  "id_desc",
  "score",
  "score_desc",
  "score_asc",
  "favcount",
  "favcount_asc",
  "change",
  "change_desc",
  "change_asc",
  "comment",
  "comm",
  "comment_asc",
  "comm_asc",
  "comment_bumped",
  "comment_bumped_asc",
  "note",
  "note_asc",
  "artcomm",
  "mpixels",
  "mpixels_desc",
  "mpixels_asc",
  "portrait",
  "landscape",
  "filesize",
  "filesize_desc",
  "filesize_asc",
  "rank",
  "random"
];

function getCategory(tag) {
  if (tag.includes(" ")) throw new Error("include space");
  const sep = tag.indexOf(":");
  if (sep === -1) return "plain";
  const pre = tag.substr(0, sep);
  const suf = tag.substr(sep + 1);
  if (["limit", "upvote", "downvote"].includes(pre)) return "metatag_invalid";
  if (!metatags_prenames.includes(pre)) return "metatag_unknown";
  if (["status", "-status"].includes(pre) && !suffixes_status.includes(suf))
    return "metatag_unknown";
  if (pre === "order" && !suffixes_order.includes(suf))
    return "metatag_unknown";
  return "metatag";
}

module.exports = { getCategory };
