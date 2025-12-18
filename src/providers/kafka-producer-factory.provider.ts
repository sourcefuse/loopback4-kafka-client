import {inject, Provider} from '@loopback/core';
import {ILogger, LOGGER} from '@sourceloop/core';
import {CompressionTypes, Kafka, ProducerConfig} from 'kafkajs';
import {KafkaErrorKeys} from '../error-keys';
import {KafkaClientBindings} from '../keys';
import {IStreamDefinition, ProducerFactoryType} from '../types';

/* It's a factory provider that creates a producer factory
 that creates a producer that sends messages
to a topic */
export class KafkaProducerFactoryProvider<
  T extends IStreamDefinition,
> implements Provider<ProducerFactoryType<T>> {
  constructor(
    @inject(KafkaClientBindings.KafkaClient)
    private client: Kafka,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
    @inject(KafkaClientBindings.ProducerConfiguration, {optional: true})
    private configuration?: ProducerConfig,
  ) {}

  value(): ProducerFactoryType<T> {
    return (topic: string) => {
      return {
        send: async <Type extends keyof T['messages']>(
          type: Type,
          payload: T['messages'][Type][],
          key?: string,
        ): Promise<void> => {
          const producer = this.client.producer(this.configuration);

          try {
            await producer.connect();
            await producer.send({
              topic: topic,
              compression: CompressionTypes.GZIP,
              messages: payload.map(message => ({
                key,
                value: JSON.stringify({
                  event: type,
                  data: message,
                }),
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
