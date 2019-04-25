let P = require('bluebird'),
    request = P.promisifyAll(require("request")),
    cheerio = require('cheerio'),
    Iconv = require('iconv-lite'),
    fs = require('fs'),
    path = require('path'),
    Rx = require('rxjs/Rx');



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


// for (film of films) {
//   let url = generateQuery(film);
//   doGetRequest(url, function(err, body){
//     if (err) {
//       console.log(err.message);
//     } else {
//       let $ = cheerio.load(body);
//       let href = $('#b_results > li').first().find('h2 > a').attr('href');
//       let id = href.slice(0, -1).split('/').slice(-1)[0].split('-').slice(-1)[0];
//       console.log(id);
//   }});
// }


function generateQuery(filmTitle) {
  let url = 'https://www.bing.com/search?q=' + filmTitle.split(' ').join('+') + '+site:kinopoisk.ru';
  return encodeURI(url);
}


function doGetRequest(url, callback) {
  request.get(url, function (err, response, body) {
    if (err) {
      callback(new Error('Error while calling "' + url + '". ' + err.message));
    } else {
      body = Iconv.decode(new Buffer(body, 'binary'), 'win1251');
      callback(null, body);
    }
  });
}




