'use strict';

/**
 * advance-salary service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::advance-salary.advance-salary');
