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

console.log(
  chalk.cyan(`[${commafy(uuids.length)}] `) + chalk.green(`Loaded Names`)
);

processAccounts(uuids);
async function processAccounts(query) {
  let pastTime = new Date().getTime();
  const accountChunks = chunk(query, 25);
  for (let accountChunk of accountChunks) {
    await registerNameArray(accountChunk);
    uuids = uuids.filter((x) => !accountChunk.includes(x));
    fs.writeFileSync("./uuids.json", JSON.stringify(uuids));
    console.log(
      chalk.cyan(`[${commafy(uuids.length)}] `) +
        chalk.green(`Accounts Left To Check `) +
        chalk.yellow(`(${new Date().getTime() - pastTime}ms)`)
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

function commafy(num) {
  const str = num.toString().split(".");
  if (str[0].length >= 4) {
    str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, "$1,");
  }
  if (str[1] && str[1].length >= 4) {
    str[1] = str[1].replace(/(\d{3})/g, "$1 ");
  }
  return str.join(".");
}
