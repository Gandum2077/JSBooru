if ($app.env === $env.app) {
  const app = require("scripts/app");
  await app.init();
} else if ($app.env === $env.widget) {
  const app = require("scripts/widget");
  await app.init();
}
