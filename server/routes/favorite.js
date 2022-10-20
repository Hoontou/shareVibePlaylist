const express = require('express');
const router = express.Router();

const { Favorite } = require('../models/Favorite');
const { PliData } = require('../models/PliData');
const { User } = require('../models/User');

router.post('/favorited', (req, res) => {
  Favorite.find(
    { pliTo: req.body.pliTo, userFrom: req.body.userFrom },
    (err, info) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, msg: 'err when getting num from DB' });
      }
      let result = false;
      if (info.length !== 0) {
        result = true;
      }

      res.status(200).json({ success: true, favorited: result });
    }
  );
});

router.post('/removeFromFavorite', (req, res) => {
  //favorite모델에서 찾아서 삭제한 후
  Favorite.findOneAndDelete(
    {
      pliTo: req.body.pliTo,
      userFrom: req.body.userFrom,
    },
    (err, doc) => {
      if (err) return res.status(400).send(err);
      //pliData에 likes를 1 감소시킨다.
      PliData.findOneAndUpdate(
        { _id: req.body.pliTo },
        { $inc: { likes: -1 } },
        (err, info) => {
          if (err) {
            return res.json({
              success: false,
              msg: 'err when updating likes to DB',
            });
          }
          User.findOneAndUpdate(
            { id: req.body.userFrom },
            { $pull: { likeList: req.body.pliTo } },
            (err, info) => {
              4;
              if (err) {
                return res.json({
                  success: false,
                  msg: 'err when updating likes to DB',
                });
              }
              return res.status(200).json({ success: true });
            }
          );
        }
      );
    }
  );
});

router.post('/addToFavorite', (req, res) => {
  const reqBody = { pliTo: req.body.pliTo, userFrom: req.body.userFrom };
  const favorite = new Favorite(reqBody);
  //favorite 에다가 추가하고 PliData에 Likes를 1더한다.
  favorite.save((err, doc) => {
    if (err) return res.status(400).json({ msg: err });
    // pliData에 likes를 1 더한다.
    PliData.findOneAndUpdate(
      { _id: req.body.pliTo },
      { $inc: { likes: 1 } },
      (err, info) => {
        if (err) {
          return res.json({
            success: false,
            msg: 'err when updating likes to DB',
          });
        }
        User.findOneAndUpdate(
          { id: req.body.userFrom },
          { $push: { likeList: req.body.pliTo } },
          (err, info) => {
            if (err) {
              return res.json({
                success: false,
                msg: 'err when updating likes to DB',
              });
            }
            return res.status(200).json({ success: true });
          }
        );
      }
    );
  });
});

router.post('/likedpeople', async (req, res) => {
  const favoriteList = await Favorite.find({ pliTo: req.body.pliTo });

  if (favoriteList) {
    const list = await Promise.all(
      favoriteList.map(async (item) => {
        const a = item.userFrom;
        const user = await User.find(
          { id: a },
          { _id: 1, nickname: 1, profile_image: 1 }
        );
        return [user[0].nickname, user[0]._id, user[0].profile_image];
      })
    );
    return res.status(200).json({ success: true, list });
  } else {
    return res.status(200).json({ success: false });
  }
});

module.exports = router;
