const fs = require('fs').promises;


playlistByGenres();

async function playlistByGenres() {

  // Load movies log file.
  let moviesFile = await fs.readFile('movies.json', 'utf-8');
  let moviesLog = await JSON.parse(moviesFile);
  let movies = moviesLog.movies;

  let results = `<?xml version="1.0" encoding="UTF-8"?>\n<items>`;
  movies.slice(10,90).forEach(movie => {
    results += createMovieItem(movie);
  })
  results += '\n</items>';

  // Write results to XML file.
  let fileHandle;
  try {
    fileHandle = await fs.writeFile(`./results.xml`, results);
    console.log(`movies have been written to the file.`);
  } catch (err) {
    console.log(`Error generating playlist file.`);
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
              <img src="${movie.posterURL}" style="border-radius: 25px;"></img>
            </div>
          </center>
          <div style="font-size: 1.4em;">
            <div>
              <span style="color: #ffaf59;"><b>Šalis: </b></span><span style="color: #C0C0C0">${movie.country ? movie.country : '-'}</span>
            </div>
            <div>
              <span style="color: #ffaf59;"><b>Aktoriai: </b></span><span style="color: #C0C0C0">${movie.actors ? movie.actors : '-'}</span>
            </div>
            <div>
              <span style="color: #ffaf59;"><b>Režisierius: </b></span><span style="color: #C0C0C0">${movie.director ? movie.director : '-'}</span>
            </div>
          </div>
        </div>

        <div style="display: table-cell; width: 60%; vertical-align:top; padding-left:8px; padding-right:8px; font-size: 1.4em;">
          <center>
            <div style="color: #ffaf59; font-size: 1.6em; margin-bottom:8px;">${movie.title}</div>
          </center>
          <div>
            <img src="https://raw.githubusercontent.com/quantumducky/ducktv/master/img/imdb_32.png" width="20px"></img>&nbsp;<span style="color: #C0C0C0">IMDB: ${movie.imdbText ? movie.imdbText.slice(6) : '-'}</span>
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