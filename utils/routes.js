const ms = require("ms");
const { createUserProfile } = require("./index");
const { UserModel } = require("./mongo");

// Check the UUID to see name history and load unique names into db
async function Search(request, reply) {
  const query = request.query.query;
  try {
    let user;
    let users = await UserModel.aggregate([
      {
        $match: {
          $or: [{ name: query.toLowerCase() }, { uuid: query }],
        },
      },
      {
        $project: {
          name: 1,
          uuid: 1,
          name_history: 1,
        },
      },
    ]);

    if (users.length) {
      user = users[0];
      if (user.lastUpdated - Date.now() > 60 * 60 * 1000) {
        await user.deleteOne();
        user = await createUserProfile(query);
      }
    } else {
      user = await createUserProfile(query);
    }

    if (!user) {
      const pastUser = await UserModel.aggregate([
        {
          $match: {
            "nameHistory.name": {
              $regex: query,
              $options: "i",
            },

            "nameHistory.changedAt": {
              $exists: true,
            },
          },
        },
        {
          $sort: {
            "nameHistory.changedAt": -1,
          },
        },
        {
          $limit: 1,
        },
      ]);
      if (pastUser.length) {
        const history = pastUser[0].nameHistory;
        const nameChangeTime =
          history[
            history.indexOf(
              history.find((x) => x.name.toLowerCase() === query.toLowerCase())
            ) + 1
          ].changedAt;

        user = {
          name: query,
          unixDropTime: nameChangeTime + 37 * 24 * 60 * 60 * 1000,
          legitDropTime: ms(
            nameChangeTime + 37 * 24 * 60 * 60 * 1000 - Date.now()
          ),
        };
      }
    }

    if (user) {
      return reply.code(200).send(user);
    } else {
      return reply.code(400).send({
        error: `There is no MC account with that name!`,
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
