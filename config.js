var convict = require('convict'),
    check = require('validator').check;

var conf = convict({
	env: {
		doc: 'The Server Environment',
		format: ['development','production'],
		default: 'production',
		env: 'NODE_ENV'
	}
	});
//var env = conf.get('env');
var env = "development"
var envConfigFile = './config/' + env + '.json';

try {
	var files = [ envConfigFile];

	conf.loadFile(files);
}
catch(e) {
	console.error('Could not load configuration: %s', e);
}

conf.validate();

module.exports = conf;
