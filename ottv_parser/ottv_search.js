const fs = require('fs').promises;


(async () => {

  const SEARCH_TERM = "euro";
  let found = [];

  // Load log file.
  let logFile = await fs.readFile('log.json', 'utf-8');
  let log = await JSON.parse(logFile);
  let playlistLog = log.playlists;


  for (let fileName of playlistLog) {
    let text = await fs.readFile('./playlists/' + fileName, 'utf-8');
    let lines = text.split("\n");
  
    for (let i=0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF")) {
        if (lines[i].toLowerCase().includes(SEARCH_TERM.toLowerCase())) {
          found.push({
            title: lines[i],
            url: lines[i+1],
            playlist: fileName,
          })
        }
      }
    }
  }

  console.log(found);
  console.log("Done.");
})();
