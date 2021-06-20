const { ViewModel } = require("../models/view");
const { fetchUser } = require("../utils");

module.exports = async (request, reply) => {
  const query = request.query.query;
  if (query) {
    try {
      const profile = await fetchUser(query);
      const monthlyViewData = await ViewModel.exists({
        name: profile.name,
        ip: request.ip,
        type: "MONTHLY",
      });
      if (!monthlyViewData) {
        await ViewModel.create({
          name: profile.name,
          ip: request.ip,
          type: "MONTHLY",
        });
      }

      const lifetimeViewData = await ViewModel.exists({
        name: profile.name,
        ip: request.ip,
        type: "LIFETIME",
      });
      if (!lifetimeViewData) {
        await ViewModel.create({
          name: profile.name,
          ip: request.ip,
          type: "LIFETIME",
        });
      }

      return reply
        .code(200)
        .header("Access-Control-Allow-Origin", "*")
        .send(profile);
    } catch (err) {
      console.log(err);
      return reply.code(500).header("Access-Control-Allow-Origin", "*").send({
        error: `Internal Server Error`,
      });
    }
  } else {
    return reply.code(400).header("Access-Control-Allow-Origin", "*").send({
      error: `Please provide the query parameter!`,
    });
  }
};
