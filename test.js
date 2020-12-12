const fetch = require('node-fetch');
const cheerio = require('cheerio');

const INTERVAL =  3;
const ROOT_URL = 'http://www.music.lt/';
const MAIN_URL = 'http://www.music.lt/Lietuva-grupes-1.html';
let i = 0;


(async () => {
  let response = await fetch(MAIN_URL);
  let res = await response.text();
  let $ = cheerio.load(res);

  let groupList = [];
  $('div.content tbody tr td a').each((i, elem) => {
    if ($(elem).attr('href').startsWith('lt')) {
      groupList.push({name: $(elem).text(), url: ROOT_URL + $(elem).attr('href')})
    }
  });

  groupList.forEach(item => {
    let response = await fetch(item.url);
    let res = await response.text();
    let $ = cheerio.load(res);
  })

  while (fetched < LIMIT && tried < urls.length) {
    let movieUrl = urls[tried++];
    if (fetchedSet.has(movieUrl) || failedSet.has(movieUrl)) {
      continue;
    }
    await parseMovie(movieUrl)
      .then(movie => {
        movies.push(movie);
        fetchedSet.add(movieUrl);
        console.log(`Fetched movie (${fetched+1}): ${movieUrl}`);
        fetched++;
      })
      .catch(() => {
        console.log(`Failed to fetch movie (${fetched+1}): ${movieUrl}`);
        failedSet.add(movieUrl);
      });
    await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
  }

  // mainInterval = setInterval(fetchUrls, INTERVAL);
})();

async function fetchUrls() {
  if (i === 10000) {
    clearInterval(mainInterval);
  }

  const url = `https://susivienijimas.lt/`;

  await fetch(url).then(res => {
    console.log(`Call [${i}]: ${res.status}`);
  });

  i++;
}