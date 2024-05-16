"use strict";

/**
 * hotel-name controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

// module.exports = createCoreController("api::hotel-name.hotel-name");

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
      // find a userid then assifn
      console.log("strapi", roles);
      const { userId } = ctx.request.body;
      const user = await strapi.entityService.update(
        "plugin::users-permissions.user",
        userId,
        {
          data: {
            role: roleID,
          },
        }
      );
      console.log("userId", userId);

      const response = await super.create(ctx);
      return response;
    },
  })
);
