"use strict";

/**
 * charity controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::charity.charity", ({ strapi }) => ({
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
      const employee = await strapi.entityService.findMany(
        "api::charity.charity",
        {
          filters: {
            hotel_name: hotelId,
            date: ctx.query.filters.date,
          },
          populate: "*",
        }
      );

      console.log("hotel", hotelId);
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
