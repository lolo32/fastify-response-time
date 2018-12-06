"use strict";

const fastify = require("fastify")();

fastify.register(require("./index"));
fastify.after((err) => {
  if (err) {
    throw err;
  }
});

fastify.get("/", (request, reply) => {
    reply.send({hello: "world"});
});

fastify.get("/ServerTiming1", (request, reply) => {

  reply.setServerTiming("miss");
  reply.setServerTiming("db", 53);
  reply.setServerTiming("app", 47.2);
  reply.setServerTiming("customView");
  reply.setServerTiming("dc", null, "atl");
  reply.setServerTiming("cache", 23.2, "Cache Read");

  setTimeout(() => {
    reply.send("Hello");
  }, 150)
});

fastify.listen(3000, (err) => {
  if (err) {
    throw err;
  }
  console.log(`server listening on ${fastify.server.address().port}`);
});
