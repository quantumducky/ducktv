const fsPromise = require('fs').promises;
const fs = require('fs');
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();


const PLAYLISTS_FOLDER_PATH = './data/playlists';
const LOG_FILE_PATH = './data/log.json';
const CHANNELS_INFO_FILE_PATH = './data/channelsInfo.json';
const M3U8_PLAYLIST_FILE_PATH = './playlist.m3u8';
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/quantumducky/ducktv/master';
const OTTV_URL = 'http://ottv.tk/public/plst/plstfb/playlist.php?ott';


(async () => {

  // await fetchPlaylists();

  const channels = await readChannelsFromPlaylists(LOG_FILE_PATH);
  const channelsToSearch = await readLogData(CHANNELS_INFO_FILE_PATH);
  const foundChannels = await findChannels(channels, channelsToSearch);

  // const foundChannels = await readLogData('./foundChannels.json');

  writeLogData(foundChannels, './foundChannels.json');

  // await generateXMLPlaylist(foundChannels);

  
})();


async function generateXMLPlaylist(channels) {
  console.log("Generating XML playlist");

  let mainXml = `<?xml version="1.0" encoding="UTF-8"?>\n<items>`;

  for (let category in channels) {

    // Create a DIR for category, if it doesn't exist.
    let categoryPath = `./channels/${category}`;
    if (!fs.existsSync(categoryPath)) {
      fsPromise.mkdir(categoryPath);
    }

    let categoryXml = `<?xml version="1.0" encoding="UTF-8"?>\n<items>`;
    for (let channel of channels[category]) {
      let channelXml = `<?xml version="1.0" encoding="UTF-8"?>\n<items>`;
      let index = 1;
      for (let url of channel.urls) {
        channelXml += `
          <channel>
            <title><![CDATA[${channel.name} (${index++})]]></title>
            <stream_url><![CDATA[${url}]]></stream_url>
          </channel>
        `;
      }
      channelXml += '\n</items>';
      await writeToFile(channelXml, `${categoryPath}/${channel.id}.xml`);

      categoryXml += `
        <channel>
          <logo_30x30><![CDATA[${GITHUB_BASE_URL}/iptv/data/logos/${channel.logo}]]></logo_30x30>
          <title><![CDATA[${channel.name}]]></title>
          <playlist_url><![CDATA[${GITHUB_BASE_URL}/iptv/channels/${category}/${channel.id}.xml]]></playlist_url>
        </channel>
      `;
    }
    categoryXml += '\n</items>';
    await writeToFile(categoryXml, `${categoryPath}/main.xml`);

    mainXml += `
      <channel>
        <title><![CDATA[${category}]]></title>
        <playlist_url><![CDATA[${GITHUB_BASE_URL}/iptv/channels/${category}/main.xml]]></playlist_url>
      </channel>
    `;
  }

  mainXml += '\n</items>';
  await writeToFile(mainXml, `./main.xml`);
}


async function generateM3U8Playlist(channels, filePath, limit) {
  // let results = '#EXTM3U\n';
  // for (let channel in channels) {
  //   const channelUrls = limit ? channels[channel].slice(0, limit) : channels[channel];
  //   channelUrls.forEach(url => {
  //     results += `#EXTINF:0, ${channel}\n${url}\n`;
  //   });
  // }

  // await writeToFile(results, filePath);
  // console.log('M3U8 playlist was generated.')
  console.log("Needs re-implementing!");
}


async function findChannels(allChannels, channelsToSearch) {
  console.log('\nStarting the channel search');

  const ignoreCategories = ["LT", "Filmai"];

  let foundChannels = {}
  for (let category in channelsToSearch) {
    if (ignoreCategories.includes(category)) {
      console.log(`Skipping category '${category}'`);
      continue;
    }
    foundChannels[category] = [];
    for (let channel of channelsToSearch[category]) {
      let foundUrls = [];
      for (let term of channel.terms) {
        if (term in allChannels) {
          for (let url of allChannels[term]) {
            if (!foundUrls.includes(url)) {
              foundUrls.push(url);
            }
          }
        }
      }
  
      console.log(`Checking for working urls of '${channel.name}' (${foundUrls.length} to check)`);
      const workingUrls = await findWorkingChannels(foundUrls);
      let foundChannel = {...channel};
      foundChannel.urls = workingUrls;
      foundChannels[category].push(foundChannel);
      console.log(`Found ${workingUrls.length}/${foundUrls.length} working urls for channel '${channel.name}'`);
    }
  }

  return foundChannels;
}


async function findWorkingChannels(urls) {
  let workingUrls = [];
  let index = 1;
  await Promise.all(urls.slice(0,20).map(async url => {
    try {
      //https://davidwalsh.name/fetch-timeout
      // console.log(index++ + ': ' + url);
      let res = await fetch(url);
      // console.log('res -> ' + res);
      if (res.ok) workingUrls.push(url);
    } catch (err) {}
  }));

  return workingUrls;
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
    const text = await fsPromise.readFile(`${PLAYLISTS_FOLDER_PATH}/${playlist}`, 'utf-8');
    const lines = text.split("\n");
  
    for (let i=0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXTINF")) {
        let channelName = lines[i++].split(",").slice(1).join(",").trim();
        if (channelName.includes("group-title=")) {
          channelName = channelName.split(",").slice(1).join(",").trim();
        }
        let channelURL = lines[i].startsWith("#EXTGRP") ? lines[++i] : lines[i];

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
      fileHandle = await fsPromise.writeFile(`${PLAYLISTS_FOLDER_PATH}/${name}`, m3u);
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


async function readLogData(filePath) {
  const logFile = await fsPromise.readFile(filePath, 'utf-8');
  const log = await JSON.parse(logFile);
  return log;
}


async function writeLogData(log, filePath) {
  let json = JSON.stringify(log, null, 2);
  await writeToFile(json, filePath);
}


async function writeToFile(data, filePath) {
  let fileHandle;
  try {
    fileHandle = await fsPromise.writeFile(filePath, data);
  } catch (err) {
    console.log(`Error writing to file.`);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }
}