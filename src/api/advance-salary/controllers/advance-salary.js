"use strict";

/**
 * advance-salary controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::advance-salary.advance-salary",
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

        if (!hotel || hotel.length === 0) {
          return ctx.badRequest("Hotel not found for the manager");
        }

        const hotelId = hotel[0].id;
        const { date } = ctx.query.filters;
        const advanceSalaries = await strapi.entityService.findMany(
          "api::advance-salary.advance-salary",
          {
            filters: {
              employees_datum: { hotel_name: hotelId },
              date: date,
            },
            populate: "*",
            sort: "date:desc",
          }
        );

        return advanceSalaries;
      }
    },
  })
);
