const ms = require("ms");
const { createUserProfile, formatUserDocument } = require("./index");
const { UserModel } = require("./mongo");

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
        user = formatUserDocument(users[0]);
        document = users[0];
        if (user.lastUpdated - Date.now() > 60 * 60 * 1000) {
          await UserModel.deleteOne({
            _id: document._id,
          });
          document = await createUserProfile(query);
          if (document) user = formatUserDocument(document);
        }
      } else {
        document = await createUserProfile(query);
        if (document) user = formatUserDocument(document);
      }

      if (!user) {
        const pastUser = await UserModel.aggregate([
          {
            $match: {
              "name_history.name": {
                $regex: query,
                $options: "i",
              },
              "name_history.changedToAt": {
                $exists: true,
              },
            },
          },
          {
            $sort: {
              "name_history.changedToAt": -1,
            },
          },
          {
            $limit: 1,
          },
        ]);
        if (pastUser.length) {
          const history = pastUser[0].name_history;
          const nameChangeTime =
            history[
              history.indexOf(
                history.find(
                  (x) => x.name.toLowerCase() === query.toLowerCase()
                )
              ) + 1
            ].changedToAt;

          const dropTime = nameChangeTime + 37 * 24 * 60 * 60 * 1000;
          const timeUntilDrop = dropTime - Date.now();

          document = pastUser[0];
          if (!(Math.sign(timeUntilDrop) === -1)) {
            user = {
              name: query,
              unixDropTime: dropTime,
              stringDropTime: ms(timeUntilDrop),
            };
          }
        }
      }

      if (user) {
        if (!document.views.includes(request.ip)) {
          document.views.push(request.ip);
          await UserModel.updateOne(
            {
              _id: document._id,
            },
            document
          );
        }
        return reply
          .code(200)
          .header("Access-Control-Allow-Origin", "*")
          .send(user);
      } else {
        return reply
          .code(204)
          .header("Access-Control-Allow-Origin", "*")
          .send(`No username found!`);
      }
    } catch (err) {
      console.log(err);
      reply.code(500).header("Access-Control-Allow-Origin", "*").send({
        error: `Internal Server Error`,
      });
    }
  } else {
    reply.code(400).header("Access-Control-Allow-Origin", "*").send({
      error: `Please provide the query parameter!`,
    });
  }
}

module.exports.Routes = { Search };
