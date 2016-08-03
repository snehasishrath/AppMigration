var app = require('./app'),
  config = require('./config');

var url = config.get('url');
var port = config.get('port');

var server = app.listen(port, function () {

  console.log("TechM AMT App Server listening at http://%s:%s", url, port);

});
