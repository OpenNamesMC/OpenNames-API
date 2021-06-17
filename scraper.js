// Database Start
const mongoose = require("mongoose");
const { config } = require("dotenv");

config();

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Database End

const fs = require("fs");
const { createUserProfile } = require("./utils");
const { UserModel } = require("./utils/mongo");

let uuids = JSON.parse(fs.readFileSync("./uuids.json", "utf-8"));
(async () => {
  for (let i = 0; i < uuids.length; i++) {
    await checkAndRegisterProfile(uuids[i]);
    uuids = uuids.filter((x) => x !== uuids[i]);
    if (uuids.length % 10 == 0) {
      console.log(`${uuids.length} | Accounts left!`);
      fs.writeFileSync("./uuids.json", JSON.stringify(uuids));
    }
  }
})();

async function checkAndRegisterProfile(query) {
  const userProfiles = await UserModel.aggregate([
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
  if (!userProfiles.length) {
    const newProfile = await createUserProfile(query);
    if (newProfile) {
      console.log(`Registered profile for ${query}`);
      for (const historyInfo of newProfile.name_history) {
        checkAndRegisterProfile(historyInfo.name);
      }
    }
  }
}
