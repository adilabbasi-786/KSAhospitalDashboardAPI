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
  })
);
