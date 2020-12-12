const fetch = require('node-fetch');
const cheerio = require('cheerio');

const INTERVAL =  5;
let i = 0;


(async () => {
  // mainInterval = setInterval(fetchUrls, INTERVAL);
  await fetchUrls();
  console.log('done');
})();

async function fetchUrls() {
  // if (i === 10000) {
  //   clearInterval(mainInterval);
  // }

  const url = `http://e01.plius.tv:64144/n128/index.m3u8`;

  await fetch(url).then(res => {
    return res.text();
  }).then(data => console.log(data));

  // i++;
}