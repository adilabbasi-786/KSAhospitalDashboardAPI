"use strict";

/**
 * employes-data controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::employes-data.employes-data",
  ({ strapi }) => ({
    async find(ctx) {
      if (ctx.state.user?.role.name === "admin") {
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
          "api::employes-data.employes-data",
          {
            filters: {
              hotel_name: hotelId,
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

    async update(ctx) {
      if (ctx.state.user.role.name === "admin") {
        const response = await super.update(ctx);
        return response;
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

        console.log("employeeId", hotelId);
        // Check if the employee belongs to the manager's hotel
        const employeeId = ctx.params.id;
        const employee = await strapi.entityService.findOne(
          "api::employes-data.employes-data",
          employeeId,
          {
            populate: { hotel_name: true },
          }
        );

        if (employee.hotel_name.id !== hotelId) {
          return ctx.unauthorized(
            "You cannot update an employee that does not belong to your hotel"
          );
        }

        // Proceed with the update
        const response = await super.update(ctx);
        return response;
      } else {
        return ctx.unauthorized(
          "You are not authorized to update employee data"
        );
      }
    },
    async delete(ctx) {
      if (ctx.state.user.role.name === "admin") {
        const response = await super.delete(ctx);

        return response;
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
        const employeeId = ctx.params.id;
        const employee = await strapi.entityService.findOne(
          "api::employes-data.employes-data",
          employeeId,
          {
            populate: { hotel_name: true },
          }
        );

        if (employee.hotel_name.id !== hotelId) {
          return ctx.unauthorized(
            "You cannot delete an employee that does not belong to your hotel"
          );
        }

        const response = await super.delete(ctx);
        return response;
      } else {
        return ctx.unauthorized(
          "You are not authorized to delete employee data"
        );
      }
    },
  })
);
