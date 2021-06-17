const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
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
      type: [{ _id: false, name: String, changedToAt: Number }],
      required: false,
      default: [],
    },

    lastUpdated: {
      type: Number,
      required: true,
    },
    views: {
      type: [String],
      default: [],
    },
  },
  { versionKey: false }
);
UserSchema.index({ name: 1 });
UserSchema.index({ uuid: 1 });

module.exports.UserSchema = UserSchema;
module.exports.UserModel = new mongoose.model("User", UserSchema);
