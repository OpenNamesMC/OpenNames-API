const {
  createProfile,
  formatProfile,
  formatTime,
  isUUID,
} = require("../utils");
const { ProfileModel } = require("../models/profile");
const { ViewModel } = require("../models/view");
const config = require("../config");

module.exports = async (request, reply) => {
  const query = request.query.query;
  if (query) {
    try {
      let profile;
      if (isUUID(query)) {
        profile = await ProfileModel.findOne({ uuid: query });
      } else {
        const profiles = await ProfileModel.aggregate([
          {
            $match: {
              $or: [
                {
                  lowercaseName: query.toLowerCase(),
                },
                { uuid: query },
              ],
            },
          },
        ]);
        if (profiles.length) profile = profiles[0];
      }

      if (profile) {
        if (profile.lastUpdated - Date.now() > config.profileUpdateInterval) {
          await ProfileModel.deleteOne({
            _id: profile._id,
          });
          profile = formatProfile(await createProfile(query));
        } else {
          profile = formatProfile(profile);
        }
      } else {
        const pastProfiles = await ProfileModel.aggregate([
          {
            $match: {
              "name_history.name": {
                $regex: `^${query}$`,
                $options: "i",
              },
              "name_history.changedToAt": {
                $exists: true,
              },
            },
          },
          {
            $sort: {
              "name_history.changedToAt": -1,
            },
          },
        ]);
        if (pastProfiles.length) {
          const history = pastProfiles[0].name_history;
          const nameChangeTime =
            history[
              history.indexOf(
                history.find(
                  (x) => x.name.toLowerCase() === query.toLowerCase()
                )
              ) + 1
            ].changedToAt;

          const dropTime = nameChangeTime + 37 * 24 * 60 * 60 * 1000;
          const timeUntilDrop = dropTime - Date.now();

          if (!(Math.sign(timeUntilDrop) === -1)) {
            profile = {
              name: query,
              unixDropTime: dropTime,
              stringDropTime: formatTime(timeUntilDrop),
              owner_history: pastProfiles.map((x) => formatProfile(x)),
            };
          }
        }
      }

      if (!profile && !isUUID(query)) {
        profile = formatProfile(await createProfile(query));
      }

      const viewAmount = await ViewModel.countDocuments({
        name: profile.name,
      });
      profile.views = viewAmount;

      const viewsData = await ViewModel.findOne({
        name: profile.name,
        ip: request.ip,
      });
      if (!viewsData) {
        await ViewModel.create({
          name: profile.name,
          ip: request.ip,
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
