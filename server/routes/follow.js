const express = require('express');
const router = express.Router();

const { Follow } = require('../models/Follow');
const { PliData } = require('../models/PliData');
const { User } = require('../models/User');

router.post('/getfollowd', (req, res) => {
  console.log(req.body);
  return res.status(200).json({ success: true });
});

router.post('/Followd', (req, res) => {
  Follow.find(
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

      res.status(200).json({ success: true, Followd: result });
    }
  );
});

router.post('/removeFromFollow', (req, res) => {
  //Follow모델에서 찾아서 삭제한 후
  Follow.findOneAndDelete(
    {
      pliTo: req.body.pliTo,
      userFrom: req.body.userFrom,
    },
    (err, doc) => {
      if (err) return res.status(400).send(err);
      //pliData에 follows를 1 감소시킨다.
      PliData.findOneAndUpdate(
        { _id: req.body.pliTo },
        { $inc: { follows: -1 } },
        (err, info) => {
          if (err) {
            return res.json({
              success: false,
              msg: 'err when updating follows to DB',
            });
          }
          User.findOneAndUpdate(
            { id: req.body.userFrom },
            { $pull: { followList: req.body.pliTo } },
            (err, info) => {
              4;
              if (err) {
                return res.json({
                  success: false,
                  msg: 'err when updating follows to DB',
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

router.post('/addToFollow', (req, res) => {
  const Follow = new Follow(req.body);
  //Follow 에다가 추가하고 PliData에 follows를 1더한다.
  Follow.save((err, doc) => {
    if (err) return res.status(400).send(err);
    // pliData에 follows를 1 더한다.
    PliData.findOneAndUpdate(
      { _id: req.body.pliTo },
      { $inc: { follows: 1 } },
      (err, info) => {
        if (err) {
          return res.json({
            success: false,
            msg: 'err when updating follows to DB',
          });
        }
        User.findOneAndUpdate(
          { id: req.body.userFrom },
          { $push: { followList: req.body.pliTo } },
          (err, info) => {
            if (err) {
              return res.json({
                success: false,
                msg: 'err when updating follows to DB',
              });
            }
            return res.status(200).json({ success: true });
          }
        );
      }
    );
  });
});

router.post('/followdpeople', async (req, res) => {
  const FollowList = await Follow.find({ pliTo: req.body._id });

  if (FollowList) {
    const list = await Promise.all(
      FollowList.map(async (item) => {
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
