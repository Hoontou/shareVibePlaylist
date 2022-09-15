const mongoose = require('mongoose');

const PliSchema = mongoose.Schema({
  url: {
    type: String,
    unique: true,
  },
  thum: [String],

  title: {
    type: String,
  },
  subTitle: {
    type: String,
  },
  likes: { type: Number, default: 0 },
});

const PliData = mongoose.model('PliData', PliSchema);

PliSchema.index({ title: 'text' });

module.exports = { PliData };
