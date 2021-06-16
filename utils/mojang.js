const fetch = require("node-fetch");
const { formatMongoDocument } = require(".");
const { UserModel } = require("./mongo");

const fetchUuidFromUsername = async (username) => {
  const req = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${username}`
  );
  if (req.status === 200) {
    return await req.json(); // example: {"name":"vqpa","id":"dc4e2122b70b46c489596cd0337246c2"}
  } else {
    return false;
  }
};

const fetchNameHistoryFromUuid = async (uuid) => {
  const req = await fetch(`https://api.mojang.com/user/profiles/${uuid}/names`);
  if (req.status === 200) {
    return await req.json(); // example: [{"name":"Rolyatevol"},{"name":"Barometer","changedToAt":1551141789000},{"name":"vqpa","changedToAt":1623006629000}]
  } else {
    return false;
  }
};

const findAndCreateUser = async (query) => {
  let newUser;
  const usernameRequest = await fetchUuidFromUsername(query);
  if (usernameRequest) {
    newUser = await UserModel.create({
      lastUpdated: Date.now(),
      username: usernameRequest.name.toLowerCase(),
      uuid: usernameRequest.id,
    });
    return formatMongoDocument(newUser);
  } else {
    const uuidRequest = await fetchNameHistoryFromUuid(query);
    if (uuidRequest) {
      const currentUsername = uuidRequest[uuidRequest.length - 1];
      newUser = await UserModel.create({
        lastUpdated: Date.now(),
        username: currentUsername.toLowerCase(),
        uuid: query,
      });
      return formatMongoDocument(newUser);
    }
  }
};


module.exports = {
  fetchUuidFromUsername,
  fetchNameHistoryFromUuid,
  findAndCreateUser,
};

// Find the last person with that name in their name history
// Check the time that they changed their name to the nest name in history with a new mojang request
// Add 37 days to that and return as the name drop time