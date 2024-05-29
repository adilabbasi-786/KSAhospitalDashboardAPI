module.exports = {
  notification: {
    task: async ({ strapi }) => {
      const currentDate = new Date();
      console.log("current", currentDate);

      const hotels = await strapi.entityService.findMany(
        "api::hotel-name.hotel-name"
      );
      hotels.forEach(async (hotel) => {
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
        console.log("expanse length", expenses);

        if (expenses.length === 0) {
          const createNotification = await strapi.entityService.create(
            "api::notification.notification",
            {
              data: {
                message: `manager of ${hotelname} does not enter record of ${currentDate} `,
                read: false,
                publishedAt: new Date(),
                hotel_name: 56,
              },
            }
          );
          console.log("createNotification", createNotification);
          console.log("No record entered for hotel:", hotelname);
        } else {
          console.log("Expenses for hotel:", hotelname, expenses);
        }
      });

      console.log("Hotels:", hotels);
    },
    options: {
      rule: "0 * * * *",
      tz: "Asia/Riyadh",
    },
  },
};
