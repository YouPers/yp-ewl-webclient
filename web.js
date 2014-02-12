var static = require('node-static');
var httpProxy = require('http-proxy');

//
// Create a node-static server instance to serve the './app' folder
//
var file = new (static.Server)('./tmp', './app');
var proxy = httpProxy.createProxyServer({});

var port = process.env.PORT || 9000;

require('http').createServer(function (req, res) {

    if (req.url.indexOf('/locales/') != -1 || (req.url.indexOf('/api/projects/') != -1 )) {
        proxy.web(req, res, {target: 'https://webtranslateit.com'})
    } else {
        file.serve(req, res);
    }

}).listen(port);
