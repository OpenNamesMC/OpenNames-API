const ms = require("ms");
const { createUserProfile, formatUserDocument } = require("./index");
const { UserModel } = require("./mongo");

// Check the UUID to see name history and load unique names into db
async function Search(request, reply) {
  const query = request.query.query;
  if (query) {
    try {
      let user, document;
      let users = await UserModel.aggregate([
        {
          $match: {
            $or: [
              {
                name: {
                  $regex: query,
                  $options: "i",
                },
              },
              { uuid: query },
            ],
          },
        },
      ]);

      if (users.length) {
        user = users[0];
        document = users[0];
        if (user.lastUpdated - Date.now() > 60 * 60 * 1000) {
          await document.deleteOne();
          document = await createUserProfile(query);
          user = formatUserDocument(document);
        }
      } else {
        document = await createUserProfile(query);
        user = formatUserDocument(document);
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
                history.find(
                  (x) => x.name.toLowerCase() === query.toLowerCase()
                )
              ) + 1
            ].changedAt;

          document = pastUser[0];
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
        if (!document.views.includes(request.ip)) {
          document.views.push(request.ip);
          await document.save();
        }
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
  } else {
    reply.code(400).send({
      error: `Please provide the query parameter!`,
    });
  }
}

module.exports.Routes = { Search };
