import {KafkaConfig} from 'kafkajs';

export interface KafkaClientOptions {
  connection: KafkaConfig;
  topics?: string[];
  initObservers?: boolean;
}

/* Defining the interface for the stream definition. */
export interface IStreamDefinition {
  topic: string;
  messages: {};
}

export type TopicForStream<Stream extends IStreamDefinition> = Stream['topic'];
export type EventsInStream<Stream extends IStreamDefinition> =
  keyof Stream['messages'];

export interface IConsumer<
  Stream extends IStreamDefinition,
  K extends EventsInStream<Stream>,
> {
  topic: TopicForStream<Stream>;
  event: K;
  handler: StreamHandler<Stream, K>;
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
