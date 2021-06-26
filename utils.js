const axios = require("axios").default;
const { ProfileModel } = require("./models/profile");
const { ViewModel } = require("./models/view");
const config = require("./config");

axios.defaults.validateStatus = () => true;

module.exports.fetchUser = async (query) => {
  try {
    let profile;
    if (this.isUUID(query)) {
      profile = await ProfileModel.findOne({ uuid: query });
    } else {
      const profiles = await ProfileModel.aggregate([
        {
          $match: {
            $or: [
              {
                name: {
                  $regex: `^${query}$`,
                  $options: "i",
                },
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
        profile = await this.createProfile(query);
      }
      profile = this.formatProfile(profile);
    } else if (!profile && !this.isUUID(query)) {
      profile = this.formatProfile(await this.createProfile(query));
    }

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

    if (!profile?.uuid) {
      const history = pastProfiles[0].name_history;
      const nameChangeTime =
        history[
          history.indexOf(
            history.find((x) => x.name.toLowerCase() === query.toLowerCase())
          ) + 1
        ].changedToAt;
      const dropTime = nameChangeTime + 37 * 24 * 60 * 60 * 1000;
      const timeUntilDrop = dropTime - Date.now();

      if (!(Math.sign(timeUntilDrop) === -1)) {
        profile = {
          name: query,
          unixDropTime: dropTime,
          stringDropTime: this.formatTime(timeUntilDrop),
        };
      }
    }

    profile.owner_history = pastProfiles.map((x) => this.formatProfile(x));
    profile.monthlyViews = await ViewModel.countDocuments({
      name: profile.name,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    profile.lifetimeViews = await ViewModel.countDocuments({
      name: profile.name,
    });

    return profile;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports.isUUID = (str) =>
  new RegExp(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  ).test(str);

module.exports.createProfile = async (query) => {
  const profiles = await this.fetchMojangProfiles([query]);
  if (profiles.length) {
    const profile = profiles[0];
    return await ProfileModel.create({
      lastUpdated: Date.now(),
      name: profile.name,
      uuid: profile.uuid,
      name_history: profile.name_history,
    });
  } else {
    return await ProfileModel.create({
      lastUpdated: Date.now(),
      name: query,
    });
  }
};

module.exports.fetchMojangProfiles = async (data) => {
  if (data.length > 25) data = data.slice(0, 25);
  data = this.clearDuplicates(data);

  const response = await axios.post(
    `https://opensourced.danktrain.workers.dev/data`,
    data,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (response.status === 200) {
    return response.data.response.filter((x) => x.name && x.uuid);
  } else {
    return [];
  }
};

module.exports.clearDuplicates = (data) => {
  const newData = [];
  for (let i = 0; i < data.length; i++) {
    if (!newData.includes(data[i])) newData.push(data[i]);
  }
  return newData;
};

module.exports.formatProfile = (document) => {
  let obj = {};
  if (document.name) obj.name = document.name;
  if (document.uuid) obj.uuid = document.uuid;
  if (document.name_history?.length) obj.name_history = document.name_history;
  if (document.views) {
    if (typeof document.views == "number") obj.views = document.views;
    if (document.views instanceof Array) obj.views = docuemt.views.length;
  }
  if (document.lastUpdated) obj.lastUpdated = document.lastUpdated;
  return obj;
};

module.exports.formatTime = (ms) => {
  let years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0;

  if (ms >= 31556952000) {
    years += Math.floor(ms / 31556952000);
    ms %= 31556952000;
  }

  if (ms >= 2073600000) {
    months += Math.floor(ms / 2073600000);
    ms %= 2073600000;
  }

  if (ms >= 86400000) {
    days += Math.floor(ms / 86400000);
    ms %= 86400000;
  }

  if (ms >= 3600000) {
    hours += Math.floor(ms / 3600000);
    ms %= 3600000;
  }

  if (ms >= 60000) {
    minutes += Math.floor(ms / 60000);
    ms %= 60000;
  }

  if (ms >= 1000) {
    seconds += Math.floor(ms / 1000);
    ms %= 1000;
  }

  let str = " ";

  if (years) {
    str += `${years}y `;
  }
  if (months) {
    str += `${months}mo `;
  }
  if (days) {
    str += `${days}d `;
  }
  if (hours) {
    str += `${hours}h `;
  }
  if (minutes) {
    str += `${minutes}m `;
  }
  if (seconds) {
    str += `${seconds}s `;
  }

  return str.trim();
};
