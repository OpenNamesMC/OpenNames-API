const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    lastUpdated: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    
    uuid: {
      type: String,
      unique: true,
    },
    name_history: {
      type: [{ _id: false, name: String, changedToAt: Number }],
      default: [],
    },
  },
  { versionKey: false }
);
ProfileSchema.index({ name: 1 });
ProfileSchema.index({ uuid: 1 });

module.exports.ProfileSchema = ProfileSchema;
module.exports.ProfileModel = new mongoose.model("Profile", ProfileSchema);
