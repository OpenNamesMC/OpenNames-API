const mongoose = require("mongoose");

const HypixelType = {
  lastUpdated: {
    type: Number,
    required: true,
    default: Date.now,
  },
  playTime: {
    type: Number,
    required: false,
  },
  karma: {
    type: Number,
    required: false,
  },
  rank: {
    type: String,
    required: false,
  },
};

const ProfileSchema = new mongoose.Schema(
  {
    lastUpdated: {
      type: Number,
      required: true,
      default: Date.now,
    },
    name: {
      type: String,
      required: true,
      sparse: true,
      unique: true,
    },
    uuid: {
      type: String,
      sparse: true,
      unique: true,
    },
    name_history: {
      type: [{ _id: false, name: String, changedToAt: Number }],
      default: [],
    },
    hypixel: {
      type: HypixelType,
      default: null,
    },
  },
  { versionKey: false }
);
ProfileSchema.index({ name: 1 });
ProfileSchema.index({ uuid: 1 });

module.exports.ProfileSchema = ProfileSchema;
module.exports.ProfileModel = new mongoose.model("Profile", ProfileSchema);
