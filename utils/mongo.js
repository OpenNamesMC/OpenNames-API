const mongoose = require("mongoose");

const nameHistoryType = [{ _id: false, name: String, changedToAt: Number }];
const UserSchema = new mongoose.Schema(
  {
    lastUpdated: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      unique: true,
      required: true,
    },
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    name_history: {
      type: nameHistoryType,
      required: false,
      default: [],
    },
  },
  { versionKey: false }
);
UserSchema.index({ name: 1 });
UserSchema.index({ uuid: 1 });

module.exports.UserSchema = UserSchema;
module.exports.UserModel = new mongoose.model("User", UserSchema);
