"use strict";

const fastifyPlugin = require("fastify-plugin");
const onHeaders = require("on-headers");

/**
 * Decorators
 *
 * @param {fastify} instance
 * @param {function} instance.decorateReply
 * @param {Object} opts
 * @param {function} next
 */
module.exports = fastifyPlugin((instance, opts, next) => {
  instance.addHook('onRequest', (req, res, next) => {
    const requestTime = process.hrtime();

    onHeaders(res, function () {
      const hrDuration = process.hrtime(requestTime);
      const duration = hrDuration[0]*1e5 + hrDuration[1]/1e4;
      this.setHeader("X-Response-Time", `${parseInt(duration, 10) / 100}`);
    });
    next();
  });
  next();
}, "0.x");
