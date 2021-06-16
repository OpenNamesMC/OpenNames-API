const fastify = require("fastify")();
const mongoose = require("mongoose");
const { config: dotenv } = require("dotenv");

dotenv();

mongoose.connect(process.env.MONGO_URI);

fastify.get("/search", function (request, reply) {
  const use
  const username = request.reply.send({ hello: "world" });
});

fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
