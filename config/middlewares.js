module.exports = [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      jsonLimit: "20mb",
      formLimit: "20mb",
      textLimit: "20mb",
      formidable: {
        maxFileSize: 20 * 1024 * 1024,
      },
    },
  },
  // "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
