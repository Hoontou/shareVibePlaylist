const express = require('express');
const router = express.Router();

const { PliData } = require('../models/PliData');
const { getPliData } = require('../control/getPliData');
const { responseInterceptor } = require('http-proxy-middleware');

router.post('/postpli', (req, res) => {
  PliData.findOne({ url: req.body.url }, async (err, item) => {
    if (item) {
      return res.status(200).json({ success: 1, item }); //있으면 이미 있다고 전달.
    }
    const pli = await getPliData(req.body.url, 3);
    if (!pli) {
      return res.status(200).json({ success: 3 }); //url이 잘못됐거나 크롤링이 제대로 작동안하면,
    }
    const pliData = new PliData(pli);
    pliData.save((err, data) => {
      if (err) {
        return res.status(200).json({ success: 2 });
      }
      return res.status(200).json({ success: 0, pliData });
    });
  });
}); //서버에 플리 넣기.

router.post('/getpli', (req, res) => {
  PliData.findOne({ _id: req.body._id }, (err, pli) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, msg: 'err when finding DB' });
    } else if (!pli) {
      return res
        .status(400)
        .json({ success: false, msg: "there's no pli in DB" });
    }
    return res.status(200).json({ success: true, pli });
  });
}); // 플리 세부정보 페이지에서 오는 요청

router.post('/getplis/latest', (req, res) => {
  console.log(req.body);
  PliData.find()
    .sort({ _id: -1 }) // 새로 저장된 순서로 정렬한다
    .limit(12)
    .skip((req.body.pageNum - 1) * 12)
    .exec((err, plis) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, msg: 'err when finding DB' });
      }
      res.status(200).json({ success: true, plis });
    });
}); //랜딩페이지에서 오는 요청 플리를 디비에서 가져와 클라이언트에 보냄

router.post('/getplis/favorite', (req, res) => {
  console.log(req.body);
  PliData.find()
    .sort({ likes: -1 }) // 좋아요 많은 순서대로 정렬한다.
    .limit(12)
    .skip((req.body.pageNum - 1) * 12)
    .exec((err, plis) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, msg: 'err when finding DB' });
      }
      res.status(200).json({ success: true, plis });
    });
}); //랜딩페이지에서 오는 요청 플리를 디비에서 가져와 클라이언트에 보냄

router.post('/getplis/oldest', (req, res) => {
  console.log(req.body);
  PliData.find()
    .sort({ _id: 1 }) // 오래된 순서대로 정렬한다.
    .limit(12)
    .skip((req.body.pageNum - 1) * 12)
    .exec((err, plis) => {
      if (err) {
        return res.status(200).json({
          success: false,
          msg: '현재 서버에 문제가 있어요. 나중에 다시 시도해 주세요..',
        });
      }
      res.status(200).json({ success: true, plis });
    });
}); //랜딩페이지에서 오는 요청 플리를 디비에서 가져와 클라이언트에 보냄

router.get('/getplis/searchpli', (req, res) => {
  PliData.find()
    .sort({ likes: -1 })
    .exec((err, plis) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, msg: 'err when finding DB' });
      }
      res.status(200).json({ success: true, plis });
    });
});

router.get('/getpliby_id', (req, res) => {
  console.log(req.body);
});

module.exports = router;
