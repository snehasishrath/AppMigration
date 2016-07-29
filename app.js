var express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    child_process = require('child_process'),
    fs = require('fs'),
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
   /*response = {
       	sourceIp: req.body.sourceIp,
        sourceLocation: req.body.sourceLocation,
        sourceUsername: req.body.sourceUsername,
        sourcePassword: req.body.sourcePassword,
       	destIp: req.body.destIp,
        destLocation: req.body.destLocation,
        destUsername: req.body.destUsername,
	      destPassword: req.body.destPassword,
	      apacheTomcat: req.body.apacheTomcat,
        nodejsServer: req.body.nodejsServer,
        jbossServer: req.body.jbossServer,
        nginxServer: req.body.nginxServer
   };
   console.log(JSON.stringify(response));*/

   var responseBuffer = ""
   
   var sourceIp = req.body.sourceIp
   var sourceLocation = req.body.sourceLocation
   var sourcePassword = req.body.sourcePassword
   var destIp = req.body.destIp
   var destLocation = req.body.destLocation
   var destPassword = req.body.destPassword
   
   if(req.body.apacheTomcat)
   {
    console.log("\r\n Selected Apache Tomcat");
    responseBuffer += "Apache Tomcat";
    //sourceLocation += '/opt'
   }
   if(req.body.nodejsServer)
   {
    console.log("\r\n Selected Node.JS Server");
    responseBuffer += "Node.JS Server";
   }
   if(req.body.jbossServer)
   {
    console.log("\r\n Selected JBOSS Server");
    responseBuffer += "JBOSS Server";
   }
   if(req.body.nginxServer)
   {
    console.log("\r\n Selected Nginx Server");
    responseBuffer += "Nginx Server";
   }

   //Installation in Source and Destination
   /*fs.writeFile('scripts/local-web-to-source.sh', 'sshpass -p ' + sourcePassword + ' ssh -o StrictHostKeyChecking=no root@' + sourceIp + ' yum install sshpass -y;', 'utf8', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + sourcePassword + ' ssh -o StrictHostKeyChecking=no root@' + sourceIp + ' yum install sshpass -y');
   });
   fs.appendFile('scripts/local-web-to-source.sh', 'sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' yum install sshpass -y;', 'utf8', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' yum install sshpass -y');
   });*/

   var actualHostKeySourceDestination = 'sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' echo "";'
   var rsyncSourceToDestination = 'sshpass -p ' + destPassword + ' rsync -avz --stats --progress ' + sourceLocation + ' root@' + destIp + ":" + destLocation + ';'

   var rsyncFileToSourceFromWebServer = 'sshpass -p ' + sourcePassword + ' rsync scripts/migration-script.sh root@' + sourceIp + ':/root/migration-script.sh;'
   var scriptRunnableInSource = 'sshpass -p ' + sourcePassword + ' ssh -o StrictHostKeyChecking=no root@' + sourceIp + ' chmod +x /root/migration-script.sh;'
   var runScriptInSource = 'sshpass -p ' + sourcePassword + ' ssh -o StrictHostKeyChecking=no root@' + sourceIp + ' /bin/bash /root/migration-script.sh;'

   var actualScript = actualHostKeySourceDestination + rsyncSourceToDestination;

   var localScript = rsyncFileToSourceFromWebServer + scriptRunnableInSource + runScriptInSource;

   //Actual script in Source for migration
   fs.writeFile('scripts/migration-script.sh', actualScript, 'utf8', function (err) {
       if (err) throw err;
       console.log("\n" + actualScript);
   });
   
   /*fs.appendFile('scripts/migration-script.sh', rsyncSourceToDestination, 'utf8', function (err) {
       if (err) throw err;
       console.log(rsyncSourceToDestination);
   });*/

      //Rsync file to Source from Webserver
   fs.writeFile('scripts/local-web-to-source.sh', localScript, 'utf8', function (err) {
       if (err) throw err;
       console.log("\n" + localScript);
   });

   /*//Make the script runnable in Source from Webserver
   fs.appendFile('scripts/local-web-to-source.sh', scriptRunnableInSource, 'utf8', function (err) {
       if (err) throw err;
       console.log(scriptRunnableInSource);
   });

   //Run the script in Source from Webserver
   fs.appendFile('scripts/local-web-to-source.sh', runScriptInSource, 'utf8', function (err) {
       if (err) throw err;
       console.log(runScriptInSource);
   });*/

   /*exec ('/bin/bash scripts/rsync.py~', function(err, stdout, stderr) {
       console.log(stdout.toString('utf8'));
       responseBuffer += stdout.toString('utf8');
   });

   exec ('pwd', function(err, stdout, stderr) {
       console.log(" Running pwd - " + stdout.toString('utf8'));
       responseBuffer += stdout.toString('utf8');
   });*/

   child_process.execFile('sh', ['scripts/local-web-to-source.sh'], function(err, stdout, stderr) {
       if(err)
        {
          console.log("Error: " + err);
        }
        console.log(" Running local-web-to source script - " + stdout.toString('utf8'));
        console.log(" Warning(s) - " + stderr.toString('utf8'));
       //responseBuffer += stdout.toString('utf8');
   });

   /*child_process.exec('node -v', function(error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
          console.log('exec error: ' + error);
      }
   });*/

   /*exec ('/bin/bash scripts/migration-script.sh', function(err, stdout, stderr) {
       console.log(" Running migration script " + stdout.toString('utf8'));
       responseBuffer += stdout.toString('utf8');
   });*/

   responseBuffer += " will be migrated soon. Please check reports page for completion status."
   console.log("\r\n Response: " + responseBuffer + "\r\n");
   
   res.end(responseBuffer);
})

app.use(function(req,res) {
    return res.status(404).end();
});

module.exports = app