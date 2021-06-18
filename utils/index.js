const axios = require("axios").default;
axios.defaults.validateStatus = () => true;

const { UserModel } = require("./mongo");

module.exports.registerNameArray = async (query) => {
  let profiles = await this.fetchMojangProfiles(query);
  if (profiles.length) {
    UserModel.insertMany(
      profiles.map((x) => {
        x.lastUpdated = Date.now();
        return x;
      })
    );
    return profiles;
  } else {
    return false;
  }
};

module.exports.createUserProfile = async (query) => {
  const profiles = await this.fetchMojangProfiles([query]);
  if (profiles.length) {
    const profile = profiles[0];
    return await UserModel.create({
      lastUpdated: Date.now(),
      name: profile.name,
      uuid: profile.uuid,
      name_history: profile.name_history,
    });
  } else {
    return false;
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

module.exports.formatUserDocument = (document) => {
  return {
    name: document.name,
    uuid: document.uuid,
    name_history: document.name_history,
    views: document.views.length,
  };
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
}