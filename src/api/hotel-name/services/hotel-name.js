'use strict';

/**
 * hotel-name service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::hotel-name.hotel-name');
