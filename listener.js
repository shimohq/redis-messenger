'use strict';

const _ = require('lodash');
const Redis = require('ioredis');
const debug = require('debug')('messenger');

class Listener {
  constructor(options) {
    _.assign(this, _.defaults(options || {}, {
      speakerChannel: 'REDIS_SPEAKER',
      listenerChannel: 'REDIS_LISTENER'
    }));

    if (!this.subClient) {
      this.subClient = new Redis();
    }

    if (!this.pubClient) {
      this.pubClient = new Redis();
    }

    this.cbPool = {};
    this.subscribe();
  }

  subscribe() {
    this.subClient.subscribe(this.speakerChannel);
    this.subClient.on('message', (channel, message) => {
      message = JSON.parse(message);

      if (channel !== this.speakerChannel) {
        return;
      }

      const type = message.type || 'general';

      const send = function (sendMessage) {
        const msg = _.pick(message, ['speakerGuid', 'type', 'processGuid']);
        msg.message = sendMessage;
        debug('listener send', this.listenerChannel);
        this.pubClient.publish(this.listenerChannel, JSON.stringify(msg));
      };

      if (this.cbPool[type]) {
        this.cbPool[type].forEach(cb => {
          cb.call(this, message.message, _.bind(send, this));
        });
      } else {
        debug('Listener warning: no listener on type', type);
      }
    });
  }

  on(type, handler) {
    if (typeof type === 'function') {
      handler = type;
      type = 'general';
    }

    this.cbPool[type] = this.cbPool[type] || [];
    this.cbPool[type].push(handler);
  }
}

module.exports = Listener;
