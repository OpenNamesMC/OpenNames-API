const fastify = require("fastify")();
const mongoose = require("mongoose");
const { config } = require("dotenv");

const models = require("./mongo");
const mojang = require("./mojang");

config();

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Last updated cant be more than 1 hour ago
// If its more than 1 hour then update again

// Check the UUID to see name history and load unique names into db
async function Search(request, reply) {
  const query = request.query.query;
  let users = await models.UserModel.aggregate([
    {
      $match: {
        $or: [{ username: query.toLowerCase() }, { uuid: query }],
      },
    },
  ]);

  if (users.length) {
    const user = formatMongoDocument(users[0]);
    return reply.code(200).send(user);
  } else {
    let newUser;
    const usernameRequest = await mojang.fetchUuidFromUsername(query);
    if (usernameRequest) {
      newUser = await models.UserModel.create({
        lastUpdated: Date.now(),
        username: usernameRequest.name.toLowerCase(),
        uuid: usernameRequest.id,
      });
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
    }

    if (newUser) {
      const user = formatMongoDocument(newUser);
      return reply.code(200).send(user);
    } else {
      return reply.code(400).send({
        error: `There is no MC account with that username!`,
      });
    }
  }
}

function formatMongoDocument(document) {
  return {
    lastUpdated: document.lastUpdated,
    username: document.username,
    uuid: document.uuid,
  };
}

fastify.get("/search", Search);
fastify.listen(3000, function (err, address) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
