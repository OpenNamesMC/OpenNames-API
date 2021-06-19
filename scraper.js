const fs = require("fs");
const mongoose = require("mongoose");
const { config } = require("dotenv");

config();

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let uuids = JSON.parse(fs.readFileSync("./uuids.json", "utf-8"));

loop();

async function loop(nameHistory) {
  let query;
  if (!nameHistory.length) {
    query = uuids.splice(0, 25);
    uuids = uuids.filter((x) => !query.includes(x));
    fs.writeFileSync("./uuids.json", JSON.stringify(uuids));
    console.log(`There are ${uuids.length} accounts left to register!`);
  }

  if (!nameHistory.length && !query.length) {
    console.log(`Done!`);
  } else {
    const registered = await registerNameArray(queryNames);
    for (const info of registered) {
      await loop(info.name_history.map((x) => x.name));
    }
  }
}

async function registerNameArray(query) {
  let profiles = await this.fetchMojangProfiles(query);
  if (profiles.length) {
    ProfileModel.insertMany(
      profiles.map((x) => {
        x.lastUpdated = Date.now();
        return x;
      })
    );
    return profiles;
  } else {
    return false;
  }
}
