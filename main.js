if ($app.env === $env.app) {
  const app = require("scripts/app");
  await app.init();
} else {
  const widget = require("scripts/widget");
  await widget.init();
}
