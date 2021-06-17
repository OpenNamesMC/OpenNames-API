const axios = require("axios").default;
axios.defaults.validateStatus = () => true;

const { UserModel } = require("./mongo");

module.exports.registerNameHistory = async(query) => {
  // I need to make a function that takes all the names from name history and makes them into documents
}

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
  };
};
