const { ProfileModel } = require("../models/profile");
const { ViewModel } = require("../models/view");
const { fetchUser } = require("../utils");

module.exports = async (request, reply) => {
  try {
    const topNameViews = await ViewModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: "$name", views: { $sum: 1 } } },
      {
        $sort: {
          views: -1,
        },
      },
      { $limit: 10 },
    ]);
    if (topNameViews.length) {
      const profiles = await ProfileModel.find({
        name: { $in: topNameViews.map((x) => x._id) },
      });
      if (profiles.length) {
        const formattedProfiles = await Promise.all(
          profiles.map((x) => fetchUser(x.name))
        );
        const sortedProfiles = formattedProfiles.sort(
          (a, b) => b.monthlyViews - a.monthlyViews
        );
        return sortedProfiles
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
