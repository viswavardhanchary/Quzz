const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unqiue: true,
    required: true
  },
  password: String,
});

const Users = mongoose.model('user' , UserSchema);
module.exports=[Users];
