var express = require('express'),
  bodyParser = require('body-parser'),
  config = require('./config'),
  spawn = require('child_process').spawn,
  fs = require('fs'),
  mysql = require('node-mysql');

var app = express();
app.use(bodyParser.json({ type: ['json', '+json'] }));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Create application/x-www-form-urlencoded parser
//var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static('public'));

app.get('/', function (req, res) {
  console.log("Got a GET request for the homepage");
  res.sendFile(__dirname + "/public/html/" + "home.html");
})

app.get('/migration', function (req, res) {
  console.log("Got a GET request for /migration");
  res.sendFile(__dirname + "/public/html/" + "migration.html");
})

app.get('/reports', function (req, res) {
  console.log("Got a GET request for /reports");
  res.sendFile(__dirname + "/public/html/" + "reports.html");
})

app.get('/wiki', function (req, res) {
  console.log("Got a GET request for /wiki");
  res.sendFile(__dirname + "/public/html/" + "wiki.html");
})

app.get('/contacts', function (req, res) {
  console.log("Got a GET request for /contacts");
  res.sendFile(__dirname + "/public/html/" + "contacts.html");
})

app.post('/migration', function (req, res) {
  console.log("Got a POST request for /migration - " + "'" + JSON.stringify(req.body) + "'");
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

  var sourceIp = req.body.sourceIp;
  var sourceLocation = req.body.sourceLocation;
  var sourcePassword = req.body.sourcePassword;
  var destIp = req.body.destIp;
  var destLocation = req.body.destLocation;
  var destPassword = req.body.destPassword;

  var OS = req.body.operatingSystem;
  var pkgMgr = "";
  var actualScript = "";
  var localScript = "";
  var remoteInitScript = "";

  var sshToDestination = 'sshpass -p ' + destPassword + ' ssh -o StrictHostKeyChecking=no root@' + destIp;
  var sshToSource = 'sshpass -p ' + sourcePassword + ' ssh -o StrictHostKeyChecking=no root@' + sourceIp;

  if (OS == "Ubuntu") {
    pkgMgr = "apt";
  }
  else if (OS == "Red Hat" || OS == "CentOS" || OS == "Fedora") {
    pkgMgr = "yum";
  }

  if (req.body.apacheTomcat) {
    console.log("\r\n Selected Apache Tomcat");
    remoteInitScript = sshToDestination + ' /bin/bash ' + pkgMgr + ' install -y ' + 'java-1.7.0-openjdk.x86_64;' + sshToDestination + ' /bin/bash /opt/tomcat/bin/startup.sh; '
    responseBuffer += "Apache Tomcat";
  }
  if (req.body.nodejsServer) {
    console.log("\r\n Selected Node.JS Server");
    finalScript = ''
    responseBuffer += "Node.JS Server";
  }
  if (req.body.jbossServer) {
    console.log("\r\n Selected JBOSS Server");
    responseBuffer += "JBOSS Server";
  }
  if (req.body.nginxServer) {
    console.log("\r\n Selected Nginx Server");
    responseBuffer += "Nginx Server";
  }

  //Database Server
  if (req.body.mysqlServer) {
    console.log("\r\n Selected MySQL Server");

    var mysqlIp = '10.30.53.198'
    var mysqlPassword = root

    var pkgInstall = pkgMgr + ' install -y ' + 'mariadb-server mysql; systemctl enable mariadb.service; systemctl start mariadb.service; systemctl status mariadb.service; mysqladmin -u root password ' + mysqlPassword + '; '
    var dumpToFile = sshToSource + ' /bin/bash mysqldump -u root -p' + mysqlPassword + ' --all-databases > /tmp/dump.sql; '
    var moveConfigsToDestination = 'sshpass -p ' + destPassword + ' rsync -avz --stats --progress /etc/my.cnf root@' + destIp + ':/etc/my.cnf; ' + 'sshpass -p ' + destPassword + ' rsync -avz --stats --progress /etc/my.cnf.d root@' + destIp + ':/etc/my.cnf.d; '
    var replaceIpInConfigs = sshToDestination + ' sed -r -i \'s/^(bind-address = *.*.*.*)/\\bind-address = ' + mysqlIp + '/\' /etc/my.cnf.d/openstack.cnf; '
    console.log("\r\nReplace IP : " + replaceIpInConfigs + '\r\n');
    var moveDumpToDestination = 'sshpass -p ' + destPassword + ' rsync -avz --stats --progress /tmp/dump.sql root@' + destIp + ':/tmp/dump.sql; '
    var applyDumpToServer = sshToDestination + ' mysql -u root -p' + mysqlPassword + ' < /tmp/dump.sql; '
    var startService = sshToDestination + ' /bin/bash systemctl restart mariadb.service;'

    actualScript = pkgInstall + replaceIpInConfigs + moveDumpToDestination + applyDumpToServer + startService
    localScript = dumpToFile + moveConfigsToDestination

    responseBuffer += "MySQL Server";
  }

  //Authentication Server
  if (req.body.ldapServer) {
    console.log("\r\n Selected LDAP Server");

    var pkgInstall = pkgMgr + ' install -y ' + 'openldap openldap-servers openldap-clients; systemctl enable slapd.service; systemctl start slapd.service; systemctl status slapd.service; '
    var dumpToFile = sshToSource + ' /bin/bash slapcat -f /etc/openldap/ldap.conf -l /tmp/backup.ldif; '
    var moveConfigsToDestination = 'sshpass -p ' + destPassword + ' rsync -avz --stats --progress /etc/openldap/ldap.conf root@' + destIp + ':/etc/openldap/ldap.conf; '
    var moveDumpToDestination = 'sshpass -p ' + destPassword + ' rsync -avz --stats --progress /tmp/backup.ldif root@' + destIp + ':/tmp/backup.ldif; '
    var stopService = sshToDestination + ' /bin/bash systemctl stop slapd.service; '
    var chownRootToLdap = sshToDestination + ' /bin/bash chown -R ldap:ldap /var/lib/ldap; '
    var applyDumpToServer = sshToDestination + ' slapadd -v -c -l /tmp/backup.ldif -f /etc/openldap/ldap.conf; '
    var startService = sshToDestination + ' /bin/bash systemctl restart slapd.service; '

    actualScript = pkgInstall + moveDumpToDestination + stopService + applyDumpToServer + startService
    localScript = dumpToFile + moveConfigsToDestination

    responseBuffer += "LDAP Server";
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

  if (req.body.apacheTomcat || req.body.nodejsServer || req.body.jbossServer || req.body.nginxServer) {
	   var actualHostKeySourceDestination = sshToDestination + ' echo ""; ';
	   var rsyncSourceToDestination = 'sshpass -p ' + destPassword + ' rsync -avz --stats --progress ' + sourceLocation + ' root@' + destIp + ":" + destLocation + '; ';

	   var rsyncFileToSourceFromWebServer = 'sshpass -p ' + sourcePassword + ' rsync scripts/migration-script.sh root@' + sourceIp + ':/root/migration-script.sh; ';
	   var scriptRunnableInSource = sshToSource + ' chmod +x /root/migration-script.sh; ';
	   var runScriptInSource = sshToSource + ' bash /root/migration-script.sh; ';

	   var actualScript = actualHostKeySourceDestination + rsyncSourceToDestination;
	   var localScript = rsyncFileToSourceFromWebServer + scriptRunnableInSource + runScriptInSource;
	 };

  //Actual script in Source for migration
  fs.writeFile('scripts/migration-script.sh', actualScript, 'utf8', function (err) {
      if (err) throw err;
      fs.readFile('scripts/migration-script.sh', function (err, data) {
       if (err) throw err;
       console.log("\n Written Migration Script File - " + data);
      });
  });

  //Rsync file to Source from Webserver
  fs.writeFile('scripts/local-web-to-source.sh', localScript, 'utf8', function (err) {
      if (err) throw err;
      fs.readFile('scripts/local-web-to-source.sh', function (err, data) {
       if (err) throw err;
       console.log("\n Written Local Script File - " + data);
      });
  });

  cmd = spawn('/bin/bash', ['scripts/local-web-to-source.sh']);
  cmd.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });
  cmd.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
  cmd.on('exit', function (code) {
    console.log('child process exited with code ' + code);
  });

  responseBuffer += " will be migrated soon. Please check reports page for completion status.";
  console.log("\r\n Response: " + responseBuffer + "\r\n");
  
  res.end(responseBuffer);
});

app.use(function (req, res) {
  return res.status(404).end();
});

module.exports = app