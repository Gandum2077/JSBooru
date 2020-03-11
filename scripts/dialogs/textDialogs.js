const Sheet = require("../components/sheet");
const BaseView = require("../components/baseView");

class TextView extends BaseView {
  constructor({ text, placeholder }) {
    super();
    this.text = text;
    this.placeholder = placeholder;
  }

  _defineView() {
    return {
      type: "text",
      props: {
        id: this.id,
        text: this.text,
        placeholder: this.placeholder
      },
      events: {
        ready: sender => {
          sender.focus();
        }
      }
    };
  }
}

function presentSheet({ title, text, placeholder, presentMode = 1 }) {
  const textView = new TextView({ text, placeholder });
  const sheet = new Sheet({
    title,
    presentMode,
    view: textView.definition,
    doneEvent: sender => textView.view.text
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}

function textDialogs({ title = "", text = "", placeholder = "", presentMode }) {
  if (presentMode === undefined) {
    presentMode = $device.isIpad ? 2 : 1;
  }
  return presentSheet({ title, text, placeholder, presentMode });
}

module.exports = textDialogs;
