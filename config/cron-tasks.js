module.exports = {
  notification: {
    task: async ({ strapi }) => {
      const currentDate = new Date();
      console.log("current", currentDate);

      const hotels = await strapi.entityService.findMany(
        "api::hotel-name.hotel-name"
      );

      for (const hotel of hotels) {
        const hotelId = hotel.id;
        const hotelname = hotel.name;
        console.log("Hotel ID:", hotelId);

        const expenses = await strapi.entityService.findMany(
          "api::daily-register.daily-register",
          {
            filters: {
              hotel_name: hotelId,
              date: currentDate,
            },
            populate: "*",
          }
        );

        const sale = await strapi.entityService.findMany(
          "api::daily-sale.daily-sale",
          {
            filters: {
              hotel_name: hotelId,
              date: currentDate,
            },
            populate: "*",
          }
        );

        console.log("expenses length", expenses.length);
        console.log("sales length", sale.length);

        if (expenses.length === 0 && sale.length === 0) {
          const createNotification = await strapi.entityService.create(
            "api::notification.notification",
            {
              data: {
                message: `Manager of ${hotelname} has not entered records for ${
                  currentDate.toISOString().split("T")[0]
                }`,
                read: false,
                publishedAt: new Date(),
                hotel_name: hotelId,
              },
            }
          );
          console.log("createNotification", createNotification);
          console.log("No record entered for hotel:", hotelname);
        } else {
          console.log("Records exist for hotel:", hotelname);
        }
      }

      console.log("Hotels:", hotels);
    },
    options: {
      rule: "0 0 * * *", // This will run the task every day at midnight
      tz: "Asia/Riyadh",
    },
  },
};
