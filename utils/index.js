const { fetchNameHistoryFromUuid } = require("./mojang");

const formatMongoDocument = async (document) => {
  let nameHistory = [];
  const history = await fetchNameHistoryFromUuid(document.uuid);
  if (history) {
    for (const info of history) {
      nameHistory.push({ name: info.name, changedAt: info.changedToAt });
    }
  }
  return {
    lastUpdated: document.lastUpdated,
    username: document.username,
    uuid: document.uuid,
    nameHistory,
  };
};

module.exports.formatMongoDocument = formatMongoDocument;
