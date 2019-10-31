const fetch = require('node-fetch');
const fs = require('fs').promises;
const cheerio = require('cheerio');
const getUrls = require('get-urls');


const BASE_URL = 'https://www.filmai.org';
const LIMIT = 100;

const URL = 'https://www.filmai.org/9223-savas-zmogus-labiausiai-ieskomas-2019-inside-man-most-wanted.html';


// main();

parseMovie(URL)
  .then(movie => console.log(movie))
  .catch(err => console.log(err));

async function main() {

  // Load log file.
  let logFile = await fs.readFile('log.json', 'utf-8');
  let log = await JSON.parse(logFile);
  let urls = log.urls;
  let fetchedSet = new Set(log.fetched);
  let failedSet = new Set(log.failed);

  // Load movies file
  let moviesFile = await fs.readFile('movies.json', 'utf-8');
  let moviesLog = await JSON.parse(moviesFile);
  let movies = moviesLog.movies;

  let tried = 0;
  let fetched = 0;

  try {
    while (fetched < LIMIT && tried < urls.length) {
      let movieUrl = urls[tried++];
      if (fetchedSet.has(movieUrl)) {
        continue;
      }
      await parseMovie(movieUrl)
        .then(movie => {
          movies.push(movie);
          fetchedSet.add(movieUrl);
          console.log(`Fetched movie (${fetched}): ${movieUrl}`);
          fetched++;
        })
        .catch(() => {
          console.log(`Failed to fetch movie (${fetched}): ${movieUrl}`);
          failedSet.add(movieUrl);
        });
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  } catch (err) {
    console.log(err);
  } finally {
    log.fetched = Array.from(fetchedSet);
    log.failed = Array.from(failedSet);
  
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

    // Updating movies file.
    moviesLog.fetchedMovies = movies.length;
    let jsonMovies = JSON.stringify(moviesLog, null, 2);
    try {
      fileHandle = await fs.writeFile(`./movies.json`, jsonMovies);
      console.log(`Movies log updated.`);
    } catch (err) {
      console.log(`Error updating movies log file.`);
    } finally {
      if (fileHandle !== undefined) {
        fileHandle.close();
      }
    }
  }
}


function parseMovie(movieURL) {
  return new Promise(async (resolve, reject) => {
    try {
      let movie = {}; // contains movie properties

      // Fetch URL and load html object
      let response = await fetch(movieURL);
      let res = await response.text();
      let $ = cheerio.load(res);

      // Parse movie properties
      movie.url = movieURL;
      movie.title = $('header.mov-top > h1').text();
      movie.imdbText = $('header.mov-top > div.mov-date > b').text();
      movie.imdb = parseFloat(movie.imdbText.split(' ')[1].replace(',', '.'));
      movie.description = $('div.full-text.clearfix').contents().not('a').text();
      movie.posterURL = $('div.film-poster > img').attr('src');
      movie.posterURL = movie.posterURL.startsWith('http') ? movie.posterURL : BASE_URL + movie.posterURL;
      // Some movies might not have videoURL
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
      reject(`Failed to parse URL: ${movieURL}\n${err}`);
    }
  })
}
