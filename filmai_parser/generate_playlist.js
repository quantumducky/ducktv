const fs = require('fs').promises;


generatePlaylistsByGenres();

async function generatePlaylistsByGenres() {

  // Load movies log file.
  let moviesFile = await fs.readFile('movies.json', 'utf-8');
  let moviesLog = await JSON.parse(moviesFile);
  let movies = moviesLog.movies;

  let moviesByYear = {};
  for (movie of movies) {
    let year = movie.year ? movie.year : 'Kiti';
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