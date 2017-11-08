/* eslint-disable no-confusing-arrow */

"use strict";

const fastifyRequestTime = require("./index");

const fastifyModule = require("fastify");
const test = require("tap").test;
const request = require("request");

test("reply.send automatically add x-response-time header", (t) => {
  t.plan(8);

  const data = {hello: "world"};

  const fastify = fastifyModule();
  fastify.register(fastifyRequestTime, (err) => {
    t.error(err);
  });

  fastify.get("/", (request, reply) => {
    reply.send(data);
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err, response, body) => {
      t.error(err);
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.headers["content-length"], `${body.length}`);
      t.ok(response.headers["x-response-time"]);
      t.ok(!isNaN(parseFloat(response.headers["x-response-time"])));
      t.deepEqual(JSON.parse(body), data);
      t.end();
      fastify.close();
    });
  });
});

test("reply.send add x-response-time header representing duration", (t) => {
  t.plan(8);

  const data = {hello: "world"};

  const fastify = fastifyModule();
  fastify.register(fastifyRequestTime, (err) => {
    t.error(err);
  });

  fastify.get("/", (request, reply) => {
    setTimeout(() => reply.send(data), 1000);
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err, response, body) => {
      t.error(err);
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.headers["content-length"], `${body.length}`);
      t.ok(response.headers["x-response-time"]);
      t.ok(1000 < parseFloat(response.headers["x-response-time"]));
      t.deepEqual(JSON.parse(body), data);
      t.end();
      fastify.close();
    });
  });
});

test("The digit and header option is correctly used", (t) => {
  t.plan(9);

  const data = {hello: "world"};
  const headerName = "X-My-Timer";
  const digits = 0;

  const fastify = fastifyModule();
  fastify.register(fastifyRequestTime, {
      digits: digits,
      header: headerName
    },
    (err) => {
      t.error(err);
    });

  fastify.get("/", (request, reply) => {
    reply.send(data);
  });

  fastify.listen(0, (err) => {
    t.error(err);

    request({
      method: "GET",
      uri: `http://localhost:${fastify.server.address().port}`
    }, (err, response, body) => {
      t.error(err);
      t.strictEqual(response.statusCode, 200);
      t.strictEqual(response.headers["content-length"], `${body.length}`);
      t.ok(response.headers[headerName.toLowerCase()]);
      const duration = response.headers[headerName.toLowerCase()];
      t.ok(duration);
      t.ok(duration === parseFloat(duration).toFixed(digits));
      t.deepEqual(JSON.parse(body), data);
      t.end();
      fastify.close();
    });
  });
});
