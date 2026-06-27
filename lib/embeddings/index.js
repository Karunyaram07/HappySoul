// * EMBEDDING DOMAIN MODULE - ENTRYPOINT EXPORTS
// ? Aggregates and re-exports all embedding configurations, formatters, retries, and providers.

const config = require("./config");
const constants = require("./constants");
const schema = require("./schema");
const retry = require("./retry");
const formatter = require("./formatter");
const provider = require("./provider");

module.exports = {
  ...config,
  ...constants,
  ...schema,
  ...retry,
  ...formatter,
  ...provider,
};
