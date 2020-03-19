// JS function to convert BBCode and HTML code - http;//coursesweb.net/javascript/
var BBCodeHTML = function() {
  var me = this; // stores the object instance
  var token_match = /{[A-Z_]+[0-9]*}/gi;

  // regular expressions for the different bbcode tokens
  var tokens = {
    TEXT: "(.*?)",
    SIMPLETEXT: "([a-zA-Z0-9-+.,_ ]+)",
    INTTEXT: "([a-zA-Z0-9-+,_. ]+)",
    IDENTIFIER: "([a-zA-Z0-9-_]+)",
    COLOR: "([a-z]+|#[0-9abcdef]+)",
    NUMBER: "([0-9]+)"
  };

  var bbcode_matches = []; // matches for bbcode to html

  var html_tpls = []; // html templates for html to bbcode

  var html_matches = []; // matches for html to bbcode

  var bbcode_tpls = []; // bbcode templates for bbcode to html

  /**
   * Turns a bbcode into a regular rexpression by changing the tokens into
   * their regex form
   */
  var _getRegEx = function(str) {
    var matches = str.match(token_match);
    var nrmatches = matches.length;
    var i = 0;
    var replacement = "";

    if (nrmatches <= 0) {
      return new RegExp(preg_quote(str), "g"); // no tokens so return the escaped string
    }

    for (; i < nrmatches; i += 1) {
      // Remove {, } and numbers from the token so it can match the
      // keys in tokens
      var token = matches[i].replace(/[{}0-9]/g, "");

      if (tokens[token]) {
        // Escape everything before the token
        replacement +=
          preg_quote(str.substr(0, str.indexOf(matches[i]))) + tokens[token];

        // Remove everything before the end of the token so it can be used
        // with the next token. Doing this so that parts can be escaped
        str = str.substr(str.indexOf(matches[i]) + matches[i].length);
      }
    }

    replacement += preg_quote(str); // add whatever is left to the string

    return new RegExp(replacement, "gi");
  };

  /**
   * Turns a bbcode template into the replacement form used in regular expressions
   * by turning the tokens in $1, $2, etc.
   */
  var _getTpls = function(str) {
    var matches = str.match(token_match);
    var nrmatches = matches.length;
    var i = 0;
    var replacement = "";
    var positions = {};
    var next_position = 0;

    if (nrmatches <= 0) {
      return str; // no tokens so return the string
    }

    for (; i < nrmatches; i += 1) {
      // Remove {, } and numbers from the token so it can match the
      // keys in tokens
      var token = matches[i].replace(/[{}0-9]/g, "");
      var position;

      // figure out what $# to use ($1, $2)
      if (positions[matches[i]]) {
        position = positions[matches[i]]; // if the token already has a position then use that
      } else {
        // token doesn't have a position so increment the next position
        // and record this token's position
        next_position += 1;
        position = next_position;
        positions[matches[i]] = position;
      }

      if (tokens[token]) {
        replacement += str.substr(0, str.indexOf(matches[i])) + "$" + position;
        str = str.substr(str.indexOf(matches[i]) + matches[i].length);
      }
    }

    replacement += str;

    return replacement;
  };

  /**
   * Adds a bbcode to the list
   */
  me.addBBCode = function(bbcode_match, bbcode_tpl) {
    // add the regular expressions and templates for bbcode to html
    bbcode_matches.push(_getRegEx(bbcode_match));
    html_tpls.push(_getTpls(bbcode_tpl));

    // add the regular expressions and templates for html to bbcode
    html_matches.push(_getRegEx(bbcode_tpl));
    bbcode_tpls.push(_getTpls(bbcode_match));
  };

  /**
   * Turns all of the added bbcodes into html
   */
  me.bbcodeToHtml = function(str) {
    var nrbbcmatches = bbcode_matches.length;
    var i = 0;

    for (; i < nrbbcmatches; i += 1) {
      str = str.replace(bbcode_matches[i], html_tpls[i]);
    }

    return str;
  };

  /**
   * Turns html into bbcode
   */
  me.htmlToBBCode = function(str) {
    var nrhtmlmatches = html_matches.length;
    var i = 0;

    for (; i < nrhtmlmatches; i += 1) {
      str = str.replace(html_matches[i], bbcode_tpls[i]);
    }

    return str;
  };

  /**
   * Quote regular expression characters plus an optional character
   * taken from phpjs.org
   */
  function preg_quote(str, delimiter) {
    return (str + "").replace(
      new RegExp(
        "[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\" + (delimiter || "") + "-]",
        "g"
      ),
      "\\$&"
    );
  }

  // adds BBCodes and their HTML
  me.addBBCode("[[{TEXT}]]", "[{TEXT}]()");
  me.addBBCode("[b]{TEXT}[/b]", "**{TEXT}**");
  me.addBBCode("[i]{TEXT}[/i]", "*{TEXT}*");
  me.addBBCode("[u]{TEXT}[/u]", "__{TEXT}__");
  me.addBBCode("[s]{TEXT}[/s]", "~~{TEXT}~~");
  me.addBBCode("[tn]{TEXT}[/tn]", '<span style="color:#8c8c8c;">{TEXT}</span>');
  me.addBBCode("[quote]{TEXT}[/quote]", "<cite>{TEXT}</cite>");
  me.addBBCode(
    "[blockquote]{TEXT}[/blockquote]",
    "<blockquote>{TEXT}</blockquote>"
  );
};
var bbcodeParser = new BBCodeHTML(); // creates object instance of BBCodeHTML()

function replaceH456Tag(text) {
  text = text.replace(/^h4\. (.*)$/gm, "### $1");
  text = text.replace(/^h5\. (.*)$/gm, "#### $1");
  text = text.replace(/^h6\. (.*)$/gm, "#### $1");
  return text;
}

function render(text) {
  if (!text) return "";
  text = replaceH456Tag(text);
  text = text.replace(/^\*\* /gm, "  - ");
  return bbcodeParser.bbcodeToHtml(text);
}

module.exports = {
  render
};
