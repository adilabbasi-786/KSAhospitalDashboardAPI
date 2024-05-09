'use strict';

/**
 * daily-sale service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::daily-sale.daily-sale');
