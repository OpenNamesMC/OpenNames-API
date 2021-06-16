const { Schema, Model } = require("mongoose");

const UserSchema = new Schema({
  username: String,
  uuid: String,
  history: [],
});
UserSchema.index({ username: 1 });
UserSchema.index({ uuid: 1 });

export const UserModel = new Model("User", UserSchema);
