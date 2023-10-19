import {KafkaConfig, ConsumerConfig as KafkajsConsumerConfig} from 'kafkajs';

export interface KafkaClientOptions {
  connection: KafkaConfig;
  topics?: string[];
  initObservers?: boolean;
}

export type ConsumerConfig = {
  alwaysRunGenericConsumer?: boolean;
} & KafkajsConsumerConfig;

/* Defining the interface for the stream definition. */
export interface IStreamDefinition {
  topic: string;
  messages: {};
}

export type TopicForStream<Stream extends IStreamDefinition> = Stream['topic'];
export type EventsInStream<Stream extends IStreamDefinition> =
  keyof Stream['messages'];

export type ConsumerType<
  Stream extends IStreamDefinition,
  K extends EventsInStream<Stream>,
> = IConsumer<Stream, K> | ISharedConsumer<Stream> | IGenericConsumer<Stream>;

export interface IBaseConsumer<Stream extends IStreamDefinition> {
  handler: StreamHandler<Stream, EventsInStream<Stream>>;
}

export interface IConsumer<
  Stream extends IStreamDefinition,
  K extends EventsInStream<Stream>,
> {
  topic: TopicForStream<Stream>;
  event: K;
  handler: StreamHandler<Stream, K>;
}

export interface ISharedConsumer<Stream extends IStreamDefinition> {
  topic: TopicForStream<Stream>;
  events: EventsInStream<Stream>[];
  handler: StreamHandler<Stream, EventsInStream<Stream>>;
}

export interface IGenericConsumer<Stream extends IStreamDefinition> {
  topic: TopicForStream<Stream>;
  handler: StreamHandler<Stream, EventsInStream<Stream>>;
}

export function isGenericConsumer<
  Stream extends IStreamDefinition,
  K extends EventsInStream<Stream>,
>(consumer: ConsumerType<Stream, K>): consumer is IGenericConsumer<Stream> {
  return !(
    (consumer as ISharedConsumer<Stream>).events ||
    (consumer as IConsumer<Stream, K>).event
  );
}

export function isSharedConsumer<
  Stream extends IStreamDefinition,
  K extends EventsInStream<Stream>,
>(consumer: ConsumerType<Stream, K>): consumer is ISharedConsumer<Stream> {
  return !!(consumer as ISharedConsumer<Stream>).events;
}

export function isConsumer<
  Stream extends IStreamDefinition,
  K extends EventsInStream<Stream>,
>(consumer: ConsumerType<Stream, K>): consumer is IConsumer<Stream, K> {
  return !!(consumer as IConsumer<Stream, K>).event;
}

export interface Producer<Stream extends IStreamDefinition> {
  send<Type extends EventsInStream<Stream>>(
    type: Type,
    payload: Stream['messages'][Type][],
    key?: string,
  ): Promise<void>;
}

export type ProducerFactoryType<Stream extends IStreamDefinition> = (
  topic: Stream['topic'],
) => Producer<Stream>;

export type StreamHandler<
  Stream extends IStreamDefinition,
  K extends EventsInStream<Stream>,
> = (payload: Stream['messages'][K]) => Promise<void>;
