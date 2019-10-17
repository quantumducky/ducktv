const fs = require('fs').promises;


(async () => {

  const SEARCH_TERM = "tvplay";
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

  let results = '#EXTM3U\n';
  found.forEach(result => {
    results += '#EXTINF:0, ' + result.title.split(',').slice(-1) + '\n';
    results += result.url + '\n';
  })

  let fileHandle;
  try {
    fileHandle = await fs.writeFile(`./results.m3u8`, results);
    console.log(`Search results have been written to the file.`);
  } catch (err) {
    console.log(`Error writing search results to the file.`);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }

  console.log(results);
  console.log("Done.");
})();
