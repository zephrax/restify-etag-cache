'use strict';

const debug = require('debug')('restify-etag-cache');
const etag = require('etag');
const async = require('async');
const restify = require('restify');

function eTagCache(opts) {
  let options = {};

  Object.assign(options, opts || { weak: false });

  function middleware(req, res, nextM) {
    if (options.ignore_routes) {
      if (options.ignore_routes.indexOf(req.route.path) > -1) {
        return nextM();
      }
    } else if (options.ignore_urls) {
      if (options.ignore_urls.indexOf(req.url) > -1) {
        return nextM();
      }
    }

    let oldWrite,
      oldWriteHead,
      oldEnd;

    let chunks = [];
    let headers = [];

    oldWrite = res.write;
    oldWriteHead = res.writeHead;
    oldEnd = res.end;

    chunks = [];
    headers = [];

    res.writeHead = function() {
      headers.push(arguments);
    };

    res.write = function(chunk) {
      chunks.push(chunk);
    };

    res.end = function(chunk) {
      if (chunk) {
        chunks.push(chunk);
      }

      res.writeHead = oldWriteHead;
      res.write = oldWrite;
      res.end = oldEnd;

      const strEtag = etag(chunks.join(''));
      res.setHeader('etag', strEtag);
      debug('Generated etag: ' + strEtag);

      async.eachSeries(restify.plugins.conditionalRequest(), (conditionalRequestMiddleware, nextConditionalRequestMiddleware) => {
        conditionalRequestMiddleware(req, res, (stopChainFlag) => {
          debug('nextConditionalRequestMiddleware');
          if (stopChainFlag === false) {
            nextConditionalRequestMiddleware(new Error('Send client cache headers'));
          } else {
            nextConditionalRequestMiddleware();
          }
        });
      }, (err) => {
        if (!err) {
          headers.forEach((header) => {
            oldWriteHead.apply(res, header);
          });

          chunks.forEach((chunk) => {
            oldWrite.apply(res, [chunk]);
          });

          oldEnd.apply(res, arguments);
        }
      });
    };

    nextM();
  }

  return middleware;
}

module.exports = eTagCache;

