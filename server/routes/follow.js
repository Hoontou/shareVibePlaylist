const express = require('express');
const router = express.Router();

const { Follow } = require('../models/Follow');
const { PliData } = require('../models/PliData');
const { User } = require('../models/User');

router.post('/getfollowed', (req, res) => {
  console.log(req.body);
  return res.status(200).json({ success: true });
});

router.post('/Followed', (req, res) => {
  Follow.find(
    { userTo: req.body.userTo, userFrom: req.body.userFrom },
    (err, info) => {
      if (err) {
        return res.status(400).json({ success: false });
      } else {
        let result = false;
        if (info.length !== 0) {
          result = true;
        }
        res.status(200).json({ success: true, Followed: result });
      }
    }
  );
});

router.post('/followpeople', async (req, res) => {
  const FollowList = await Follow.find({ userTo: req.body.userTo });

  if (FollowList.length !== 0) {
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
  } else if (FollowList.length == 0) {
    return res.status(200).json({ success: true, list: FollowList });
  } else {
    return res.status(200).json({ success: false });
  }
});

router.post('/followpeopleMyvibe', async (req, res) => {
  const user_id = await User.find({ id: req.body.userTo });
  const FollowList = await Follow.find({ userTo: user_id[0]._id });

  if (FollowList.length !== 0) {
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
  } else if (FollowList.length == 0) {
    return res.status(200).json({ success: true, list: FollowList });
  } else {
    return res.status(200).json({ success: false });
  }
});

router.post('/removeFromFollow', (req, res) => {
  //req.body = {userTo: 내가 팔로우 할 사람의_id, userFrom: 나의 id}
  //Follow모델에서 찾아서 삭제한 후
  Follow.findOneAndDelete(
    {
      userTo: req.body.userTo,
      userFrom: req.body.userFrom,
    },
    (err, doc) => {
      if (err) {
        return res.status(400).json({ removeSuccess: false });
      } else {
        return res.status(200).json({ removeSuccess: true });
      }
    }
  );
});

router.post('/addToFollow', (req, res) => {
  //req.body = {userTo: 내가 팔로우 할 사람의_id, userFrom: 나의 id}
  const follow = new Follow(req.body);
  follow.save((err, data) => {
    if (err) {
      return res.status(400).json({ followSuccess: false });
    } else {
      return res.status(200).json({ followSuccess: true });
    }
  });
});

module.exports = router;
