const express = require('express');
const router = express.Router();

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { PliData } = require('../models/PliData');
const { responseInterceptor } = require('http-proxy-middleware');

const getPliData = async (address, timer) => {
  //몇번 시도 후 그래도 안되면 null 반환
  if (timer == 0) {
    return null;
  }
  // 브라우저를 실행한다.
  // 옵션으로 headless모드를 끌 수 있다.
  const browser = await puppeteer.launch({
    headless: true,
  });

  // 새로운 페이지를 연다.
  const page = await browser.newPage();
  // 페이지의 크기를 설정한다.
  await page.setViewport({
    width: 1366,
    height: 768,
  });
  // "https://www.goodchoice.kr/product/search/2" URL에 접속한다. (여기어때 호텔 페이지)
  await page.goto(address);
  // 페이지의 HTML을 가져온다.
  const content = await page.content();
  // $에 cheerio를 로드한다.
  const $ = cheerio.load(content);
  // 복사한 리스트의 Selector로 리스트를 모두 가져온다.
  const lists = $(
    '  #content > div > div.summary_section > div.summary_thumb > div > span.quarter'
  );
  const data = {
    thum: [],
    url: address,
  };
  data.title = $(
    '#content > div > div.summary_section > div.summary > div.text_area > h2 > span.title'
  ).text();
  data.subTitle = $(
    '#content > div > div.summary_section > div.summary > div.text_area > h2 > span.sub_title'
  ).text();
  if (!data.subTitle) {
    data.subTitle = $(
      '#content > div > div.summary_section > div.summary > div.text_area > h2 > a > span'
    ).text();
  }

  // 모든 리스트를 순환한다.
  lists.each((index, list) => {
    // 각 리스트의 하위 노드중 호텔 이름에 해당하는 요소를 Selector로 가져와 텍스트값을 가져온다.
    const src = $(list).find('img').attr('src');
    // 인덱스와 함께 로그를 찍는다.
    data.thum[index] = src;
  });
  if (!data.thum[0]) {
    const thumn2 = $(
      '#content > div > div.summary_section > div.summary_thumb'
    );
    thumn2.each((index, list) => {
      // 각 리스트의 하위 노드중 호텔 이름에 해당하는 요소를 Selector로 가져와 텍스트값을 가져온다.
      const src = $(list).find('img').attr('src');
      // 인덱스와 함께 로그를 찍는다.
      data.thum[index] = src;
    });
  }
  // 브라우저를 종료한다.
  browser.close();
  return data.title ? data : getPliData(address, timer - 1);
};

router.post('/postpli', (req, res) => {
  if (!req.body.url.includes('vibe.naver.com')) {
    return res.status(200).json({ success: 3 });
  }
  PliData.findOne({ url: req.body.url }, async (err, item) => {
    if (item) {
      return res.status(200).json({ success: 1, item }); //있으면 이미 있다고 전달.
    }
    const pli = await getPliData(req.body.url, 5);
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
        .status(200)
        .json({ success: false, msg: 'err when finding DB' });
    } else if (!pli) {
      return res
        .status(200)
        .json({ success: false, msg: "there's no pli in DB" });
    }
    return res.status(200).json({ success: true, pli });
  });
}); // 플리 세부정보 페이지에서 오는 요청

router.post('/getplis/latest', (req, res) => {
  PliData.find()
    .sort({ _id: -1 }) // 새로 저장된 순서로 정렬한다
    .limit(16)
    .skip((req.body.pageNum - 1) * 16)
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
  PliData.find()
    .sort({ likes: -1 }) // 좋아요 많은 순서대로 정렬한다.
    .limit(16)
    .skip((req.body.pageNum - 1) * 16)
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
  PliData.find()
    .sort({ _id: 1 }) // 오래된 순서대로 정렬한다.
    .limit(16)
    .skip((req.body.pageNum - 1) * 16)
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

router.get('/getpliby_id', (req, res) => {});

module.exports = router;
