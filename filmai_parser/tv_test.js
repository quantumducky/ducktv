const fs = require('fs').promises;
const getUrls = require('get-urls');

const CONTENT = 'content.json';
const OUTPUT_FILE = 'dr_house.m3u8';

main();

async function main() {
  // Load log file.
  let logFile = await fs.readFile(CONTENT, 'utf-8');
  let content = await JSON.parse(logFile);

  let seasonID = 1;

  let result = '#EXTM3U\n';
  for (season of content) {
    result += `#EXTINF:0, => ${seasonID++} SEZONAS <=\nhttp://t.com\n`;
    for (episode of season.sort( (a,b) => parseFloat(a.name) > parseFloat(b.name) ? 1 : -1 )) {
      let url = Array.from(getUrls(episode.code))[0];
      result += `#EXTINF:0, ${episode.name}\n${url}\n`;
    }
  }

  let fileHandle;
  try {
    fileHandle = await fs.writeFile(OUTPUT_FILE, result);
    console.log(`Results have been written to file.`);
  } catch (err) {
    console.log(`Error writing results to file.`);
  } finally {
    if (fileHandle !== undefined) {
      fileHandle.close();
    }
  }
}