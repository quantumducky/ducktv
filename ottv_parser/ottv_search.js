const fs = require('fs').promises;
const prompts = require('prompts');
const fetch = require('node-fetch');


(async () => {

  let SEARCH_TERM = '';
  let foundChannels = [];
  let urls = [];

  const promptResponse = await prompts({
    type: 'text',
    name: 'searchTerm',
    message: "Search term: ",
  });

  SEARCH_TERM = promptResponse.searchTerm;

  if (SEARCH_TERM.length > 0) {

    // Load log file.
    let logFile = await fs.readFile('log.json', 'utf-8');
    let log = await JSON.parse(logFile);
    let playlistLog = log.playlists;
  
  
    for (let fileName of playlistLog) {
      let text = await fs.readFile('./playlists/' + fileName, 'utf-8');
      let lines = text.split("\n");
    
      for (let i=0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXTINF")) {
          if (lines[i].toLowerCase().includes(SEARCH_TERM.toLowerCase()) && !urls.includes(lines[i+1])) {
            foundChannels.push({
              title: lines[i],
              url: lines[i+1],
              playlist: fileName,
            });
            urls.push(lines[i+1]);
          }
        }
      }
    }

    console.log(`Found ${foundChannels.length} matching channels.\Checking for working channels...`);

    let workingChannels = [];
    await Promise.all(foundChannels.map(async channel => {
      try {
        let res = await fetch(channel.url);
        if (res.ok) workingChannels.push(channel);
        console.log(`Working: ${channel.url}`)
      } catch (err) {
        console.log(`Broken: ${channel.url}`)
      }
    }))

  
    let results = '#EXTM3U\n';
    workingChannels.forEach(result => {
      results += '#EXTINF:0, ' + result.title.split(',').slice(-1) + '\n';
      results += result.url + '\n';
    })
  
    let fileHandle;
    try {
      fileHandle = await fs.writeFile(`./results.m3u8`, results);
      console.log(`${workingChannels.length} channels have been written to the file.`);
    } catch (err) {
      console.log(`Error writing search results to the file.`);
    } finally {
      if (fileHandle !== undefined) {
        fileHandle.close();
      }
    }
  }
})();
