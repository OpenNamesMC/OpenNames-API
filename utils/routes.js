const models = require("./mongo");
const { findAndCreateUser } = require("./mojang");
const { formatMongoDocument } = require(".");

// Check the UUID to see name history and load unique names into db
async function Search(request, reply) {
  const query = request.query.query;
  try {
    let user;
    let users = await models.UserModel.aggregate([
      {
        $match: {
          $or: [{ username: query.toLowerCase() }, { uuid: query }],
        },
      },
    ]);

    if (users.length) {
      user = await formatMongoDocument(users[0]);
      if (user.lastUpdated - Date.now() > 60 * 60 * 1000) {
        user = await findAndCreateUser();
      }
    } else {
      user = await findAndCreateUser(query);
    }

    if (user) {
      return reply.code(200).send(user);
    } else {
      /*
      const pastUser = await models.UserModel.aggregate([
        {
          $project: {

          }
        },
        {
          $match: {
            nameHistory: { $elemMatch: { name: query.toLowerCase() } },
          },
        },
      ]);
      */
      // Check if someone has this name in their name history
      // Check if that name a changedAt
      // If the name has another name after it then its good
      return reply.code(400).send({
        error: `There is no MC account with that username!`,
      });
    }
  } catch (err) {
    console.log(err);
    reply.code(500).send({
      error: `Internal Server Error`,
    });
  }
}

module.exports.Routes = { Search };
