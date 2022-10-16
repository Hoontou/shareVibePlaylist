const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  gender: {
    type: String,
  },
  birthyear: {
    type: String,
  },
  nickname: {
    type: String,
  },
  profile_image: {
    type: String,
  },
  likeList: [String],
  comment: {
    type: String,
  },
});

userSchema.methods.makePliList = function (list, callbackF) {
  console.log(list);
  callbackF(null);
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
