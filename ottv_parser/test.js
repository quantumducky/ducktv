const fetch = require('node-fetch');

const urls = [
  'http://88.216.48.147/flussonic/TVPlaySport/video.m3u8',
  'http://fox-tv.fun:25461/qomtrlcl/7jU3T17pnh/2781',
  'http://88.216.48.147/flussonic/TVPlaySport/video.m3u8',
];

(async () => {

  Promise.all(urls.map(async url => {
    try {
      let res = await fetch(url);
      console.log(res.ok);
    } catch (err) {
      console.log('not working')
    }
  }));

  // try {
  //   let response = await fetch(URL);
  //   let status = await response.status;
  //   // console.log(status);
  // } catch (err) {
  //   console.log('not working')
  // }

})();