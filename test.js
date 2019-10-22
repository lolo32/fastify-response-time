/* eslint-disable no-confusing-arrow */

"use strict";

const fastifyRequestTime = require("./index");

const fastifyModule = require("fastify");
const test = require("tap").test;
const request = require("request");

const sleep = require("sleep-promise");

test("reply.send automatically add x-response-time header", (t) => {
  t.plan(8);

  const data = {hello: "world"};

  const fastify = fastifyModule();
  fastify.register(fastifyRequestTime);
  fastify.after((err) => {
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
  fastify.register(fastifyRequestTime);
  fastify.after((err) => {
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
    });
  fastify.after((err) => {
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

test("Check the Server-Timing header", (t) => {
  t.plan(20);

  const data = {hello: "world"};

  const fastify = fastifyModule();
  fastify.register(fastifyRequestTime);
  fastify.after((err) => {
    t.error(err);
  });

  fastify.get("/", (request, reply) => {
    t.ok(reply.setServerTiming, "function .setServerTiming exists on reply");
    reply.send(data);
  });

  fastify.get("/timing", (request, reply) => {
    t.ok(reply.setServerTiming("miss"));
    t.ok(reply.setServerTiming("db", 53));
    t.ok(reply.setServerTiming("app", 47.2));
    t.ok(reply.setServerTiming("dc", null, "atl"));
    t.ok(reply.setServerTiming("cache", 23.2, "Cache Read"));
    t.notOk(reply.setServerTiming("db", 150));
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
      t.notOk(response.headers["server-timing"]);

      request({
        method: "GET",
        uri: `http://localhost:${fastify.server.address().port}/timing`
      }, (err, response, body) => {
        t.error(err);
        t.strictEqual(response.statusCode, 200);
        t.strictEqual(response.headers["content-length"], `${body.length}`);
        t.ok(response.headers["x-response-time"]);
        t.ok(response.headers["server-timing"]);
        const headers = response.headers["server-timing"];
        t.equal(headers, "miss,db;dur=53,app;dur=47.2,dc;desc=atl,cache;dur=23.2;desc=\"Cache Read\"");
        t.end();
        fastify.close();
      });
    });
  });

  test("Check (a)syncMeasureHr", (t) => {
    const fastify = fastifyModule();
    fastify.register(fastifyRequestTime);
    fastify.after((err) => {
      t.error(err);
    });

    fastify.get("/wait-1-sec", async (request, reply) => {
      try {
        await reply.asyncMeasureHr("wait", async () => {
          await sleep(1000)
          if (request.query.error) {
            throw new Error()
          } else {
            return "plop"
          }
        });
      } catch (e) {}
      reply.send("ok")
    });

    fastify.get("/no-wait", (request, reply) => {
      try {
        reply.syncMeasureHr("wait", () => {
          if (request.query.error) {
            throw new Error()
          } else {
            return "plop"
          }
        });
      } catch (e) {}
      reply.send("ok")
    });

    fastify.listen(0, (err) => {
      t.error(err);

      request({
        method: "GET",
        uri: `http://localhost:${fastify.server.address().port}/wait-1-sec`
      }, (err, response, body) => {
        t.error(err);
        t.strictEqual(response.statusCode, 200);
        t.ok(response.headers["server-timing"]);
        const headers = response.headers["server-timing"];
        t.ok(/wait;dur=100\d.\d+/.test(headers));

        request({
          method: "GET",
          uri: `http://localhost:${fastify.server.address().port}/no-wait`
        }, (err, response, body) => {
          t.error(err);
          t.strictEqual(response.statusCode, 200);
          t.ok(response.headers["server-timing"]);
          const headers = response.headers["server-timing"];
          t.ok(/wait;dur=\d.\d+/.test(headers));

          request({
            method: "GET",
            uri: `http://localhost:${fastify.server.address().port}/wait-1-sec?error=1`
          }, (err, response, body) => {
            t.error(err);
            t.strictEqual(response.statusCode, 200);
            t.ok(response.headers["server-timing"]);
            const headers = response.headers["server-timing"];
            t.ok(/wait;dur=\d.\d+/.test(headers));

            request({
              method: "GET",
              uri: `http://localhost:${fastify.server.address().port}/no-wait?error=1`
            }, (err, response, body) => {
              t.error(err);
              t.strictEqual(response.statusCode, 200);
              t.ok(response.headers["server-timing"]);
              const headers = response.headers["server-timing"];
              t.ok(/wait;dur=\d.\d+/.test(headers));
              t.end();
              fastify.close();
            });
          });
        });
      });
    })
  })
});
