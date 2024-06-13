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
  })
);
