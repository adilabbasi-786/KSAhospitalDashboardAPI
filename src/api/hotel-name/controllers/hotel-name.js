"use strict";

/**
 * hotel-name controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::hotel-name.hotel-name",
  ({ strapi }) => ({
    async create(ctx) {
      const roles = await strapi.entityService.findMany(
        "plugin::users-permissions.role",
        {
          filters: { type: "manager" },
        }
      );
      const roleID = roles[0].id;

      // Extract userId from request body
      const { userId } = ctx.request.body;

      // Assign manager role to the user
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        userId,
        {
          data: {
            role: roleID,
          },
        }
      );

      // Set the userId in the hotel data
      ctx.request.body.data.manager = userId;

      // Create the hotel entry with the manager ID
      const response = await super.create(ctx);
      return response;
    },
  })
);
