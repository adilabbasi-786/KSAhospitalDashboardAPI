"use strict";

/**
 * daily-total-expanse service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::daily-total-expanse.daily-total-expanse"
);
