const fs = require("fs");
const mongoose = require("mongoose");
const { config } = require("dotenv");
const { fetchMojangProfiles } = require("./utils");
const { ProfileModel } = require("./models/profile");
const chalk = require("chalk");

config();

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let uuids = JSON.parse(fs.readFileSync("./uuids.json", "utf-8"));
// let historyNames = [];

const historyNames = new Set();

const commafy = (num) => num.toString().replace(/\B(?=(?:\d{3})+)$/g, ",");

console.log(chalk.green(`Loaded a total of ${commafy(uuids.length)} names!`));

processAccounts(uuids);
async function processAccounts(query, restart = false) {
  if (restart) historyNames = new Set();

  let pastTime = new Date().getTime();
  const accountChunks = chunk(query, 25);
  for (let accountChunk of accountChunks) {
    await registerNameArray(accountChunk);

    uuids = uuids.filter((x) => !accountChunk.includes(x));
    if (uuids.length === 0) processAccounts(Array.from(historyNames), true);

    fs.writeFileSync("./uuids.json", JSON.stringify(uuids));
    console.log(
      chalk.green(
        `${commafy(uuids.length)} Accounts left to check! | ${
          new Date().getTime() - pastTime
        }ms`
      )
    );
    pastTime = new Date().getTime();
  }
}

async function registerNameArray(query) {
  let profiles = await fetchMojangProfiles(query);
  if (profiles.length) {
    try {
      await ProfileModel.insertMany(profiles);
    } catch (e) {}

    profiles.forEach((profile) => {
      profile.name_history?.forEach((history) => {
        if (history.name !== profile.name) historyNames.add(history.name);
      });
    });
  } else {
    console.log(chalk.red(`WARNING THE MOJANG API STOPPED WORKING`));
  }
}

function baseSlice(array, start, end) {
  var index = -1,
    length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : (end - start) >>> 0;
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

function chunk(array, size) {
  var length = array == null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  var index = 0,
    resIndex = 0,
    result = Array(Math.ceil(length / size));

  while (index < length) {
    result[resIndex++] = baseSlice(array, index, (index += size));
  }
  return result;
}
