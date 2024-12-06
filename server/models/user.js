const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: { type: String, required: true, unique: true },
  gender: String,
  city: String,
  state: String,
  zip: String,
  file: String,
  image: { type: String },
});

module.exports = mongoose.model('User', UserSchema);
