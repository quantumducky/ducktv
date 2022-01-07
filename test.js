const fetch = require('node-fetch');
const fsPromise = require('fs').promises;
// const cheerio = require('cheerio');
// const parserFactory = require('ts-exif-parser').ExifParserFactory;

const INTERVAL =  4000;
const LIMIT = 250;

let mainInterval;
let urlList = [];
let i = 1;


(async () => {

  // const rootUrl = 'http://213.226.137.133:81/tl2';
  // let playlistData = '#EXTM3U\n';
  // [...Array(999).keys()].forEach(id => {
  //   playlistData += `#EXTINF:-1, Channel ${id+1}\n`;
  //   playlistData += `${rootUrl}/l${id+1}/index.m3u8\n`;
  // });
  // await writeToFile(playlistData, `playlist_133_tl2.m3u8`);


  // const rootUrl = 'http://78.158.0.93';
  // const token = '0e71f7c14d1e6b394d4b4c776723a201%3A179f69e735f';
  // let playlistData = '#EXTM3U\n';
  // [...Array(255).keys()].forEach(id => {
  //   playlistData += `#EXTINF:-1, Channel ${id+1}\n`;
  //   playlistData += `${rootUrl}/239.255.255.${id+1}/video.m3u8${token !== '' ? '?token=' + token : ''}\n`;
  // });
  // await writeToFile(playlistData, `fastlink.m3u8`);

  // port range checker:
  // http://ports.my-addr.com/ip-range-port-scanner-tool.php

  // checked:
  // 130 | tl | l1-999 - 1
  // 130 | tl1 | l1-250 - done|nothing
  // 130 | tl2 | l1-1250 - done
  // 130 | tl3 | l1-250 done|nothing

  // 130 | tl2 | n1-250 - done|nothing

  // 133 | tl | l1-1250 done
  // 133 | tl2 | l1-999 done|nothing
  // 133 | tl3 | l1-250 done|nothing

  // 140 | tl | l1-1000 done


  mainInterval = setInterval(fetchUrls, INTERVAL);
})();

async function fetchUrls() {
  const URL = `http://213.226.137.140:81/tl2/l${i}/index.m3u8`;

  await fetch(URL).then(res => {
    if (res.ok) {
      urlList.push({url: URL, id: `Channel ${i}`});
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
  await writeToFile(playlistData, `playlist_${date}.m3u8`);
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