const { ViewModel } = require("../models/view");
const { fetchUser } = require("../utils");

module.exports = async (request, reply) => {
  const query = request.query.query;
  if (query) {
    try {
      const profile = await fetchUser(query);

      if (request.ip) {
        const viewData = await ViewModel.exists({
          name: profile.name,
          ip: request.ip,
        });
        if (!viewData) {
          await ViewModel.create({
            name: profile.name,
            ip: request.ip,
          });
        }
      }
      return profile
    } catch (err) {
      console.log(err);
      return reply.code(500).send({
        error: `Internal Server Error`,
      });
    }
  } else {
    return reply.code(400).send({
      error: `Please provide the query parameter!`,
    });
  }
};
