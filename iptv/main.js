const fs = require('fs').promises;
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();


const PLAYLISTS_FOLDER_PATH = './data/playlists/';
const LOG_FILE_PATH = './data/log.json';
const CHANNELS_INFO_FILE_PATH = './data/channelsInfo.json';
const OTTV_URL = 'http://ottv.tk/public/plst/plstfb/playlist.php?ott';


(async () => {

  // await fetchPlaylists();

  const channels = await readChannelsFromPlaylists(LOG_FILE_PATH);
  const channelsToSearch = await readLogData(CHANNELS_INFO_FILE_PATH);
  await findChannels(channels, channelsToSearch);
  
})();

async function findChannels(allChannels, channelsToSearch) {
  console.log('\nStarting the channel search');
  for (let channel in channelsToSearch) {
    let foundUrls = [];
    for (let term of channelsToSearch[channel].terms) {
      if (term in allChannels) {
        for (let url of allChannels[term]) {
          foundUrls.push(url);
        }
      }
    }

    const workingUrls = await findWorkingChannels(foundUrls);

    console.log(`Found ${workingUrls.length}/${foundUrls.length} working urls for channel '${channel}'`);

  
    // let results = '#EXTM3U\n';
    // workingChannels.forEach(result => {
    //   results += '#EXTINF:0, ' + result.title.split(',').slice(-1) + '\n';
    //   results += result.url + '\n';
    // });
  }
}

async function findWorkingChannels(urls) {
  let workingUrls = [];

  await Promise.all(urls.map(async url => {
    try {
      let res = await fetch(url);
      if (res.ok) workingUrls.push(url);
    } catch (err) {}
  }));

  return workingUrls;
}

async function generateM3U8Playlist(channels) {

}

async function readLogData(filePath) {
  const logFile = await fs.readFile(filePath, 'utf-8');
  const log = await JSON.parse(logFile);
  return log;
}

async function writeLogData(log, filePath) {
  let json = JSON.stringify(log, null, 2);
  let fileHandle;

  try {
    fileHandle = await fs.writeFile(filePath, json);
    console.log(`Changes were written to the log.`);
  } catch (err) {
    console.log(`Error updating log file.`);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }
}

async function readChannelsFromPlaylists(logPath) {

  let log = await readLogData(logPath);

  if (!log.unreadChannels) {
    console.log('No unread channels found. Using channel cache.');
    return log.channels;
  }

  console.log('Reading channels from the playlists.');

  let foundChannels = {};
  let checkedURLs = [];

  for (let playlist of log.playlists) {
    const text = await fs.readFile(PLAYLISTS_FOLDER_PATH + playlist, 'utf-8');
    const lines = text.split("\n");
  
    for (let i=0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF")) {
        const channelName = lines[i++].split(",").slice(1).join(",").trim();
        const channelURL = lines[i].startsWith("#EXTGRP") ? lines[++i] : lines[i];

        if (!(channelName in foundChannels) && !checkedURLs.includes(channelURL)) {
          foundChannels[channelName] = [];
        }

        if (!checkedURLs.includes(channelURL)) {
          foundChannels[channelName].push(channelURL);
        }

        checkedURLs.push(channelURL);
      }
    }
  }

  log.channels = foundChannels;
  log.unreadChannels = false;
  await writeLogData(log, logPath);
  
  console.log('Finished reading channels.');
  return foundChannels;
}

async function fetchPlaylists() {

  console.log('Starting playlist fetching.');

  let log = await readLogData(LOG_FILE_PATH);
  let playlistLog = log.playlists;

  // Fetch channel list from main XML link.
  let response = await fetch(OTTV_URL);
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
      fileHandle = await fs.writeFile(PLAYLISTS_FOLDER_PATH + name, m3u);
      playlistLog.push(name);
      log.unreadChannels = true;
      console.log(`Playlist '${name}' has been written to file.`);
    } catch (err) {
      console.log(`Error writing to '${name}'.`);
    } finally {
      if (fileHandle !== undefined) {
        fileHandle.close();
      }
    }
  }

  await writeLogData(log, LOG_FILE_PATH);
  console.log('Playlist fetching completed.');
}
