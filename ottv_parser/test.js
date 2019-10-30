const fetch = require('node-fetch');
const cheerio = require('cheerio');


const URL = 'https://www.filmai.org/5695-deadpool-2016.html';

(async () => {

  try {
    let response = await fetch(URL);
    let res = await response.text();
    let $ = cheerio.load(res);
    let poster = $('div.film-poster');
    console.log(poster.html());
  } catch (err) {
    console.log('not working');
  }

})();
