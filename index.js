const fastify = require("fastify")({ trustProxy: true });
const mongoose = require("mongoose");
const { config } = require("dotenv");
const SearchRoute = require("./routes/search");
const LeaderboardRoute = require("./routes/leaderboard");

config();

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  fastify.get("/search", SearchRoute);
  fastify.get("/leaderboard", LeaderboardRoute);
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
