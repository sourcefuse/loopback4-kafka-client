import {extensionPoint, extensions, Getter, inject} from '@loopback/core';
import {EventsInStream, IConsumer, IStreamDefinition} from '../types';
import {ConsumerExtensionPoint, KafkaClientBindings} from '../keys';
import {Consumer, ConsumerConfig, EachMessagePayload, Kafka} from 'kafkajs';
import {ILogger, LOGGER} from '@sourceloop/core';
import {KafkaErrorKeys} from '../error-keys';

@extensionPoint(ConsumerExtensionPoint.key)
/* It creates a Kafka consumer client, subscribes to the topics,
 and then runs the consumer client */
export class KafkaConsumerService<T extends IStreamDefinition> {
  consumers: Consumer[] = [];
  constructor(
    /* A way to get all the extensions that are registered for a consumer extension point. */
    @extensions()
    private getConsumers: Getter<IConsumer<T, keyof T['messages']>[]>,
    @inject(KafkaClientBindings.KafkaClient)
    private client: Kafka,
    @inject(KafkaClientBindings.ConsumerConfiguration, {optional: true})
    private configuration: ConsumerConfig,
    @inject(LOGGER.LOGGER_INJECT) private readonly logger: ILogger,
  ) {
    if (!configuration) {
      throw Error(KafkaErrorKeys.ConsumerConfigurationMissing);
    }
  }

  async consume(): Promise<void> {
    const kafkaConsumerClient = this.client.consumer(this.configuration);
    this.consumers.push(kafkaConsumerClient);
    await kafkaConsumerClient.connect();
    const consumers = await this.getConsumers();
    const consumerMap = new Map<
      T['topic'],
      Map<EventsInStream<T>, IConsumer<T, EventsInStream<T>>>
    >();
    for (const consumer of consumers) {
      if (!consumer.topic) {
        throw new Error(`${KafkaErrorKeys.ConsumerWithoutTopic}: ${consumer}`);
      }
      if (!consumer.event) {
        throw new Error(
          `${KafkaErrorKeys.ConsumerWithoutEventType}: ${consumer}`,
        );
      }
      await kafkaConsumerClient.subscribe({
        topic: consumer.topic,
      });
      if (consumerMap.has(consumer.topic)) {
        const eventMap = consumerMap.get(consumer.topic);
        eventMap?.set(consumer.event, consumer);
      } else {
        const newMap = new Map<
          EventsInStream<T>,
          IConsumer<T, EventsInStream<T>>
        >();
        newMap.set(consumer.event, consumer);
        consumerMap.set(consumer.topic, newMap);
      }
    }
    /* this function for now, assumes that the events of a particular 
    type could be handled in parallel and would only be ordered by key */
    await kafkaConsumerClient.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const eventMap = consumerMap.get(payload.topic as string);
        if (payload.message.value) {
          const message = JSON.parse(payload.message.value.toString('utf8'));
          const consumer = eventMap?.get(message.event);

          if (consumer) {
            await consumer.handler(message.data);
          } else {
            this.logger.warn(
              `${KafkaErrorKeys.UnhandledEvent}: ${JSON.stringify(payload)}`,
            );
          }
        } else {
          this.logger.warn(
            `${KafkaErrorKeys.EventWithoutValue}: ${JSON.stringify(payload)}`,
          );
        }
      },
    });
    kafkaConsumerClient.on('consumer.connect', event => {
      this.logger.debug(`${event.payload}`);
    });
    kafkaConsumerClient.on('consumer.crash', event => {
      this.logger.debug(`${event.payload}`);
    });
    kafkaConsumerClient.on('consumer.disconnect', event => {
      this.logger.debug(`${event.payload}`);
    });
  }

  async stop() {
    await Promise.all(this.consumers.map(consumer => consumer.disconnect()));
    this.consumers = [];
  }
}
