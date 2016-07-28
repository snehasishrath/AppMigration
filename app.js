var express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config');
  
var app = express();
app.use(bodyParser.json({ type: [ 'json', '+json' ] }));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// Create application/x-www-form-urlencoded parser
//var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static('public'));

app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.sendFile( __dirname + "/public/html/" + "home.html" );
})

app.get('/migration', function (req, res) {
   console.log("Got a GET request for /migration");
   res.sendFile( __dirname + "/public/html/" + "migration.html" );
})

app.get('/reports', function(req, res) {   
   console.log("Got a GET request for /reports");
   res.sendFile( __dirname + "/public/html/" + "reports.html" );
})

app.get('/wiki', function(req, res) {
   console.log("Got a GET request for /wiki");
   res.sendFile( __dirname + "/public/html/" + "wiki.html" );
})

app.get('/contacts', function(req, res) {
   console.log("Got a GET request for /contacts");
   res.sendFile( __dirname + "/public/html/" + "contacts.html" );
})

app.post('/process_migration', function (req, res) {
  console.log("Got a POST request for /process_migration" + " ' " + JSON.stringify(req.query) + " '");
   response = {
       	source: req.body.sourceLocation,
       	destination: req.body.destLocation,
        username: req.body.destUsername,
	      password: req.body.destPassword,
	      apacheTomcat: req.body.apacheTomcat,
        nodejsServer: req.body.nodejsServer,
        jbossServer: req.body.jbossServer,
        nginxServer: req.body.nginxServer
   };
   console.log(JSON.stringify(response));

   var responseBuffer = "";

   var importStatements = "import os;import subprocess;"

   var local_source = req.body.sourceLocation
   var remote_dest = req.body.destLocation
   
   if(req.body.apacheTomcat)
   {
    console.log("Selected apacheTomcat");
    responseBuffer += "apacheTomcat";
    local_source += '/opt'
   }
   if(req.body.nodejsServer)
   {
    console.log("Selected nodejsServer");
    responseBuffer += "nodejsServer";
   }
   if(req.body.jbossServer)
   {
    console.log("Selected jbossServer");
    responseBuffer += "jbossServer";
   }
   if(req.body.nginxServer)
   {
    console.log("Selected nginxServer");
    responseBuffer += "nginxServer";
   }

   //var prepVariables = "local = " + local_source + "; remote = " + remote_dest + ";"
   //var rsync = "cmd = rsync -avz --stats local remote --progress;"
   //var subprocess = "o, e = subprocess.Popen(cmd, shell=True, stdout = subprocess.PIPE, stderr = subprocess.PIPE).communicate();"
   //var printOutput = "if o: print(o);"
   //res.end(importStatements + prepVariables + rsync + subprocess + printOutput);
   //res.end("File not found: " + importStatements + prepVariables + rsync + subprocess + printOutput);

   res.end("Selected " + responseBuffer + " Source: " + local_source + " Destination: " + remote_dest);
})

app.use(function(req,res) {
    return res.status(404).end();
});

module.exports = app
