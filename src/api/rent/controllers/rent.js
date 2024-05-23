"use strict";

/**
 * rent controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::rent.rent", ({ strapi }) => ({
  async find(ctx) {
    console.log("admin", ctx.state);
    if (ctx.state.user.role.name === "admin") {
      const { data, meta } = await super.find(ctx);
      return { data, meta };
    } else if (ctx.state.user.role.name === "manager") {
      //hotelid
      const userId = ctx.state.user.id;
      const hotel = await strapi.entityService.findMany(
        "api::hotel-name.hotel-name",
        {
          filters: {
            manager: userId,
          },
        }
      );
      const hotelId = hotel[0].id;
      const employee = await strapi.entityService.findMany("api::rent.rent", {
        filters: {
          hotel_name: hotelId,
          month: ctx.query.filters.month,
        },
        populate: "*",
      });

      console.log("month", ctx.query.filters.month);
      return employee;
    }
  },
  async create(ctx) {
    if (ctx.state.user.role.name === "admin") {
      const response = await super.create(ctx);
      return response;
    } else {
      const userId = ctx.state.user.id;
      const hotel = await strapi.entityService.findMany(
        "api::hotel-name.hotel-name",
        {
          filters: {
            manager: userId,
          },
        }
      );

      const hotelId = hotel[0].id;

      ctx.request.body.data.hotel_name = hotelId;
      const response = await super.create(ctx);
      return response;
    }
  },
}));
