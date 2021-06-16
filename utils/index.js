module.exports.formatMongoDocument = (document) => {
  return {
    lastUpdated: document.lastUpdated,
    username: document.username,
    uuid: document.uuid,
  };
};
