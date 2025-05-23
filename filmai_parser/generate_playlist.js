const fs = require('fs').promises;


generatePlaylistsByRating();
// generatePlaylistsByAlphabet();
// generatePlaylistsByGenres();
// generatePlaylistsByYears();


async function generatePlaylistsByRating() {

  // Load movies log file.
  let moviesFile = await fs.readFile('movies.json', 'utf-8');
  let moviesLog = await JSON.parse(moviesFile);
  let movies = moviesLog.movies;

  let moviesByRating = {
    '9.0 ir daugiau': [],
    '8.0 - 8.9': [],
    '7.0 - 7.9': [],
    '6.0 - 6.9': [],
    '5.0 - 5.9': [],
    '4.0 - 4.9': [],
    '3.9 ir mažiau': [],
    'Nėra reitingo': [],
  };
  for (movie of movies) {
    let imdb = movie.imdb;
    let rating;
    if (imdb == 0) { rating = 'Nėra reitingo' }
    else if (imdb >= 9) { rating = '9.0 ir daugiau' }
    else if (imdb >= 8 && imdb < 9) { rating = '8.0 - 8.9' }
    else if (imdb >= 7 && imdb < 8) { rating = '7.0 - 7.9' }
    else if (imdb >= 6 && imdb < 7) { rating = '6.0 - 6.9' }
    else if (imdb >= 5 && imdb < 6) { rating = '5.0 - 5.9' }
    else if (imdb >= 4 && imdb < 5) { rating = '4.0 - 4.9' }
    else if (imdb < 4) { rating = '3.9 ir mažiau' }

    let movieList = moviesByRating[rating];
    movieList.push(movie);
    moviesByRating[rating] = movieList;
  }

  for (rating in moviesByRating) {
    moviesByRating[rating].sort( (m1, m2) => m1.imdb > m2.imdb ? -1: 1 );
  }

  let mainXml = `<?xml version="1.0" encoding="UTF-8"?>\n<items>`;

  for (rating of Object.keys(moviesByRating)) {
    generateMoviePlaylist(moviesByRating[rating], `../movies/ratings/${rating.replace(/\ /g, '_')}.xml`);
    mainXml += `
    <channel>
      <title><![CDATA[${rating}]]></title>
      <playlist_url><![CDATA[https://raw.githubusercontent.com/quantumducky/ducktv/master/movies/ratings/${rating.replace(/\ /g, '_')}.xml]]></playlist_url>
    </channel>
    `
  }

  mainXml += '\n</items>';

  // Write results to main XML file.
  let fileHandle;
  try {
    fileHandle = await fs.writeFile('../movies/ratings/main.xml', mainXml);
    console.log(`Main playlist generated.`);
  } catch (err) {
    console.log(`Error generating playlist file.\n${err}`);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }
}


async function generatePlaylistsByAlphabet() {

  // Load movies log file.
  let moviesFile = await fs.readFile('movies.json', 'utf-8');
  let moviesLog = await JSON.parse(moviesFile);
  let movies = moviesLog.movies;

  let moviesByFirstChar = {};
  for (movie of movies) {
    let firstChar = movie.title.trim().toUpperCase().replace(/\"|\„|\,|\(/g, '')[0];
    firstChar = firstChar.match(/\d/g) ? '0-9' : firstChar;
    if (!(firstChar in moviesByFirstChar)) {
      moviesByFirstChar[firstChar] = [];
    }
    let movieList = moviesByFirstChar[firstChar];
    movieList.push(movie);
    moviesByFirstChar[firstChar] = movieList;
  }

  for (firstChar in moviesByFirstChar) {
    const format = (t) => t.title.replace(/\"|\„|\,|\(/g, '').toLowerCase();
    moviesByFirstChar[firstChar].sort( (m1, m2) => format(m1).localeCompare(format(m2)) );
  }

  let mainXml = `<?xml version="1.0" encoding="UTF-8"?>\n<items>`;

  for (firstChar of Object.keys(moviesByFirstChar).sort((m1, m2) => m1.localeCompare(m2))) {
    generateMoviePlaylist(moviesByFirstChar[firstChar], `../movies/alphabet/${firstChar}.xml`);
    mainXml += `
    <channel>
      <title><![CDATA[${firstChar}]]></title>
      <playlist_url><![CDATA[https://raw.githubusercontent.com/quantumducky/ducktv/master/movies/alphabet/${firstChar}.xml]]></playlist_url>
    </channel>
    `
  }

  mainXml += '\n</items>';

  // Write results to main XML file.
  let fileHandle;
  try {
    fileHandle = await fs.writeFile('../movies/alphabet/main.xml', mainXml);
    console.log(`Main playlist generated.`);
  } catch (err) {
    console.log(`Error generating playlist file.\n${err}`);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }
}


async function generatePlaylistsByGenres() {

  // Load movies log file.
  let moviesFile = await fs.readFile('movies.json', 'utf-8');
  let moviesLog = await JSON.parse(moviesFile);
  let movies = moviesLog.movies;

  let moviesByGenre = {
    'Drama': [],
    'Komedija': [],
    'Veiksmo': [],
    'Trileris': [],
    'Kriminalinis': [],
    'Fantastinis': [],
    'Romantinis': [],
    'Nuotykių': [],
    'Siaubo': [],
    'Mistinis': [],
    'Šeimai': [],
    'Biografinis': [],
    'Istorinis': [],
    'Muzikinis': [],
    'Karinis': [],
    'Sportas': [],
    'Animacija': [],
    'Vesternas': [],
    'Dokumentinis': [],
    'Kiti': [],
  };
  for (movie of movies) {
    let genres = movie.genres ? movie.genres : ['Kiti'];

    for (genre of genres) {
      let genreToAdd;
      if (genre in moviesByGenre) {
        genreToAdd = genre;
      } else if (genre == 'Dramos') {
        genreToAdd = 'Drama';
      } else if (genre == 'Komedijos') {
        genreToAdd = 'Komedija';
      } else if (genre == 'Trileriai') {
        genreToAdd = 'Trileris';
      } else if (genre == 'Kriminaliniai') {
        genreToAdd = 'Kriminalinis';
      } else if (genre == 'Nuotykiai') {
        genreToAdd = 'Nuotykių';
      } else if (genre == 'Fantastiniai' || genre == 'Fantastika' || genre == 'Moksliniai') {
        genreToAdd = 'Fantastinis';
      } else if (genre == 'Mistiniai') {
        genreToAdd = 'Mistinis';
      } else if (genre == 'Romantiniai') {
        genreToAdd = 'Romantinis';
      } else if (genre == 'Biografiniai') {
        genreToAdd = 'Biografinis';
      } else {
        genreToAdd = 'Kiti';
      }
      let movieList = moviesByGenre[genreToAdd];
      movieList.push(movie);
      moviesByGenre[genreToAdd] = movieList;
    }
  }

  for (genre in moviesByGenre) {
    moviesByGenre[genre].sort( (m1, m2) => m1.title.toLowerCase().localeCompare(m2.title.toLowerCase()) );
  }

  let mainXml = `<?xml version="1.0" encoding="UTF-8"?>\n<items>`;

  for (genre of Object.keys(moviesByGenre).sort()) {
    generateMoviePlaylist(moviesByGenre[genre], `../movies/genres/${genre}.xml`);
    mainXml += `
    <channel>
      <title><![CDATA[${genre}]]></title>
      <playlist_url><![CDATA[https://raw.githubusercontent.com/quantumducky/ducktv/master/movies/genres/${genre}.xml]]></playlist_url>
    </channel>
    `
  }

  mainXml += '\n</items>';

  // Write results to main XML file.
  let fileHandle;
  try {
    fileHandle = await fs.writeFile('../movies/genres/main.xml', mainXml);
    console.log(`Main playlist generated.`);
  } catch (err) {
    console.log(`Error generating playlist file.\n${err}`);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }
}


async function generatePlaylistsByYears() {

  // Load movies log file.
  let moviesFile = await fs.readFile('movies.json', 'utf-8');
  let moviesLog = await JSON.parse(moviesFile);
  let movies = moviesLog.movies;

  let moviesByYear = {};
  for (movie of movies) {
    let year = movie.year
      ? String(movie.year).length == 4 ? movie.year : 'Kiti'
      : ( movie.title.match(/\b(19|20)\d{2}\b/g) ? movie.title.match(/\b(19|20)\d{2}\b/g)[0] : 'Kiti');
    if (!(year in moviesByYear)) {
      moviesByYear[year] = [];
    }
    let movieList = moviesByYear[year];
    movieList.push(movie);
    moviesByYear[year] = movieList;
  }

  for (year in moviesByYear) {
    moviesByYear[year].sort( (m1, m2) => m1.title.toLowerCase().localeCompare(m2.title.toLowerCase()) );
  }

  let mainXml = `<?xml version="1.0" encoding="UTF-8"?>\n<items>`;

  for (year of Object.keys(moviesByYear).sort().reverse()) {
    generateMoviePlaylist(moviesByYear[year], `../movies/years/${year}.xml`);
    mainXml += `
    <channel>
      <title><![CDATA[${year}]]></title>
      <playlist_url><![CDATA[https://raw.githubusercontent.com/quantumducky/ducktv/master/movies/years/${year}.xml]]></playlist_url>
    </channel>
    `
  }

  mainXml += '\n</items>';

  // Write results to main XML file.
  let fileHandle;
  try {
    fileHandle = await fs.writeFile('../movies/years/main.xml', mainXml);
    console.log(`Main playlist generated.`);
  } catch (err) {
    console.log(`Error generating playlist file.\n${err}`);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }

}


async function generateMoviePlaylist(movies, playlistPath) {

  let results = `<?xml version="1.0" encoding="UTF-8"?>\n<items>`;
  movies.forEach(movie => {
    results += createMovieItem(movie);
  })
  results += '\n</items>';

  // Write results to XML file.
  let fileHandle;
  try {
    fileHandle = await fs.writeFile(playlistPath, results);
    console.log(`${movies.length} movies have been written to '${playlistPath}'`);
  } catch (err) {
    console.log(`Error generating playlist file.\n${err}`);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }
}


function createMovieItem(movie) {
  return `
  <channel>
    <title><![CDATA[${movie.title}]]></title>
    <logo_30x30><![CDATA[${movie.posterURL}]]></logo_30x30>
    <description><![CDATA[
      <div style="display: table; width: 100%; vertical-align:top;">

        <div style="display: table-cell; width: 40%;">
          <center>
            <div>
              <img src="${movie.posterURL}" style="border-radius: 25px; width: 100%"></img>
            </div>
          </center>
          <div style="font-size: 1.4em;">
            <div>
              <span style="color: #ffaf59;"><b>Šalis: </b></span><span style="color: #C0C0C0">${movie.country ? movie.country : '-'}</span>
            </div>
            <div>
              <span style="color: #ffaf59;"><b>Aktoriai: </b></span><span style="color: #C0C0C0">${movie.actors ? movie.actors : '-'}</span>
            </div>
          </div>
        </div>

        <div style="display: table-cell; width: 60%; vertical-align:top; padding-left:8px; padding-right:8px; font-size: 1.4em;">
          <center>
            <div style="color: #ffaf59; font-size: 1.6em; margin-bottom:8px;">${movie.title}</div>
          </center>
          <div>
            <img src="https://raw.githubusercontent.com/quantumducky/ducktv/master/img/imdb_24.png" style="border-radius: 5px;" height="24px"></img>&nbsp;<span style="color: #C0C0C0">${movie.imdbText ? movie.imdbText.slice(6) : '-'}</span>
          </div>
          <div>
            <span style="color: #ffaf59;"><b>Kalba: </b></span><span style="color: #C0C0C0">${movie.language ? movie.language : '-'}</span>
          </div>
          <div>
            <span style="color: #ffaf59;"><b>Metai: </b></span><span style="color: #C0C0C0">${movie.year ? movie.year : '-'}</span>
          </div>
          <div>
            <span style="color: #ffaf59;"><b>Žanrai: </b></span><span style="color: #C0C0C0">${movie.genres ? movie.genres.join(', ') : '-'}</span>
          </div>
          <div>
            <span style="color: #ffaf59;"><b>Trukmė: </b></span><span style="color: #C0C0C0">${movie.length ? movie.length : '-'}</span>
          </div>
          <div>
            <p>
              <span style="color: #ffaf59;"><b>Aprašymas:</b></span><br>
              <span style="color: #C0C0C0">${movie.description.replace('\n', '').replace('\t', '')}</span>
            </p>
          </div>
        </div>

      </div>
    ]]></description>
    <stream_url><![CDATA[${movie.videoURL}]]></stream_url>
  </channel>
  `
}