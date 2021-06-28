const fastify = require("fastify")({ trustProxy: true });
const mongoose = require("mongoose");
const { config } = require("dotenv");

config();

fastify.register(require('fastify-cors'), { 
  origin: "*" // Access-Control-Allow-Origin: *
})

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

fastify.get("/search", require("./routes/search"));
fastify.get("/leaderboard", require("./routes/leaderboard"));
fastify.get("/dropping", require("./routes/dropping"));
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
