const fetch = require('node-fetch');
const cheerio = require('cheerio');
const getUrls = require('get-urls');


const BASE_URL = 'https://www.filmai.org';
// const URL = 'https://www.filmai.org/5695-deadpool-2016.html';
const URL = 'https://www.filmai.org/5930-me-before-you-2016.html';

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
