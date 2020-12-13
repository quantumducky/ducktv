const fetch = require('node-fetch');
const fsPromise = require('fs').promises;
// const cheerio = require('cheerio');

const INTERVAL =  5000;
const LIMIT = 250;
const SERVER = 'e01';

let mainInterval;
let urlList = [];
let i = 1;


(async () => {
  mainInterval = setInterval(fetchUrls, INTERVAL);
})();

async function fetchUrls() {
  const URL = `http://${SERVER}.plius.tv:64144/l${i}/index.m3u8`;

  await fetch(URL).then(res => {
    if (res.ok) {
      urlList.push({url: URL, id: `n${i}`});
      console.log(`Fetching url: '${URL}': OK`);
    } else {
      console.log(`Fetching url: '${URL}': NOT FOUND`);
    }
  });

  i++;

  if (i > LIMIT) {
    clearInterval(mainInterval);
    writePlaylist();
    return;
  }
}

async function writePlaylist() {
  let date = formatDate(Date.now());
  let playlistData = '#EXTM3U\n';
  urlList.forEach(urlObj => {
    playlistData += `#EXTINF:-1,${urlObj.id}\n${urlObj.url}\n`;
  });
  await writeToFile(playlistData, `pliustv_${SERVER}_${date}.m3u8`);
  console.log('Playlist has been saved to the file.');
}


async function writeToFile(data, filePath) {
  let fileHandle;
  try {
    fileHandle = await fsPromise.writeFile(filePath, data);
  } catch (err) {
    console.log(`Error writing to file.`);
    console.error(err);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }
}


function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = '' + (d.getHours() + 1),
      minute = '' + (d.getMinutes() + 1);

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }
  if (hour.length < 2) {
    hour = '0' + hour;
  }
  if (minute.length < 2) {
    minute = '0' + minute;
  }

  return [year, month, day, hour, minute].join('-');
}