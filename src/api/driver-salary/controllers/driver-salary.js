"use strict";

/**
 * driver-salary controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::driver-salary.driver-salary",
  ({ strapi }) => ({
    async create(ctx) {
      if (ctx.state.user?.role.name === "admin") {
        const { data, meta } = await super.create(ctx);
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
        const { data } = ctx.request.body;
        const driverSalary = await strapi.entityService.create(
          "api::driver-salary.driver-salary",
          {
            data: {
              ...data,
              hotel_name: hotelId,
              publishedAt: new Date(),
            },
          }
        );
        console.log("driversalary", driverSalary);
        return driverSalary;
      }
    },
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

        // const driverSalary = await strapi.entityService.findMany(
        //   "api::driver-salary.driver-salary",
        //   {
        //     filters: {},
        //     sort: { date: "DESC" },
        //     limit: 1,
        //   }
        // );
        // const date = driverSalary[0].date;
        const date = ctx.query.filters.date.$eq;

        const filteredDriverSalary = await strapi.entityService.findMany(
          "api::driver-salary.driver-salary",
          {
            filters: {
              date: date,
              hotel_name: hotelId,
            },
          }
        );
        console.log("ctx", ctx.query.filters.date.$eq);

        // console.log("date", date);
        return filteredDriverSalary;
      }
    },
  })
);
