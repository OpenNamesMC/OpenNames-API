const { kStringMaxLength } = require("buffer");
const mongoose = require("mongoose");

const nameHistoryType = [{ username: String, changedAt: Number }];

const UserSchema = new mongoose.Schema(
  {
    lastUpdated: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    nameHistory: {
      type: nameHistoryType,
      required: false,
      default: [],
    },
  },
  { versionKey: false }
);
UserSchema.index({ username: 1 });
UserSchema.index({ uuid: 1 });

module.exports.UserSchema = UserSchema;
module.exports.UserModel = new mongoose.model("User", UserSchema);
