# restify-etag-cache

> Automatic middleware that enables client cache based on ETag header

## Getting Started

Install the module with: `npm install restify-etag-cache`

## Usage

It works as a middleware, so its very easy to use the library:

`
var restify = require('restify');
var restifyEtagCache = require('restify-etag-cache');

var server = restify.createServer();

server.use(restifyEtagCache()); 
`

Its all ;)

The server will reply HTTP status code 304 (Not Modified) when it detects that the client already have the latest content version.

