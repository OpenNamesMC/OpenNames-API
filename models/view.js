const mongoose = require("mongoose");

const ViewsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      require: true,
    },
  },
  { versionKey: false }
);
ViewsSchema.index({ name: 1 });

module.exports.ViewsSchema = ViewsSchema;
module.exports.ViewsModel = new mongoose.model("Views", ViewsSchema);
