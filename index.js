"use strict";

const fastifyPlugin = require("fastify-plugin");

const symbolRequestTime = Symbol("RequestTimer");

/**
 * Decorators
 *
 * @param {fastify} instance
 * @param {function} instance.decorateReply
 * @param {Object} opts
 * @param {function} next
 */
module.exports = fastifyPlugin((instance, opts, next) => {
  // Hook to be triggered on request (start time)
  instance.addHook('onRequest', (req, res, next) => {
    // Store the start timer in nanoseconds resolution
    req[symbolRequestTime] = process.hrtime();

    next();
  });

  // Hook to be triggered just before response to be send
  instance.addHook('onSend', (request, reply, payload, next) => {
    const requestTime = request.req[symbolRequestTime];
    // Calculate the duration, in nanoseconds …
    const hrDuration = process.hrtime(requestTime);
    // … convert it to milliseconds …
    const duration = Math.round(hrDuration[0]*1e5 + hrDuration[1]/1e4) / 100;
    // … add the header to the response
    reply.header("X-Response-Time", `${duration}`);

    next();
  });


  next();
  // Not before 0.31 (onSend hook added to this version)
}, ">= 0.31");
