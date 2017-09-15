# fastify-onheader

[![Build Status](https://travis-ci.org/lolo32/fastify-onheader.svg?branch=master)](https://travis-ci.org/lolo32/fastify-onheader)
[![Coverage Status](https://coveralls.io/repos/github/lolo32/fastify-onheader/badge.svg)](https://coveralls.io/github/lolo32/fastify-onheader)
[![Known Vulnerabilities](https://snyk.io/test/github/lolo32/fastify-onheader/badge.svg)](https://snyk.io/test/github/lolo32/fastify-onheader)

Execute a listener when a response is about to write headers for Fastify.

_This uses [github.com/jshttp/on-headers](https://github.com/jshttp/on-headers) under the hood_

## Install

``
npm install --save fastify-onheader
``

## Usage

Add it to you project with `register` and you are done!

You can now configure a new route, and call the new `reply.onheader()` to add a function that will be called just
before the request is send to modify the headers.

```javascript
// Register the plugin
fastify.register(require("fastify-onheader"), (err) => {
    if (err) {
      throw err;
    }
});

// Define a new route in hapijs notation
fastify.route({
  method: "GET",
  url: "/header-hapi",
  handler: (request, reply) => {
    reply.onheader(function() {
      this.setHeader("X-Powered-By", "Fastify - Hapi notations");
    });
  }
});

// Define a new route in express notation
fastify.get("/header-express", (request, reply) => {
  reply.onheader(function() {
    this.setHeader("X-Powered-By", "Fastify - Express notations");
  });
  reply.send({hello: "world"});
});
```

Please note that the callback function will be binded to a `ServerResponse` NodeJS object.
  
Have a look at
[nodejs.org/dist/latest/docs/api/http.html](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_serverresponse)
for more informations about what it could be permitted to do, but all function can be used safely.

If you are unsure about what to use, here is the list of functions that deals only with headers:

* `getHeader(name)`: return the content of a header (name is case insensitive)
* `hasHeader(name)`: return `true`if the header exists (case insensitive)
* `removeHeader(name)`: prevent the header from being send
* `setHeader(name, value)`: set a new value, or overwrite a previous
