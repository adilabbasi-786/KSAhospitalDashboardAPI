module.exports = {
  routes: [
    {
      method: "POST",
      path: "/updateAdmin",
      handler: "hotel-name.updateAdmin",
    },
    {
      method: "POST",
      path: "/getprofit",
      handler: "hotel-name.getProfit",
    },
  ],
};
