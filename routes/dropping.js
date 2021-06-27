const { ProfileModel } = require("../models/profile");
const { formatTime } = require("../utils");

module.exports = async (request, reply) => {
  try {
    const droppingProfiles = await ProfileModel.aggregate([
      {
        $match: {
          "name_history.changedToAt": {
            $exists: true,
          },
        },
      },
      {
        $addFields: {
          latestNameChangeTime: {
            $arrayElemAt: [
              "$name_history",
              { $subtract: [{ $size: "$name_history" }, 1] },
            ],
          },
        },
      },
      {
        $addFields: {
          dropTime: {
            $add: [
              "$latestNameChangeTime.changedToAt",
              37 * 24 * 60 * 60 * 1000,
            ],
          },
        },
      },
      {
        $addFields: {
          timeUntilDrop: {
            $subtract: ["$dropTime", Date.now()],
          },
        },
      },
      {
        $match: {
          timeUntilDrop: { $gte: 0 },
        },
      },
      {
        $sort: {
          timeUntilDrop: 1,
        },
      },
    ]);

    if (droppingProfiles.length) {
      const final = [];
      const formattedDroppingNames = droppingProfiles.map((profile) => {
        return {
          name: profile.name,
          unixDropTime: profile.dropTime,
          stringDropTime: formatTime(profile.timeUntilDrop),
        };
      });
      for (const profile of formattedDroppingNames) {
        if (!final.some((x) => x.name === profile.name)) final.push(profile);
      }
      return final;
    }
  } catch (err) {
    console.log(err);
    return reply.code(500).header("Access-Control-Allow-Origin", "*").send({
      error: `Internal Server Error`,
    });
  }
};
