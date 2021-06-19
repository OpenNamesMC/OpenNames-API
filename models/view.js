const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);
ViewSchema.index({ name: 1 });

module.exports.ViewSchema = ViewSchema;
module.exports.ViewModel = new mongoose.model("View", ViewSchema);
