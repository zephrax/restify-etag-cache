# restify-etag-cache

[![Build Status](https://travis-ci.org/zephrax/restify-etag-cache.svg?branch=master)](https://travis-ci.org/zephrax/restify-etag-cache)
[![devDependency Status](https://david-dm.org/zephrax/restify-etag-cache/dev-status.svg)](https://david-dm.org/zephrax/restify-etag-cache#info=devDependencies)
[![Dependency Status](https://david-dm.org/zephrax/restify-etag-cache.svg)](https://david-dm.org/zephrax/restify-etag-cache)
[![Coverage Status](https://coveralls.io/repos/github/zephrax/restify-etag-cache/badge.svg?branch=master)](https://coveralls.io/github/zephrax/restify-etag-cache?branch=master)

> Automatic middleware that enables client cache based on ETag header

## Getting Started

Install the module with: `npm install restify-etag-cache`

## Usage

It works as a middleware, so its very easy to use the library:

```javascript
var restify = require('restify');
var restifyEtagCache = require('restify-etag-cache');

var server = restify.createServer();

server.use(restifyEtagCache()); 
```

Its all ;)

The server will reply HTTP status code 304 (Not Modified) when it detects that the client already have the latest content version.

