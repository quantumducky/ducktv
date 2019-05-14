let P = require('bluebird'),
    request = P.promisifyAll(require("request")),
    cheerio = require('cheerio'),
    Iconv = require('iconv-lite'),
    fs = require('fs'),
    path = require('path');



const SOURCE_FILE = path.join(__dirname, 'all.m3u8');
const OUT_FILE = path.join(__dirname, 'films.json');





// readFileData(SOURCE_FILE, function(err, films) {
//   if (err) {
//     console.log(err);
//   } else {
//     writeToJsonFile(OUT_FILE, films);
//   }
// });


function writeToJsonFile(fileName, data) {
  let json = JSON.stringify(data, null, 2)
  fs.writeFile(fileName, json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  });
}


function readFileData(file, callback) {
  fs.readFile(file, {encoding: 'utf-8'}, function(err,data){
    if (err) {
      callback(err)
    } else {
      let films = {};
      let lines = data.split('\r\n');
  
      let line;
      for (let i=0; i < lines.length; i++) {
        line = lines[i];
        if (!line.startsWith('#EXTINF')) continue;
        let title = line.split(',').slice(1).join(',');
        let url = lines[++i];
        if (!url.startsWith('http')) continue;
        films[title] = {'title': title, 'url': url};
      }
      callback(null, films);
    }
  });
}


let url = "http://klplayer.website/player/playerjs.html?file=http://212.113.38.99/hls/0f14377f99a9b469d104282c67687e3e//fhd/The.Wolf.of.Wall.Street.2013.BDRip.1080p.Rus.Eng.m3u8";

doGetRequest(url, function(err, body){
  if (err) {
    console.log(err.message);
  } else {
    // let $ = cheerio.load(body);
    // let href = $('#b_results > li').first().find('h2 > a').attr('href');
    // let id = href.slice(0, -1).split('/').slice(-1)[0].split('-').slice(-1)[0];
    console.log(body);
}});




// function doGetRequest(url, callback) {
//   request.get(url, function (err, response, body) {
//     if (err) {
//       callback(new Error('Error while calling "' + url + '". ' + err.message));
//     } else {
//       body = Iconv.decode(new Buffer(body, 'binary'), 'win1251');
//       callback(null, body);
//     }
//   });
// }

function doGetRequest(url, callback) {
  var requestOptions = {
    url: url,
    headers: {
      'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4,pl;q=0.2',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
    },
    encoding: 'binary'
  };
  request.get(requestOptions, function (err, response, body) {
    if (err) {
      callback(new Error('Error while calling "' + url + '". ' + err.message));
    } else {
      body = Iconv.decode(new Buffer(body, 'binary'), 'win1251');
      callback(null, response);
    }
  });
}




