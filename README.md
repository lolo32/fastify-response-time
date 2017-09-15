# fastify-response-time

[![Build Status](https://travis-ci.org/lolo32/fastify-response-time.svg?branch=master)](https://travis-ci.org/lolo32/fastify-response-time)
[![Coverage Status](https://coveralls.io/repos/github/lolo32/fastify-response-time/badge.svg?branch=master)](https://coveralls.io/github/lolo32/fastify-response-time?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/lolo32/fastify-response-time/badge.svg)](https://snyk.io/test/github/lolo32/fastify-response-time)

Add X-Response-Time header at each request for Fastify. The unit used is milliseconds.


## Install

``
npm install --save fastify-response-time
``

## Usage

Add it to you project with `register` and you are done!

```javascript
// Register the plugin
fastify.register(require("fastify-response-time"));

// Define a new route in hapijs notation
fastify.route({
  method: "GET",
  url: "/header-hapi",
  handler: (request, reply) => {
    reply.send();
  }
});

// Define a new route in express notation
fastify.get("/header-express", (request, reply) => {
  reply.send();
});
```

Both examples responds with:

    < HTTP/1.1 200 OK
    < Content-Type: application/json
    < Content-Length: 17
    < X-Response-Time: 0.08
    < Date: Fri, 15 Sep 2017 21:14:33 GMT
    < Connection: keep-alive
    <
