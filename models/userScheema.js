import mongoose from "mongoose";
const reqString = {
  type: String,
  required: true,
};
// schema for password entries
const itemSchema = new mongoose.Schema({
  websitename: reqString,
  username: reqString,
  email: reqString,
  password: reqString,
});
// schema for User Registration
const userSchema = new mongoose.Schema({
  name: reqString,
  email: reqString,
  password: reqString,
  items: [itemSchema],
});
const userModel = mongoose.model("PasswordUser", userSchema);
export default userModel;
