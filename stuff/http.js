var querystring = require('querystring');
var request = require('request');


// var form = {
//     q: 'XGY//mFLNTnMI/9aSn6dOUux+PzRfkPQ47A6+P7WFRc+FBATNeoW7BSICPnun8NrU0dnd6qa8ToAKqJAZ0xn+eJSjQe6hCmZ06JQc+Quj8n0P+Lne9KASvPX40cKLJS1Irfak+cJTfdpJEPkwEDiSUsLMjSP284mfzRtuCo808pvg+k4NKZC1Va6WibVM1zd',
//     ref: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyZWZfaG9zdCI6ImhkcmV6a2EuYWciLCJyZXFfaG9zdCI6InMxLmNkbmFwcG9ubGluZS5jb20iLCJleHAiOjE1NTIzODY0MjQsInRva2VuIjoiM2IxZmRkMWU1NGI5YTVlZGM2NzdmNWFiNjU5Y2JlZjUifQ._zxFnyr8pxh514BHLMmos1qMxYoSnq8T14gVEfF-o2k'
// };

// var formData = querystring.stringify(form);
// var contentLength = formData.length;

// request({
//   headers: {
//     'Content-Length': contentLength,
//     'Host': 'mastarti.com',
//     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
//     'Accept': 'application/json, text/javascript, */*; q=0.01',
//     'Accept-Language': 'en-US,en;q=0.5',
//     // 'Accept-Encoding': 'gzip, deflate',
//     'Referer': 'http://mastarti.com/serial/3b1fdd1e54b9a5edc677f5ab659cbef5/iframe?episode=10&nocontrols=1&pid_b2cb5260=6c6cba9e&ref=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyZWZfaG9zdCI6ImhkcmV6a2EuYWciLCJyZXFfaG9zdCI6InMxLmNkbmFwcG9ubGluZS5jb20iLCJleHAiOjE1NTIzODY0MjQsInRva2VuIjoiM2IxZmRkMWU1NGI5YTVlZGM2NzdmNWFiNjU5Y2JlZjUifQ._zxFnyr8pxh514BHLMmos1qMxYoSnq8T14gVEfF-o2k&season=3',
//     'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//     'X-Requested-With': 'XMLHttpRequest',
//     'DNT': '1',
//     'Connection': 'keep-alive'
//   },
//   uri: 'http://mastarti.com/vs',
//   body: formData,
//   method: 'POST'
// }, function (err, res, body) {
//   console.log(res);
//   console.log(body);
// });



var form = {
  'do':	'post_inline_actions',
  'pid':	'28480',
  'action':	'play',
  'object':	'ser',
  'idnumr':	'3',
  // 'object':	'furl',
  'player':	'html5',
  'token':	'b06826bada2047613ee4473ba9c9f292'
};

var formData = querystring.stringify(form);
var contentLength = formData.length;

request({
  headers: {
    'Content-Length': contentLength,
    'Host': 'www.filmai.in',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    // 'Accept-Encoding': 'gzip, deflate',
    'Referer': 'https://www.filmai.in/drakonu-kova-lietuviu-kalba',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Cookie': 'fb620561f408b25819e9b3c4fad75f85=/; voxssl=s1|XIaYJ|XIaX/; ct_anti_ddos_key=7689a8ebcb443b2f03d39ca425da200b; PHPSESSID=hcb29mugju7r74ik7nuuaekkb6; dle_user_id=2268356; dle_password=b17212ea3c5cd7e718f4a152ce5301c4',
    'TE': 'Trailers'
  },
  uri: 'https://www.filmai.in/index.php',
  body: formData,
  method: 'POST'
}, function (err, res, body) {
  console.log(res);
  console.log(body);
});

// https://www.filmai.in/proto-medziotojas-pirmas-sezonas

// ; dle_user_id=2268356; dle_password=b17212ea3c5cd7e718f4a152ce5301c4


// good year / malena

// anti dos:
// 7689a8ebcb443b2f03d39ca425da200b
// 7689a8ebcb443b2f03d39ca425da200b

// phpsesid:
// hcb29mugju7r74ik7nuuaekkb6
// hcb29mugju7r74ik7nuuaekkb6

// voxssl:
// s1|XIaYJ|XIaX
// s1|XIac3|XIaX

// fb620561f408b25819e9b3c4fad75f85=/

// pid:
// 4251
// 22409

