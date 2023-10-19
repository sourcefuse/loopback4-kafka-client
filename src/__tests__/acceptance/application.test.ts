import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {ILogger} from '@sourceloop/core';
import sinon from 'sinon';
import {KafkaErrorKeys} from '../../error-keys';
import {producerKey} from '../../keys';
import {Producer} from '../../types';
import {KafkaClientStub} from '../stubs';
import {Events} from './fixtures/events.enum';
import {TestStream} from './fixtures/stream';
import {Topics} from './fixtures/topics.enum';
import {
  setupConsumerApplication,
  setupProducerApplication,
} from './test-helper';

describe('end-to-end', () => {
  let consumerApp: Application;
  let producerApp: Application;
  let startHandler: sinon.SinonStub;
  let stopHandler: sinon.SinonStub;
  let commonHandler: sinon.SinonStub;
  let genericHandler: sinon.SinonStub;
  let logger: ILogger;
  const kafkaClient = new KafkaClientStub();
  before(setupApplications);
  after(async () => {
    await consumerApp.stop();
    await producerApp.stop();
  });
  afterEach(() => {
    startHandler.reset();
    stopHandler.reset();
    commonHandler.reset();
    genericHandler.reset();
  });

  describe('Acceptance: event stream with single topic', () => {
    it('should produce and consumer single type of event', async () => {
      const producerInstance = producerApp.getSync<Producer<TestStream>>(
        producerKey(Topics.First),
      );
      const payload = {
        startTime: new Date(),
      };
      await producerInstance.send(Events.start, [payload]);
      sinon.assert.calledOnce(startHandler);
      expect(startHandler.lastCall.args[0]).to.be.deepEqual(
        JSON.parse(JSON.stringify(payload)),
      );
    });

    it('should produce and consumer multiple types of events', async () => {
      const producerInstance = producerApp.getSync<Producer<TestStream>>(
        producerKey(Topics.First),
      );
      const start = {
        startTime: new Date(),
      };
      const stop = {
        stopTime: new Date(),
      };
      await producerInstance.send(Events.start, [start]);
      await producerInstance.send(Events.stop, [stop]);
      sinon.assert.calledOnce(startHandler);
      sinon.assert.calledOnce(stopHandler);
      expect(startHandler.lastCall.args[0]).to.be.deepEqual(
        JSON.parse(JSON.stringify(start)),
      );
      expect(stopHandler.lastCall.args[0]).to.be.deepEqual(
        JSON.parse(JSON.stringify(stop)),
      );
    });

    it('should consume from a common consumer with multiple events for a single topic', async () => {
      const producerInstance = producerApp.getSync<Producer<TestStream>>(
        producerKey(Topics.First),
      );
      const reset = {
        resetTime: new Date(),
      };
      const pause = {
        pauseTime: new Date(),
      };
      await producerInstance.send(Events.reset, [reset]);
      await producerInstance.send(Events.pause, [pause]);
      sinon.assert.called(commonHandler);
      expect(commonHandler.getCalls()[0].args[0]).to.be.deepEqual(
        JSON.parse(JSON.stringify(reset)),
      );
      expect(commonHandler.getCalls()[1].args[0]).to.be.deepEqual(
        JSON.parse(JSON.stringify(pause)),
      );
    });

    it('should consume from a generic consumer without events for a single topic', async () => {
      const producerInstance = producerApp.getSync<Producer<TestStream>>(
        producerKey(Topics.First),
      );
      const close = {
        closeTime: new Date(),
      };
      await producerInstance.send(Events.close, [close]);
      sinon.assert.called(genericHandler);
      expect(genericHandler.getCalls()[0].args[0]).to.be.deepEqual(
        JSON.parse(JSON.stringify(close)),
      );
    });

    it('should not handle an unspecified events', async () => {
      const warnStub = sinon.stub(logger, 'warn');
      const producerInstance = kafkaClient.producer();
      const payload = {
        key: 'unknown',
        value: JSON.stringify({
          field: 'value',
        }),
      };
      await producerInstance.connect();
      producerInstance.send({
        topic: Topics.First,
        messages: [payload],
      });

      sinon.assert.calledOnce(warnStub);
      expect(warnStub.lastCall.args[0]).to.equal(
        `${KafkaErrorKeys.HandleByGenericConsumer}:${undefined}`,
      );
    });
  });

  async function setupApplications() {
    startHandler = sinon.stub().callsFake(() => {});
    stopHandler = sinon.stub().callsFake(() => {});
    commonHandler = sinon.stub().callsFake(() => {});
    genericHandler = sinon.stub().callsFake(() => {});
    logger = {
      warn: e => console.log(e),
      log: e => console.log(e),
      error: e => console.error(e),
      info: e => console.info(e),
      debug: e => console.debug(e),
    };
    consumerApp = await setupConsumerApplication(
      kafkaClient,
      startHandler,
      stopHandler,
      commonHandler,
      genericHandler,
      logger,
    );
    producerApp = await setupProducerApplication(kafkaClient);
  }
});
