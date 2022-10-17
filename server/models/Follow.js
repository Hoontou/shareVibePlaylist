const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowSchema = mongoose.Schema({
  userFrom: {
    type: String,
  },
  userTo: {
    type: String,
  },
});

const Follow = mongoose.model('Follow', FollowSchema);

module.exports = { Follow };
