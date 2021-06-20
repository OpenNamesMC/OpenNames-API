const { ProfileModel } = require("../models/profile");
const { ViewModel } = require("../models/view");
const { formatProfile } = require("../utils");

module.exports = async (request, reply) => {
  try {
    const topNameViews = await ViewModel.aggregate([
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
        lowercaseName: { $in: topNameViews.map((x) => x._id.toLowerCase()) },
      });
      if (profiles.length) {
        const formattedProfiles = profiles.map((profile) => {
          profile.views =
            topNameViews.find(
              (x) => x._id.toLowerCase() === profile.lowercaseName
            )?.views || 0;
          return formatProfile(profile);
        });
        return reply.code(200).send(formattedProfiles);
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
