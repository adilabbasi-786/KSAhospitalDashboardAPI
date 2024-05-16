'use strict';

/**
 * charity service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::charity.charity');
