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

// Requirements Start
const fs = require("fs");
const { createUserProfile } = require("./utils");
let uuids = JSON.parse(fs.readFileSync("./uuids.json", "utf-8"));
// Requirements End

// Register Accounts
(async () => {
  for (let i = 0; i < uuids.length; i++) {
    checkAndRegisterProfile(uuids[i]);
    uuids = uuids.filter((x) => x !== uuids[i]);
    if (uuids.length % 10 == 0) {
      console.log(`${uuids.length} | Accounts left!`);
      fs.writeFileSync("./uuids.json", JSON.stringify(uuids));
    }
  }
})();

async function checkAndRegisterProfile(query) {
  const newProfile = await createUserProfile(query);
  if (newProfile) {
    console.log(`Registered profile for ${query}`);
    for (const historyInfo of newProfile.name_history) {
      checkAndRegisterProfile(historyInfo.name);
    }
  }
}
// Register Accounts
