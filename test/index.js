'use strict';

const restify = require('restify');
const restifyClients = require('restify-clients');
const restifyEtagCache = require('../lib/');
const chai = require('chai');

const should = chai.should();

let SERVER,
  CLIENT,
  PORT;

describe('Restify ETag Cache', () => {

  beforeEach(function(done) {
    SERVER = restify.createServer({
      //dtrace: helper.dtrace,
      //log: helper.getLog('server')
    });

    SERVER.listen(0, '127.0.0.1', function() {
      PORT = SERVER.address().port;
      CLIENT = restifyClients.createJsonClient({
        url: 'http://127.0.0.1:' + PORT,
        //dtrace: helper.dtrace,
        retry: false
      });

      done();
    });


  });

  afterEach(function(done) {
    CLIENT.close();
    SERVER.close(done);
  });

  it('should send response', function(done) {
    SERVER.use(restifyEtagCache());

    SERVER.get('/etag/:id', function(req, res, next) {
      res.send({
        hello: 'world'
      });
      next();
    });

    let opts = {
      path: '/etag/foo',
      headers: {
      }
    };

    CLIENT.get(opts, function(err, _, res, obj) {
      res.should.be.an.Object;
      res.should.have.property('body');

      done();
    });
  });

  it('should send ETag header', function(done) {
    SERVER.use(restifyEtagCache());

    SERVER.get('/etag/:id', function(req, res, next) {
      res.send({
        hello: 'world'
      });
      next();
    });

    let opts = {
      path: '/etag/foo',
      headers: {}
    };

    CLIENT.get(opts, function(err, _, res, obj) {
      res.headers.etag.should.equal('"11-IkjuL6CqqtmReFMfkkvwC0sKj04"');
      done();
    });
  });

  it('should send HTTP StatusCode 200 when no etag header sent', function(done) {
    SERVER.use(restifyEtagCache());

    SERVER.get('/etag/:id', function(req, res, next) {
      res.send({
        hello: 'world'
      });
      next();
    });

    let opts = {
      path: '/etag/foo',
      headers: {}
    };

    CLIENT.get(opts, function(err, _, res, obj) {
      res.statusCode.should.equal(200);
      done();
    });
  });

  it('should send HTTP StatusCode 304 when etag header is sent', function(done) {
    SERVER.use(restifyEtagCache());

    SERVER.get('/etag/:id', function(req, res, next) {
      res.send({
        hello: 'world'
      });
      next();
    });

    let opts = {
      path: '/etag/foo',
      headers: {
        'If-None-Match': '"11-IkjuL6CqqtmReFMfkkvwC0sKj04"'
      }
    };

    CLIENT.get(opts, function(err, _, res, obj) {
      res.statusCode.should.equal(304);
      done();
    });
  });

  it('should ignore the specific route', function(done) {
    let etagCacheOptions = {
      ignore_routes: [ '/etag/:id' ]
    };

    SERVER.use(restifyEtagCache(etagCacheOptions));

    SERVER.get('/etag/:id', function(req, res, next) {
      res.send({
        hello: 'world'
      });
      next();
    });

    let opts = {
      path: '/etag/foo',
      headers: {
        'If-None-Match': '"11-IkjuL6CqqtmReFMfkkvwC0sKj04"'
      }
    };

    CLIENT.get(opts, function(err, _, res, obj) {
      res.statusCode.should.equal(200);
      done();
    });
  });

  it('should ignore the specific url', function(done) {
    let etagCacheOptions = {
      ignore_urls: [ '/specific/url' ]
    };

    SERVER.use(restifyEtagCache(etagCacheOptions));

    SERVER.get('/specific/url', function(req, res, next) {
      res.send({
        hello: 'world'
      });
      next();
    });

    let opts = {
      path: '/specific/url',
      headers: {
        'If-None-Match': '"11-IkjuL6CqqtmReFMfkkvwC0sKj04"'
      }
    };

    CLIENT.get(opts, function(err, _, res, obj) {
      res.statusCode.should.equal(200);
      done();
    });
  });

});
