var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');
var mimeTypes = {
    "html": "text/html",
    "htm": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};

http.createServer(function(req, res) {
	var uri = url.parse(req.url).pathname;
	var filename = path.join(process.cwd(), unescape(uri));
	var stats;

	try {
		stats = fs.lstatSync(filename); // throws if path doesn't exist
	} catch (e) {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write('404 Not Found\n');
		res.end();
		return;
	}


	if (stats.isFile()) {
		// path exists, is a file
		var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
		res.writeHead(200, {'Content-Type': mimeType} );

		var fileStream = fs.createReadStream(filename);
		fileStream.pipe(res);
	} else if (stats.isDirectory()) {
		// path exists, is a directory
		var filenames = fs.readdirSync(filename);
		var puri = (uri === '/' ? '/' : uri.substr(0, uri.lastIndexOf('/', uri.length-2)) + '/');
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write('Index of '+uri+'\n');

		res.write('<br>&nbsp;&nbsp;<a href="' + puri + '">(parent dir)</a>');
		for(var i=0, len=filenames.length; i<len; i++) {
			res.write('<br>&nbsp;&nbsp;<a href="' + (uri === '/' ? '' : uri + '/') + filenames[i] + '">' + filenames[i] + '</a>');
		}
		res.end();
	} else {
		// Symbolic link, other?
		// TODO: follow symlinks?  security?
		res.writeHead(500, {'Content-Type': 'text/plain'});
		res.write('500 Internal server error\n');
		res.end();
	}

}).listen(1337);

var open;
try {
	open = require('open');
	open('http://localhost:1337/', function (err) {
		if (err) throw err;
		console.log('Triggered browser to open http://localhost:1337/');
	});
}catch(err) {
	console.log('error: ' + err);
	console.log('please open http://localhost:1337/');
}
