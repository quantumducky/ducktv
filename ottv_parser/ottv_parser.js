const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const fetch = require('node-fetch');
const fs = require('fs').promises;


const URL = 'http://ottv.tk/public/plst/plstfb/playlist.php?ott';

(async () => {

  // Load log file.
  let logFile = await fs.readFile('log.json', 'utf-8');
  let log = await JSON.parse(logFile);
  let playlistLog = log.playlists;

  // Fetch channel list from main XML link.
  let response = await fetch(URL);
  let xml = await response.text();
  let xmlObject = await parser.parseStringPromise(xml);
  let channelsArray = xmlObject.item.items[0].channel;

  let playlists = [];
  for (let channel of channelsArray) {
    playlists.push({
      title: channel.title[0],
      url: channel.playlist_url[0],
    })
  }
  
  for (let playlist of playlists.slice(2)) {
    let name = playlist.title.slice(-10) + playlist.url.split('/').pop();
    let m3u;

    if (playlistLog.includes(name)) {
      console.log(`Playlist '${name}' already fetched.`);
      continue;
    }

    console.log(`Fetching '${playlist.url}'.`);
    try {
      let m3uResponse = await fetch(playlist.url);
      m3u = await m3uResponse.text();
    } catch(err) {
      console.log(`Error fetching '${playlist.url}'.`);
      continue;
    }
    
    
    let fileHandle;
    try {
      fileHandle = await fs.writeFile(`./playlists/${name}`, m3u);
      playlistLog.push(name);
      console.log(`Playlist '${name}' has been written to file.`);
    } catch (err) {
      console.log(`Error writing to '${name}'.`);
    } finally {
      if (fileHandle !== undefined) {
        fileHandle.close();
      }
    }
  }

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


  console.log("Done.");
})();
