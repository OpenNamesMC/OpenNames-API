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
