import {inject, Provider} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {CompressionTypes, Kafka, ProducerConfig} from 'kafkajs';
import {KafkaErrorKeys} from '../error-keys';
import {GenericProducerFactoryType, IStreamDefinition} from '../types';
import {KafkaClientBindings} from '../keys';

/* The class `GenericKafkaProducerFactoryProvider` is a TypeScript class that provides a factory for creating
Kafka producers to send messages to specified topics without events. */
export class GenericKafkaProducerFactoryProvider<T extends IStreamDefinition>
  implements Provider<GenericProducerFactoryType<T>>
{
  constructor(
    @inject(KafkaClientBindings.KafkaClient)
    private client: Kafka,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @inject(KafkaClientBindings.ProducerConfiguration, {optional: true})
    private configuration?: ProducerConfig,
  ) {}

  value(): GenericProducerFactoryType<T> {
    return (topic: string) => {
      return {
        send: async (payload: T['messages'][], key?: string): Promise<void> => {
          const producer = this.client.producer(this.configuration);

          try {
            await producer.connect();
            await producer.send({
              topic: topic,
              compression: CompressionTypes.GZIP,
              messages: payload.map(message => ({
                key,
                value: JSON.stringify(message),
              })),
            });
            await producer.disconnect();
          } catch (e) {
            this.logger.error(
              `${KafkaErrorKeys.PublishFailed}: ${JSON.stringify(e)}`,
            );
            await producer.disconnect();
            throw e;
          }
        },
      };
    };
  }
}
