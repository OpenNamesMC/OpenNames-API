const fastify = require("fastify")();
const mongoose = require("mongoose");
const { config } = require("dotenv");

const { Routes } = require("./utils/routes");

config();

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

fastify.get("/search", Routes.Search);
fastify.listen(3000, function (err, address) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
