/**
 * @venus-library mocha
 * @venus-include ../mocks/backbone.js
 * @venus-include ../../bower_components/underscore/underscore.js
 * @venus-include ../../bower_components/jquery/jquery.js
 * @venus-include ../helpers/TestView.js
 * @venus-code ../../backbone.whisper.js
 */
describe('Backbone.Whisper', function () {
  var view1A, view2A, view2B, view3A, view4A;

  beforeEach(function () {
    view1A = new TestView();
    view2A = new TestView();
    view2B = new TestView();
    view3A = new TestView();
    view4A = new TestView();

    Backbone.Whisper.call(view1A);
    Backbone.Whisper.call(view2A);
    Backbone.Whisper.call(view2B);
    Backbone.Whisper.call(view3A);
    Backbone.Whisper.call(view4A);

    view1A.addChild(view2A);
    view1A.addChild(view2B);
    view2A.addChild(view3A);
    view3A.addChild(view4A);
  });

  it('should bubble up', function (done) {
    view1A.whisper.on('alert-me', function (message, data, reply) {
      expect(data.name).to.be('gralak');
      done();
    });

    view4A.whisper('alert-me', { name: 'gralak' });
  });

  it('should capture and bubble down', function (done) {
    view1A.whisper.capture('alert-you');
    view2B.whisper.on('alert-you', function (message, data, reply) {
      expect(data.age).to.be(30);
      done();
    });

    view4A.whisper('alert-you', { age: 30 });
  });

  it('should send reply', function (done) {
    view1A.whisper.on('alert-me', function (message, data, reply) {
      reply.resolve('my name is X');
    });

    view4A.whisper('alert-me', { name: 'gralak' }).then(function (result) {
      expect(result).to.be('my name is X');
      done();
    });
  });
});
