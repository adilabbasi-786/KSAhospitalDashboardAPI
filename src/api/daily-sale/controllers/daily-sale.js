"use strict";

/**
 * daily-sale controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::daily-sale.daily-sale",
  ({ strapi }) => ({
    async find(ctx) {
      if (ctx.state.user?.role.name === "admin") {
        const { data, meta } = await super.find(ctx);
        return { data, meta };
      } else if (ctx.state.user.role.name === "manager") {
        const userId = ctx.state.user.id;
        const hotel = await strapi.entityService.findMany(
          "api::hotel-name.hotel-name",
          {
            filters: {
              manager: userId,
            },
          }
        );
        const { date } = ctx.query.filters;
        const hotelId = hotel[0].id;
        const sales = await strapi.entityService.findMany(
          "api::daily-sale.daily-sale",
          {
            filters: {
              hotel_name: hotelId,
              date: date,
            },
            populate: "*",
            sort: "date:desc",
          }
        );

        return sales;
      }
    },
    async create(ctx) {
      if (ctx.state.user?.role.name === "admin") {
        const { data, meta } = await super.create(ctx);
        return { data, meta };
      } else if (ctx.state.user.role.name === "manager") {
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
  })
);
