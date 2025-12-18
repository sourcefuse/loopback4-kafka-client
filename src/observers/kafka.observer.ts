import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  service,
} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {KafkaConsumerService} from '../services/kafka-consumer.service';
import {IStreamDefinition} from '../types';

/* It's a LifeCycleObserver that starts the KafkaConsumerService
 when the application starts and stops
it when the application stops */
@lifeCycleObserver()
export class KafkaObserver<
  T extends IStreamDefinition,
> implements LifeCycleObserver {
  constructor(
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @service(KafkaConsumerService) private consumer: KafkaConsumerService<T>,
  ) {}

  async start(): Promise<void> {
    await this.consumer.consume();
    this.logger.debug('Kafka Observer has started.');
  }

  async stop(): Promise<void> {
    await this.consumer.stop();
    this.logger.debug('Kafka Observer has stopped!');
  }
}
