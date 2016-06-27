'use strict';

var express = require('express')
  , app = express()
  , path = require('path')
  , server = require('http').createServer(app)
  , port = process.env.NODE_ENV.port || 4200
  , streamer = require(path.resolve(__dirname, './server/server-chunks')).create()
  ;

// Static content.
app.use(express.static('client'));
app.use(express.static('resources'));

app.get('/fe', streamer.loadHtml);
app.get('/be', streamer.playVideo);

server.listen(port);