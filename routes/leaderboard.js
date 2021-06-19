const { ProfileModel } = require("../models/profile");
const { ViewModel } = require("../models/view");

module.exports = async (request, reply) => {
  try {
    const topNameViews = await ViewModel.aggregate([
      { $group: { _id: "$name", count: { $sum: 1 } } },
      {
        $sort: {
          count: -1,
        },
      },
      { $limit: 10 },
    ]);
    if (topNameViews.length) {
      const profiles = await ProfileModel.find({
        lowercaseName: { $in: topNameViews.map((x) => x._id.toLowerCase()) },
      });
      if (profiles.length) {
        return reply.code(200).send(profiles);
      } else {
        return reply.code(404).send({
          error: "No top users for views could be found!",
        });
      }
    } else {
      return reply.code(404).send({
        error: "No top users for views could be found!",
      });
    }
  } catch (err) {
    console.log(err);
    return reply.code(500).send({
      error: "Internal Server Error",
    });
  }
};
