const axios = require("axios").default;
const { ProfileModel } = require("./models/profile");
axios.defaults.validateStatus = () => true;

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
      lowercaseName: profile.name.toLowerCase(),
      uuid: profile.uuid,
      name_history: profile.name_history,
    });
  } else {
    return await ProfileModel.create({
      lastUpdated: Date.now(),
      name: profile.name,
      lowercaseName: profile.name.toLowerCase(),
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
