import {extensionPoint, extensions, Getter, inject} from '@loopback/core';
import {
  ConsumerType,
  EventsInStream,
  IBaseConsumer,
  IGenericConsumer,
  isSharedConsumer,
  isConsumer,
  IStreamDefinition,
  ConsumerConfig,
} from '../types';
import {ConsumerExtensionPoint, KafkaClientBindings} from '../keys';
import {Consumer, EachMessagePayload, Kafka} from 'kafkajs';
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
    private getConsumers: Getter<ConsumerType<T, keyof T['messages']>[]>,
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

    const {consumerMap, genericConsumerMap} = await this.buildConsumerMaps();
    const topics: string[] = Array.from(consumerMap.keys());

    await kafkaConsumerClient.subscribe({
      topics,
    });
    await kafkaConsumerClient.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const eventMap = consumerMap.get(payload.topic as string);
        const genericConsumer = genericConsumerMap.get(payload.topic as string);
        if (payload.message.value) {
          const message = JSON.parse(payload.message.value.toString('utf8'));
          const consumer = eventMap?.get(message.event);

          if (consumer) {
            await consumer.handler(message.data);
          } else if (!genericConsumer) {
            this.logger.warn(
              `${KafkaErrorKeys.UnhandledEvent}: ${JSON.stringify(
                payload,
              )} with event: ${message.event}}`,
            );
          } else {
            this.logger.warn(
              `${KafkaErrorKeys.HandleByGenericConsumer}:${message.event}`,
            );
          }
          if (
            (!consumer || this.configuration.alwaysRunGenericConsumer) &&
            genericConsumer
          ) {
            await genericConsumer.handler(message.data);
          }
        } else {
          this.logger.warn(
            `${KafkaErrorKeys.EventWithoutValue}: ${JSON.stringify(payload)}`,
          );
        }
      },
    });
    this.setupConsumerEventHandlers(kafkaConsumerClient);
  }

  private async buildConsumerMaps(): Promise<{
    consumerMap: Map<T['topic'], Map<EventsInStream<T>, IBaseConsumer<T>>>;
    genericConsumerMap: Map<T['topic'], IGenericConsumer<T>>;
  }> {
    const consumerMap = new Map<
      T['topic'],
      Map<EventsInStream<T>, IBaseConsumer<T>>
    >();
    const genericConsumerMap = new Map<T['topic'], IGenericConsumer<T>>();

    const consumers = await this.getConsumers();
    for (const consumer of consumers) {
      if (!consumer.topic) {
        throw new Error(`${KafkaErrorKeys.ConsumerWithoutTopic}: ${consumer}`);
      }

      const topic = consumer.topic;
      if (isSharedConsumer(consumer)) {
        const eventMap =
          consumerMap.get(topic) ??
          new Map<EventsInStream<T>, IBaseConsumer<T>>();
        consumer.events.forEach(event => {
          eventMap.set(event, consumer);
        });
        consumerMap.set(topic, eventMap);
      } else if (isConsumer(consumer)) {
        const eventMap =
          consumerMap.get(topic) ??
          new Map<EventsInStream<T>, IBaseConsumer<T>>();
        eventMap.set(consumer.event, consumer);
        consumerMap.set(topic, eventMap);
      } else {
        if (genericConsumerMap.has(topic)) {
          throw new Error(
            `${KafkaErrorKeys.MultipleGenericConsumers}: ${topic}`,
          );
        }
        genericConsumerMap.set(topic, consumer);
      }
    }

    return {consumerMap, genericConsumerMap};
  }

  private setupConsumerEventHandlers(kafkaConsumerClient: Consumer) {
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
