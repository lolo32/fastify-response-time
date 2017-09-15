"use strict";

const fastify = require("fastify")();

fastify.register(require("./index"), (err) => {
  if (err) {
    throw err;
  }
});
const startTime = Symbol("startTime");

fastify.get("/", (request, reply) => {
  reply.send({hello: "world"});
});

fastify.listen(3000, (err) => {
  if (err) {
    throw err;
  }
  console.log(`server listening on ${fastify.server.address().port}`);
});
