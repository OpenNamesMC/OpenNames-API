const fetch = require("node-fetch");

module.exports.fetchUuidFromUsername = async (username) => {
  const req = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${username}`
  );
  if (req.status === 200) {
    return await req.json(); // example: {"name":"vqpa","id":"dc4e2122b70b46c489596cd0337246c2"}
  } else {
    return false;
  }
};

module.exports.fetchNameHistoryFromUuid = async (uuid) => {
  const req = await fetch(`https://api.mojang.com/user/profiles/${uuid}/names`);
  if (req.status === 200) {
    return await req.json(); // example: [{"name":"Rolyatevol"},{"name":"Barometer","changedToAt":1551141789000},{"name":"vqpa","changedToAt":1623006629000}]
  } else {
    return false;
  }
};

module.exports.findAndCreateUser = async (query) => {
  let newUser;
  const usernameRequest = await mojang.fetchUuidFromUsername(query);
  if (usernameRequest) {
    newUser = await models.UserModel.create({
      lastUpdated: Date.now(),
      username: usernameRequest.name.toLowerCase(),
      uuid: usernameRequest.id,
    });
    return formatMongoDocument(newUser);
  } else {
    const uuidRequest = await mojang.fetchNameHistoryFromUuid(query);
    if (uuidRequest) {
      const currentUsername = uuidRequest[uuidRequest.length - 1];
      newUser = await models.UserModel.create({
        lastUpdated: Date.now(),
        username: currentUsername.toLowerCase(),
        uuid: query,
      });
    }
    return formatMongoDocument(newUser);
  }
};
