/*!
 * Backbone.Whisper v0.0.1
 * Copyright (c) 2014 Seth McLaughlin
 * Distributed under MIT license
 * https://github.com/sethmcl/backbone.whisper
*/
(function (Backbone, _) {
  'use strict';

  Backbone.Whisper = function () {
    var wctx = this.whisper = whisper,
        ctx  = this;

    /**
     * Bubble message up
     * @method whisper
     * @param {string} message name
     * @param {object} data contents
     * @param {deferred} [reply] deferred
     */
    function whisper(message, data, reply) {
      var parent, def;

      parent = wctx.parent();
      def    = reply || $.Deferred();

      if (typeof message === 'string') {
        message = wctx.initMessage(message);
      }

      if (!parent || !parent.whisper) {
        def.reject('No parent');
      } else {
        parent.whisper.receive(message, data, def);
      }

      return def.promise();
    }

    /**
     * Reverse bubble message
     * @method reverseWhisper
     * @param {string} message name
     * @param {object} data contents
     * @param {deferred} [reply] deferred
     */
    wctx.reverseWhisper = function (message, data, reply) {
      var children, def;

      children = wctx.children();
      def      = reply || $.Deferred();

      if (typeof message === 'string') {
        message = wctx.initMessage(message);
      }

      if (!children) {
        def.reject('No children');
      } else {
        _.each(children, function (view) {
          if (view !== message.source) {
            view.whisper.receive(message, data, def, true);
          }
        });
      }

      return def.promise();
    };

    /**
     * @method initMessage
     */
    wctx.initMessage = function (message) {
      return {
        source          : this,
        name            : message,
        propagate       : true,
        stopPropagation : function () {
          this.propagate = false;
        }
      };
    };

    /**
     * @property handlers
     * @default {}
     */
    wctx.handlers = {};

    /**
     * Get parent view
     * @method parent
     */
    wctx.parent = function () {
      return ctx.parentView;
    };

    /**
     * Get child views
     * @method children
     */
    wctx.children = function () {
      return ctx.childViews;
    };

    /**
     * Reverse propagation direction of whisper
     */
    wctx.capture = function (message) {
      wctx.on(message, function (message, data, reply) {
        message.stopPropagation();
        wctx.reverseWhisper.apply(wctx, arguments);
      });
    },

    /**
     * Handle a whisper
     * @method receive
     * @param {string} message name
     * @param {object} data contents
     * @param {deferred} reply deferred
     * @param {boolean} reverse directioon
     */
    wctx.receive = function (message, data, reply, reverse) {
      var handlers = wctx.findHandlers(message.name);

      if (handlers && handlers.length) {
        _.each(handlers, function (handler) {
          handler.fn.call(handler.ctx, message, data, reply);
        });
      }

      if (reverse) {
        wctx.reverseWhisper.apply(this, arguments);
        return;
      }

      if (message.propagate) {
        wctx.apply(this, arguments);
      }
    };

    /**
     * Listen for a message
     * @method on
     * @param {string} message name
     * @param {function} handler function
     * @param {object} context to execute handler function
     */
    wctx.on = function (message, handler, context) {
      var handlers = wctx.handlers;

      handlers[message] || (handlers[message] = []);

      handlers[message].push({
        fn  : handler,
        ctx : context || this
      });
    };

    /**
     * Remove all listeners
     * @method off
     */
    wctx.off = function () {
      wctx.handlers = {};
    };

    /**
     * Find handlers for a message
     * @method findHandlers
     * @param {string} message name
     */
    wctx.findHandlers = function (message) {
      return wctx.handlers[message];
    };

  };

})(Backbone, _);
