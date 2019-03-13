let P = require('bluebird'),
request = P.promisifyAll(require("request")),
Iconv = require('iconv-lite');


let URL_STRING = 'https://www.google.com/search?q=%D0%9B%D1%83%D1%87%D1%88%D0%B5+%D0%B7%D0%B2%D0%BE%D0%BD%D0%B8%D1%82%D0%B5+%D0%A1%D0%BE%D0%BB%D1%83&hl=en&source=lnms&tbm=isch&sa=X&ved=0ahUKEwjy5Pf-koDhAhUtx4sKHTY7DQQQ_AUIDigB&biw=1280&bih=607'



request(URL_STRING, function (error, response, body) {
  console.log('error:', error);
  console.log('statusCode:', response && response.statusCode); 
  body = Iconv.decode(new Buffer(body, 'binary'), 'win1251');
  console.log('body:', body);
});