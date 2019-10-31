const fetch = require('node-fetch');
const fs = require('fs').promises;
const cheerio = require('cheerio');
const getUrls = require('get-urls');

const PAGING_URL_MOVIES = 'https://www.filmai.org/filmai/page';


const parseMoviesFromPage = async () => {

  // Load log file.
  let logFile = await fs.readFile('log.json', 'utf-8');
  let log = await JSON.parse(logFile);
  let urlSet = new Set(log.urls);

  try {
    for (let i=1; i<=405; i++) {
      let pageUrl = `${PAGING_URL_MOVIES}/${i}/`;
    
      // Fetch URL and load html object
      let response = await fetch(pageUrl);
      let res = await response.text();
      let $ = cheerio.load(res);
      let movieElements = $('#dle-content > .movie-item a.movie-title');
    
      let movieUrls = [];
      for (let i=0; i<movieElements.length; i++) {
        movieUrls.push(movieElements.eq(i).attr('href'));
      }
      
      for (url of movieUrls) {
        urlSet.add(url);
      }
      console.log(`Fetched from page '${i}'`)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.log(err);
  } finally {
    log.urls = Array.from(urlSet);
    log.length = log.urls.length;
  
    // Updating log file.
    let json = JSON.stringify(log, null, 2);
    let fileHandle;
    try {
      fileHandle = await fs.writeFile(`./log.json`, json);
      console.log(`Log updated.`);
    } catch (err) {
      console.log(`Error updating log file.`);
    } finally {
      if (fileHandle !== undefined) {
        fileHandle.close();
      }
    }
  }
};

parseMoviesFromPage();