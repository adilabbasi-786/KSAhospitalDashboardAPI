module.exports = {
  notification: {
    task: async ({ strapi }) => {
      const currentDate = new Date();
      const notificationDate = new Date();
      notificationDate.setDate(currentDate.getDate() + 28);

      console.log("Current date:", currentDate);
      console.log("Notification date:", notificationDate);

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

        console.log("Expenses length:", expenses.length);
        console.log("Sales length:", sale.length);

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

        // Check for employee Iqama and Passport expiry
        const employees = await strapi.entityService.findMany(
          "api::employes-data.employes-data",
          {
            filters: {
              hotel_name: hotelId,
            },
            populate: "*",
          }
        );

        for (const employee of employees) {
          const { iqamaExpiry, passportExpiry, EmployeeName } = employee;

          if (iqamaExpiry && new Date(iqamaExpiry) < notificationDate) {
            await strapi.entityService.create(
              "api::notification.notification",
              {
                data: {
                  message: `Iqama for ${EmployeeName} (Hotel: ${hotelname}) is expiring on ${iqamaExpiry}`,
                  read: false,
                  publishedAt: new Date(),
                  hotel_name: hotelId,
                },
              }
            );
            console.log(
              `Notification created for Iqama expiry: ${EmployeeName}, ${iqamaExpiry}`
            );
          }

          if (passportExpiry && new Date(passportExpiry) < notificationDate) {
            await strapi.entityService.create(
              "api::notification.notification",
              {
                data: {
                  message: `Passport for ${EmployeeName} (Hotel: ${hotelname}) is expiring on ${passportExpiry}`,
                  read: false,
                  publishedAt: new Date(),
                  hotel_name: hotelId,
                },
              }
            );
            console.log(
              `Notification created for Passport expiry: ${EmployeeName}, ${passportExpiry}`
            );
          }
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
