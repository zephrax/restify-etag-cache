'use strict';

const debug = require('debug')('restify-etag-cache');
const etag = require('etag');
const async = require('async');
const restify = require('restify');

function eTagCache(req, res, nextM) {
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

    async.eachSeries(restify.conditionalRequest(), (conditionalRequestMiddleware, nextConditionalRequestMiddleware) => {
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

module.exports = eTagCache;

