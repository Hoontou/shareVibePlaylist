const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = mongoose.Schema({
  userFrom: {
    type: String,
  },
  pliTo: {
    type: String,
  },
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = { Favorite };
