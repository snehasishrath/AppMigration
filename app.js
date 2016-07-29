var express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config');
var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    mysql = require('node-mysql');
  
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
  console.log("Got a POST request for /process_migration" + " ' " + JSON.stringify(req.body) + " '");
   response = {
       	sourceIp: req.body.sourceIp,
        sourceLocation: req.body.sourceLocation,
       	destIp: req.body.destIp,
        destLocation: req.body.destLocation,
        destUsername: req.body.destUsername,
	      destPassword: req.body.destPassword,
	      apacheTomcat: req.body.apacheTomcat,
        nodejsServer: req.body.nodejsServer,
        jbossServer: req.body.jbossServer,
        nginxServer: req.body.nginxServer
   };
   console.log(JSON.stringify(response));

   var responseBuffer = ""
   
   var sourceIp = req.body.sourceIp
   var sourceLocation = req.body.sourceLocation
   var destIp = req.body.destIp
   var destLocation = req.body.destLocation
   var destPassword = req.body.destPassword
   
   if(req.body.apacheTomcat)
   {
    console.log("\r\n Selected Apache Tomcat");
    responseBuffer += "apacheTomcat";
    sourceLocation += '/opt'
   }
   if(req.body.nodejsServer)
   {
    console.log("\r\n Selected Node.JS Server");
    responseBuffer += "nodejsServer";
   }
   if(req.body.jbossServer)
   {
    console.log("\r\n Selected JBOSS Server");
    responseBuffer += "jbossServer";
   }
   if(req.body.nginxServer)
   {
    console.log("\r\n Selected Nginx Server");
    responseBuffer += "nginxServer";
   }

   fs.writeFile('scripts/local-web-to-source.sh', 'sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' apt-get install sshpass -y \r\n', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' apt-get install sshpass -y');
   });
   fs.appendFile('scripts/local-web-to-source.sh', 'sshpass -p ' + destPassword + ' rsync migration-script.sh root@' + destIp + '\r\n', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + destPassword + ' rsync migration-script.sh root@' + destIp);
   });
   fs.appendFile('scripts/local-web-to-source.sh', 'sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' chmod +x migration-script.sh \r\n', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' chmod +x migration-script.sh');
   });
   fs.appendFile('scripts/local-web-to-source.sh', 'sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' bash migration-script.sh \r\n', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' bash migration-script.sh');
   });

   fs.writeFile('scripts/migration-script.sh', 'rsync -avz --stats ' + sourceLocation + 'root@' + destIp + ' --progress \r\n', function (err) {
       if (err) throw err;
       console.log('rsync -avz --stats ' + sourceLocation + ' root@' + destIp + ' --progress');
   });

   /*exec ('bash scripts/rsync.py~', function(err, stdout, stderr) {
       console.log(stdout.toString('utf8'));
       responseBuffer += stdout.toString('utf8');
   });*/

   exec ('bash scripts/local-web-to-source.sh', function(err, stdout, stderr) {
       console.log(stdout.toString('utf8'));
       responseBuffer += stdout.toString('utf8');
   });

   exec ('bash scripts/migration-script.sh', function(err, stdout, stderr) {
       console.log(stdout.toString('utf8'));
       responseBuffer += stdout.toString('utf8');
   });

   responseBuffer += " will be migrated soon. Please check reports page for completion status."
   console.log("\r\n Response: " + responseBuffer + "\r\n");
   
   res.end(responseBuffer);
})

app.use(function(req,res) {
    return res.status(404).end();
});

module.exports = app