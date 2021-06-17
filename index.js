const fastify = require("fastify")({ trustProxy: true });
const mongoose = require("mongoose");
const { config } = require("dotenv");
const { Routes } = require("./utils/routes");

config();

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  fastify.get("/search", Routes.Search);
  fastify.listen(
    parseInt(process.env.PORT),
    process.env.HOST,
    function (err, address) {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      console.log(`server listening on ${address}`);
    }
  );
})();
