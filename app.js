var express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config'),
    exec = require('child_process').exec,
    fs = require('fs');
  
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

   fs.appendFile('C:/Users/GeorgeDavis/Desktop/MigrationApp/MigrationApp/scripts/local-web-to-source.sh', 'sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' apt-get install sshpass -y', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' apt-get install sshpass -y');
   });
   fs.appendFile('C:/Users/GeorgeDavis/Desktop/MigrationApp/MigrationApp/scripts/local-web-to-source.sh', 'sshpass -p ' + destPassword + ' rsync migration-script.sh root@' + destIp + ', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + destPassword + ' rsync migration-script.sh root@' + destIp + ');
   });
   fs.appendFile('C:/Users/GeorgeDavis/Desktop/MigrationApp/MigrationApp/scripts/local-web-to-source.sh', 'sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' chmod +x migration-script.sh', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' chmod +x migration-script.sh');
   });
   fs.appendFile('C:/Users/GeorgeDavis/Desktop/MigrationApp/MigrationApp/scripts/local-web-to-source.sh', 'sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' bash migration-script.sh', function (err) {
       if (err) throw err;
       console.log('sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp + ' bash migration-script.sh');
   });

   fs.appendFile('C:/Users/GeorgeDavis/Desktop/MigrationApp/MigrationApp/scripts/migration-script.sh', 'rsync -avz --stats' + req.body.sourceLocation + 'root@' + req.body.destIp + ' --progress', function (err) {
       if (err) throw err;
       console.log('rsync -avz --stats' + req.body.sourceLocation + 'root@' + req.body.destIp + ' --progress');
   });

   exec ('dir', function(err, stdout, stderr) {
       console.log(stdout.toString('utf8'));
       responseBuffer += responseBuffer;
   });

   console.log("Response: " + responseBuffer);

   /*
   // http://nodejs.org/api.html#_child_processes var sys = require('sys') var exec = require('child_process').exec; var child; // executes `pwd` child = exec("pwd", function (error, stdout, stderr) { sys.print('stdout: ' + stdout); sys.print('stderr: ' + stderr); if (error !== null) { console.log('exec error: ' + error); } }); 

    // or more concisely
    //var sys = require('sys') var exec = require('child_process').exec; function puts(error, stdout, stderr) { sys.puts(stdout) } exec("ls -la", puts);
    */
})

app.use(function(req,res) {
    return res.status(404).end();
});

module.exports = app
