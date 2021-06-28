const { ProfileModel } = require("../models/profile");
const { formatTime } = require("../utils");

module.exports = async (request, reply) => {
  try {
    const droppingProfiles = await ProfileModel.aggregate([
      {
        $match: {
          "name_history.1": {
            $exists: true,
          },
        },
      },
      {
        $addFields: {
          latestNameChangeTime: {
            $arrayElemAt: [
              "$name_history",
              { $subtract: [{ $size: "$name_history" }, 2] },
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

    console.log(droppingProfiles);

    if (droppingProfiles.length) {
      const uniqueDroppingSoon = [];
      for (const profile of droppingProfiles) {
        if (!uniqueDroppingSoon.some((x) => x.name === profile.name))
          uniqueDroppingSoon.push(profile);
      }
      const formattedDroppingNames = uniqueDroppingSoon.map((profile) => {
        return {
          name: profile.droppingName,
          unixDropTime: profile.dropTime,
          stringDropTime: formatTime(profile.timeUntilDrop),
        };
      });
      return formattedDroppingNames;
    } else {
      return reply.code(404).send({
        error: "No names dropping"
      })
    }
  } catch (err) {
    console.log(err);
    return reply.code(500).send({
      error: `Internal Server Error`,
    });
  }
};
