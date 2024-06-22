module.exports = [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "ksabucket.s3.eu-north-1.amazonaws.com",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "dl.airtable.com",
            "ksabucket.s3.eu-north-1.amazonaws.com",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
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
