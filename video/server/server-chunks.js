'use strict';

var path = require('path');

module.exports.create = function () {
    var that = {}
      // private members
      , fs = require('fs')
      , movie
      , total
      ;

    //private functions
    fs.readFile(path.resolve(__dirname,'../resources/videos/sample.mp4'), function (err, data) {
      if (err) {
        throw err;
      }
      movie = data;
      total = movie.length;
    });
  
    function getPositions(range) {
      return range === 0 ? [0] : range.replace(/bytes=/, "").split("-");
    }

    // privileged
    that.loadHtml = function (req, res) {
      res.status(200);
      res.set({'Content-Type': 'text/html'});
      res.sendFile(path.resolve(__dirname, '../client/player.html'));
    };

    that.playVideo = function(req, res) {
      var range = req.headers.range || 0;
      var positions = getPositions(range);
      
      var start = parseInt(positions[0], 10);
      // if last byte position is not present then it is the last byte of the video file.
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      var chunksize = (end-start)+1;
      
      res.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type":"video/mp4"});
      res.end(movie.slice(start, end+1), "binary");
    };
  
    return that;
};