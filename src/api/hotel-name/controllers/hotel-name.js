"use strict";

/**
 * hotel-name controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::hotel-name.hotel-name",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        // Parse the JSON data
        const { data } = ctx.request.body;
        const parsedData = JSON.parse(data);
        const { manager } = parsedData;

        if (!manager) {
          return ctx.badRequest("Manager ID is missing");
        }

        // Assign manager role to the user
        const roles = await strapi.entityService.findMany(
          "plugin::users-permissions.role",
          {
            filters: { type: "manager" },
          }
        );
        const roleID = roles[0].id;

        await strapi.entityService.update(
          "plugin::users-permissions.user",
          manager,
          {
            data: {
              role: roleID,
            },
          }
        );

        // Create the hotel entry with the manager ID and other details
        const hotelData = {
          ...parsedData,
          manager: manager, // Set the manager ID in the hotel data
          publishedAt: new Date(), // Ensure the entry is published
        };

        const entry = await strapi.entityService.create(
          "api::hotel-name.hotel-name",
          {
            data: hotelData,
          }
        );

        // Function to handle file upload and link to the hotel entry
        const handleFileUpload = async (fileKey, fieldName) => {
          if (ctx.request.files && ctx.request.files[fileKey]) {
            const uploadedFiles = await strapi.plugins[
              "upload"
            ].services.upload.upload({
              data: { fileInfo: {} },
              files: ctx.request.files[fileKey],
            });

            // Link the uploaded file to the hotel entry
            if (uploadedFiles && uploadedFiles.length > 0) {
              const updateData = {};
              updateData[fieldName] = uploadedFiles[0].id;

              await strapi.entityService.update(
                "api::hotel-name.hotel-name",
                entry.id,
                {
                  data: updateData,
                }
              );
            }
          }
        };

        // Handle file uploads
        await handleFileUpload("files.liscencePicture", "liscencePicture");
        await handleFileUpload("files.TaxVatPicture", "TaxVatPicture");
        await handleFileUpload(
          "files.ComercialCertificate",
          "ComercialCertificate"
        );

        return ctx.send({ entry });
      } catch (error) {
        strapi.log.error(error);
        return ctx.badRequest("Failed to create hotel entry");
      }
    },
    async update(ctx) {
      try {
        const { id } = ctx.params;
        const { body, files } = ctx.request;

        // Directly use body object which is populated by FormData
        const updatedData = { ...body };

        // Function to handle file upload and link to the hotel entry
        const handleFileUpload = async (fileKey, fieldName) => {
          if (files && files[fileKey]) {
            const uploadedFiles = await strapi.plugins[
              "upload"
            ].services.upload.upload({
              data: { fileInfo: {} },
              files: files[fileKey],
            });

            // Link the uploaded file to the hotel entry
            if (uploadedFiles && uploadedFiles.length > 0) {
              updatedData[fieldName] = uploadedFiles[0].id;
            }
          }
        };

        // Handle file uploads
        await handleFileUpload("files.liscencePicture", "liscencePicture");
        await handleFileUpload("files.TaxVatPicture", "TaxVatPicture");
        await handleFileUpload(
          "files.ComercialCertificate",
          "ComercialCertificate"
        );

        // Update the hotel entry with the provided data
        const entry = await strapi.entityService.update(
          "api::hotel-name.hotel-name",
          id,
          {
            data: updatedData,
          }
        );

        return ctx.send({ entry });
      } catch (error) {
        strapi.log.error(error);
        return ctx.badRequest("Failed to update hotel entry");
      }
    },
    async updateManager(ctx) {
      try {
        const hotelID = ctx.request.body.hotelId;
        const newEmail = ctx.request.body.managerEmail;
        const newPassword = ctx.request.body.password;

        //get hotelmanager from hotelID
        const entry = await strapi.entityService.findOne(
          "api::hotel-name.hotel-name",
          hotelID,
          {
            fields: ["managerEmail"],
          }
        );
        console.log("entity", entry);
        const currentManagerEmail = entry.managerEmail;
        console.log("currentEmail", currentManagerEmail);

        //step1 delete user name from email
        const currentManagerId = await strapi.entityService.findMany(
          "plugin::users-permissions.user",
          {
            filters: { email: currentManagerEmail },
            fields: ["id"],
          }
        );
        console.log("cureent", currentManagerId[0].id);
        await strapi.entityService.delete(
          "plugin::users-permissions.user",
          currentManagerId[0].id
        );
        // step2 new user create with email and password
        const roles = await strapi.entityService.findMany(
          "plugin::users-permissions.role",
          {
            filters: { type: "manager" },
          }
        );
        const roleID = roles[0].id;

        const newManager = await strapi.entityService.create(
          "plugin::users-permissions.user",
          {
            data: {
              email: newEmail,
              password: newPassword,
              username: newEmail,
              confirmed: true,
              hotel_name: hotelID,
              role: roleID,
              provider: "local",
            },
          }
        );
        console.log("newww", newManager);
        //step3 update email and password of given hotelID

        await strapi.entityService.update(
          "api::hotel-name.hotel-name",
          hotelID,
          {
            data: {
              managerEmail: newEmail,
              managerPassword: newPassword,
            },
          }
        );

        return {
          status: "ok",
        };
      } catch (error) {
        return { status: "error" };
      }
    },
    async updateAdmin(ctx) {
      //ctx.state.user.id admin id
      // entity service update
      //id, password
      // return done
      try {
        const newPassword = ctx.request.body.newPassword;

        const userId = ctx.state.user.id;
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          userId,
          {
            data: {
              password: newPassword,
            },
          }
        );
        return {
          status: "ok",
        };
      } catch (error) {
        return { status: "error" };
      }
    },
    async getProfit(ctx) {
      const hotel_id = ctx.request.body.hotel_id;
      const year = ctx.request.body.year;
      const month = ctx.request.body.month;
      const start_date = `${year}-${month}-01`;
      const givenDate = new Date(start_date);
      const lastDateOfMonth = new Date(
        givenDate.getFullYear(),
        givenDate.getMonth() + 1,
        1
      );
      const end_date = lastDateOfMonth.toISOString().split("T")[0];
      console.log({ start_date, end_date });
      const expanse_query = await strapi.db.connection.raw(
        `SELECT SUM(quantity * price ) AS total_sum
        FROM daily_registers_hotel_name_links
        INNER JOIN daily_registers
        ON daily_registers_hotel_name_links.daily_register_id = daily_registers.id
        WHERE daily_registers_hotel_name_links.hotel_name_id = ${hotel_id}
           AND daily_registers.date >= '${start_date}' AND daily_registers.date < '${end_date}';`
      );
      const total_expanse = expanse_query.rows[0]?.total_sum || 0;

      const sales_query = await strapi.db.connection.raw(
        `SELECT sum(sale) as total_sale from daily_sales_hotel_name_links
        INNER JOIN daily_sales
        ON daily_sales_hotel_name_links.daily_sale_id = daily_sales.id
        WHERE daily_sales_hotel_name_links.hotel_name_id =${hotel_id}
         AND daily_sales.date >= '${start_date}' AND  daily_sales.date < '${end_date}';`
      );
      const total_sales = sales_query.rows[0]?.total_sale || 0;

      const advance_query = await strapi.db.connection.raw(
        `SELECT sum(subquery.amount) as total_advance_salalry
        FROM (
            SELECT *
            FROM salaries
            WHERE type='advance' AND  date >= '${start_date}' AND date < '${end_date}'
        ) AS subquery
        INNER JOIN salaries_employees_datum_links
        on salaries_employees_datum_links.salary_id=subquery.id
        INNER join employee_data_hotel_name_links
        on employee_data_hotel_name_links.employes_data_id=salaries_employees_datum_links.employes_data_id where hotel_name_id=${hotel_id};`
      );
      const total_advance = advance_query.rows[0]?.total_advance_salalry || 0;

      const monthly_salary_query = await strapi.db.connection.raw(
        `SELECT sum(subquery.amount) as total_monthy_salalry
        FROM (
            SELECT *
            FROM salaries
            WHERE type='monthly salary' AND   date >= '${start_date}' AND date < '${end_date}'
        ) AS subquery
        INNER JOIN salaries_employees_datum_links
        on salaries_employees_datum_links.salary_id=subquery.id
        INNER join employee_data_hotel_name_links
        on employee_data_hotel_name_links.employes_data_id=salaries_employees_datum_links.employes_data_id where hotel_name_id=${hotel_id};`
      );
      const total_monthly =
        monthly_salary_query.rows[0]?.total_monthy_salalry || 0;
      return {
        total_expanse,
        total_sales,
        total_advance,
        total_monthly,
      };
    },
  })
);
