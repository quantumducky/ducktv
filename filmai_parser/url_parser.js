const fetch = require('node-fetch');
const fs = require('fs').promises;
const cheerio = require('cheerio');
const getUrls = require('get-urls');


const BASE_URL = 'https://www.filmai.org';
const PAGING_URL_MOVIES = 'https://www.filmai.org/filmai/page';

// const URL = 'https://www.filmai.org/5695-deadpool-2016.html';
// const URL = 'https://www.filmai.org/5930-me-before-you-2016.html';


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


const parseMovie = (movieURL) => {
  return new Promise(async (resolve, reject) => {
    try {
      let movie = {}; // contains movie properties

      // Fetch URL and load html object
      let response = await fetch(movieURL);
      let res = await response.text();
      let $ = cheerio.load(res);

      // Parse movie properties
      movie.title = $('header.mov-top > h1').text();
      movie.imdbText = $('header.mov-top > div.mov-date > b').text();
      movie.imdb = parseFloat(movie.imdbText.split(' ')[1].replace(',', '.'));
      // movie.description = $('div.full-text.clearfix').contents().not('a').text();
      movie.posterURL = BASE_URL + $('div.film-poster > img').attr('src');
      movie.videoURL = Array.from(getUrls($('div.box.full-text > script').html()))[0].split('?')[0];

      
      // Parse elements in the movie info section
      let movieInfo = {};
      let movieInfoElements = $('.film-info, .film-info2').children();
      for (let i=0; i<movieInfoElements.length; i++) {
        const label = movieInfoElements.eq(i).find('.fi-label').text();
        const contents = movieInfoElements.eq(i).find('.fi-desc').text();
        movieInfo[label] = contents;
      }
      
      // Add movie info items to the movie object
      if (movieInfo['Metai:']) movie.year = parseInt(movieInfo['Metai:']);
      if (movieInfo['Trukmė:']) movie.length = movieInfo['Trukmė:'];
      if (movieInfo['Kalba:']) movie.language = movieInfo['Kalba:'];
      if (movieInfo['Šalis:']) movie.country = movieInfo['Šalis:'];
      if (movieInfo['Žanras:']) movie.genres = movieInfo['Žanras:'].replace('/', ',').split(',').map(n => n.trim());
      if (movieInfo['Aktoriai:']) movie.actors = movieInfo['Aktoriai:'];
      if (movieInfo['Režisierius:']) movie.director = movieInfo['Režisierius:'];

      resolve(movie);
    } catch (err) {
      reject(`Failed to parse URL: ${movieURL}`);
    }
  })
};

// parseMovie(URL)
//   .then(movie => console.log(movie))
//   .catch(err => console.log(err));
