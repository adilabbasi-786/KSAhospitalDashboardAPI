module.exports = [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      headers: "*", // You can specify which headers are allowed if needed
      origin: [
        "https://ksa-hotel-admindasboard.vercel.app/",
        "http://localhost:3000",
      ], // Add your Vercel frontend domain here
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
