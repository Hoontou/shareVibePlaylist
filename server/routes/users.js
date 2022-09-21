const express = require('express');
const router = express.Router();
const axios = require('axios');
const { User } = require('../models/User');
const { PliData } = require('../models/PliData');
const { Coverage } = require('puppeteer');

router.post('/register', async (req, res) => {
  const userInfo = req.body.data;

  const user = new User(userInfo);
  User.findOne({ id: userInfo.id }, (err, item) => {
    if (!item) {
      user.save((err, item) => {
        if (err) {
          return res.status(400).json({ success: false });
        }
        return res.status(200).json({ success: true });
      });
    } else if (item) {
      if (item.nickname !== userInfo.nickname) {
        item.updateOne({ $set: { nickname: userInfo.nickname } }).exec();
      }
      if (item.profile_image !== userInfo.profile_image) {
        item
          .updateOne({ $set: { profile_image: userInfo.profile_image } })
          .exec();
      }
      return res.status(200).json({ success: true });
    }
  });

  //DB에 유저아이디를 찾아서 없으면 넣어줌 이것이 레지스터.
  // User.findOne({ id: userInfo.id }, (err, item) => {
  //   if (!item) {
  //     const user = new User(userInfo);
  //     user.save((err, data) => {
  //       if (err) {
  //         return res.status(400).json({ msg: 'err when saving mongodb' });
  //       }
  //       return res.status(200).send(userInfo);
  //     });
  //   }
  // if (item.nickname !== userInfo.nickname) {
  //   item.updateOne({ $set: { nickname: userInfo.nickname } }).exec();
  // }
  // if (item.profile_image !== userInfo.profile_image) {
  //   item
  //     .updateOne({ $set: { profile_image: userInfo.profile_image } })
  //     .exec();
  // }
  // });
  //그후 유저정보를 클라이언트로 넘겨줌
  // res.status(200).send(userInfo);
}); //사인 인

router.post('/getfavorite', async (req, res) => {
  //먼저 유저아이디로 likelist를 가져옴
  const userId = req.body.id || req.body._id; // id와 _id로의 접근을 구분해줌
  const like_id = req.body.id
    ? await User.find({ id: userId }, { likeList: 1 })
    : await User.find({ _id: userId }, { likeList: 1 });
  if (!like_id[0].likeList[0]) {
    return res.status(200).json({ success: 0 });
  }
  try {
    //likelist로 맵을 돌려서 하나하나 찾아서 변수에 담아주고
    const likePli = await Promise.all(
      like_id[0].likeList.map(async (pli_id) => {
        const pli = await PliData.find({ _id: pli_id });
        return pli[0];
      })
    );
    //성공했으면 보냄
    return res.status(200).json({ success: 2, likePli });
  } catch (err) {
    return res.status(200).json({ success: 1 });
  }

  //밑의 코드는 뻘짓한 코드. map으로 쿼리문을 써서 promise를 배열에 담아 리턴하게 구현했음.
  //구글링해서 Promise가 들어간 배열을 어떻게 처리해야하는가? 를 알아냄.
  //수정된 코드가 위에꺼. Promise.all 메서드를 썼음.
  //정상작동

  // console.log(req.body);
  // User.find({ id: req.body.id }, { likeList: 1 }).exec((err, list) => {
  //   const take = (dog) => {
  //     const collection = [];
  //     for (var i in dog) {
  //       PliData.find({ _id: list[0].likeList[i] }).exec((err, data) => {
  //         collection.push(data[0]);
  //       });
  //     }
  //     return collection;
  //   };
  //   console.log(take(list[0].likeList));
  // });
});
router.get('/getcollections', async (req, res) => {
  const userCollections = await User.find();
  if (!userCollections) {
    return res.status(200).json({});
  }
  const collections = userCollections.map((value) => {
    if (value.likeList[0]) {
      return value;
    }
    return null;
  });
  const filtered = collections.filter(e => e != null);
  //리스트 널값 제거
  return res.status(200).json({ success: 0, filtered });
});

module.exports = router;
