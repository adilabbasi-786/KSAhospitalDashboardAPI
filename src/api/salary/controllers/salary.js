"use strict";

/**
 * salary controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::salary.salary", ({ strapi }) => ({
  async find(ctx) {
    if (ctx.state.user.role.name === "admin") {
      const { data, meta } = await super.find(ctx);
      return { data, meta };
    } else if (ctx.state.user.role.name === "manager") {
      const { query } = ctx;
      const filters = {};
      const sort = query.sort ? query.sort : "date:desc";
      const userId = ctx.state.user.id;
      const hotel = await strapi.entityService.findMany(
        "api::hotel-name.hotel-name",
        {
          filters: {
            manager: userId,
          },
        }
      );
      if (query.filters) {
        if (query.filters.employees_datum) {
          filters.employees_datum = query.filters.employees_datum;
        }
      }
      const hotelId = hotel[0].id;
      const salaries = await strapi.entityService.findMany(
        "api::salary.salary",
        {
          filters,
          sort,
          populate: "*",
        }
      );
      const response = salaries.map((salary) => ({
        id: salary.id,
        attributes: {
          ...salary,
          employees_datum: {
            data: {
              id: salary.employees_datum.id,
              attributes: salary.employees_datum,
            },
          },
        },
      }));
      return { data: response };
    }
  },
  async create(ctx) {
    if (ctx.state.user.role.name === "admin") {
      const response = await super.create(ctx);
      return response;
    } else if (ctx.state.user.role.name === "manager") {
      const { data } = ctx.request.body;
      const { employees_datum, date, type, amount, month } = data;

      if (!employees_datum || !date || !type || !amount) {
        return ctx.badRequest("Missing required fields");
      }

      const employeeId = employees_datum.id;
      // Add your validation logic here if needed

      try {
        const newSalaryEntry = await strapi.entityService.findMany(
          "api::hotel-name.hotel-name",
          {
            data: {
              employees_datum,
              date,
              type,
              amount,
              ...(type === "monthly salary" && { month }),
            },
          }
        );

        const response = await super.create(ctx);
        return response;
      } catch (error) {
        return ctx.internalServerError("Failed to add salary entry");
      }
    }
  },
}));
