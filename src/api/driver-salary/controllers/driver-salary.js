"use strict";

/**
 * driver-salary controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::driver-salary.driver-salary",
  ({ strapi }) => ({
    async find(ctx) {
      if (ctx.state.user?.role.name === "admin") {
        const { data, meta } = await super.find(ctx);
        return { data, meta };
      } else if (ctx.state.user?.role.name === "manager") {
        const userId = ctx.state.user.id;
        const hotel = await strapi.entityService.findMany(
          "api::hotel-name.hotel-name",
          {
            filters: {
              manager: userId,
            },
          }
        );
        console.log("hotels", hotel);
        const hotelId = hotel[0].id;

        console.log("hotelId", hotelId);
      }
    },
  })
);
