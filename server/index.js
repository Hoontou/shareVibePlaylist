const express = require('express');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

//미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors());

//db연결
const mongoose = require('mongoose');
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));

//라우터 분리
app.use('/api/users', require('./routes/users'));
app.use('/api/pli', require('./routes/pli'));
app.use('/api/favorite', require('./routes/favorite'));
app.use('/api/follow', require('./routes/follow'));

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
