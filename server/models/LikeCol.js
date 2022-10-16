const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeColSchema = mongoose.Schema({
  userFrom: {
    type: String,
  },
  userTo: {
    type: String,
  },
});

const LikeCol = mongoose.model('LikeCol', LikeColSchema);

module.exports = { LikeCol };
