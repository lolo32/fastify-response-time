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
  // Check the options, and corrects with the default values if inadequate
  if (isNaN(opts.digits) || 0 > opts.digits) {
    opts.digits = 2;
  }
  opts.header = opts.header || "X-Response-Time";

  // Hook to be triggered on request (start time)
  instance.addHook("onRequest", (req, res, next) => {
    // Store the start timer in nanoseconds resolution
    req[symbolRequestTime] = process.hrtime();

    next();
  });

  // Hook to be triggered just before response to be send
  instance.addHook("onSend", (request, reply, payload, next) => {
    // Calculate the duration, in nanoseconds …
    const hrDuration = process.hrtime(request.req[symbolRequestTime]);
    // … convert it to milliseconds …
    const duration = (hrDuration[0] * 1e3 + hrDuration[1] / 1e6).toFixed(opts.digits);
    // … add the header to the response
    reply.header(opts.header, duration);

    next();
  });


  next();
  // Not before 0.31 (onSend hook added to this version)
}, ">= 0.31");
