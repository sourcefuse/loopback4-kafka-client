import {Application} from '@loopback/core';
import {givenHttpServerConfig} from '@loopback/testlab';
import {ILogger, LOGGER} from '@sourceloop/core';
import {eventHandlerKey} from '../../keys';
import {StreamHandler} from '../../types';
import {KafkaClientStub} from '../stubs';
import {ConsumerApp} from './fixtures/consumer/consumer-app';
import {Events} from './fixtures/events.enum';
import {ProducerApp} from './fixtures/producer/producer-app';
import {TestStream} from './fixtures/stream';

export async function setupConsumerApplication(
  kafkaStub: KafkaClientStub,
  startHandler: StreamHandler<TestStream, Events.start>,
  stopHandler: StreamHandler<TestStream, Events.stop>,
  logger: ILogger,
): Promise<Application> {
  const restConfig = givenHttpServerConfig({});
  setUpEnv();

  const app = new ConsumerApp({
    rest: restConfig,
    client: kafkaStub,
  });

  app
    .bind(eventHandlerKey<TestStream, Events.start>(Events.start))
    .to(startHandler);
  app
    .bind(eventHandlerKey<TestStream, Events.stop>(Events.stop))
    .to(stopHandler);
  app.bind(LOGGER.LOGGER_INJECT).to(logger);
  await app.boot();
  await app.start();

  return app;
}

export async function setupProducerApplication(
  kafkaStub: KafkaClientStub,
): Promise<Application> {
  const restConfig = givenHttpServerConfig({});
  setUpEnv();

  const app = new ProducerApp({
    rest: restConfig,
    client: kafkaStub,
  });

  await app.boot();
  await app.start();

  return app;
}

function setUpEnv() {
  process.env.NODE_ENV = 'test';
  process.env.ENABLE_TRACING = '0';
  process.env.ENABLE_OBF = '0';
}
