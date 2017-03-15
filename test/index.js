'use strict';

const Messenger = require('../');

const assert = require('assert');
const request = new Messenger.Speaker({
  autoConnect: true
});
const response = new Messenger.Listener();
const response2 = new Messenger.Listener();
const response3 = new Messenger.Listener();

describe('shimo-messenger', function () {

  it('Listener should get message and Speaker should get response', function (done) {

    const result = [];

    response.on('TOMTEST', function (message, response) {
      assert.deepEqual(message, {tom: 'test'});
      check(message);
      response({res: 1});
    });

    response2.on('TOMTEST', function (message, response) {
      assert.deepEqual(message, {tom: 'test'});
      check(message);
      response({res: 2});
    });

    response3.on('TOMTEST', function (message, response) {
      assert.deepEqual(message, {tom: 'test'});
      check(message);
      response({res: 3});
    });

    setTimeout(function () {
      request.send('TOMTEST', {tom: 'test'}).then(function (res) {
        res = res.sort((i, j) => i.res - j.res);
        assert.deepEqual(res[0], {res: 1});
        assert.deepEqual(res[1], {res: 2});
        assert.deepEqual(res[2], {res: 3});
        check(res);
      });
    }, 0);

    function check(data) {
      result.push(data);
      if (result.length === 4) {
        done();
      }
    }

  });
});
