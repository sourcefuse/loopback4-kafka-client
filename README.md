# kafka-connector

A Kakfa Client for Loopback4 built on top of [KafkaJS](https://kafka.js.org/).

[![LoopBack](<https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

## Installation

Install KafkaConnectorComponent using `npm`;

```sh
$ [npm install | yarn add] kafka-connector
```

## Basic Use

Configure and load KafkaConnectorComponent in the application constructor
as shown below.

```ts
import {
  KafkaClientBindings,
  KafkaClientComponent,
  KafkaClientOptions,
} from '@local/kafka-connector';
// ...
export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    this.configure<KafkaClientOptions>(KafkaClientBindings.Component).to({
      initObservers: true, // if you want to init consumer lifeCycleObserver
      topics: [Topics.First], // if you want to use producers for given topics
      connection: {
        // refer https://kafka.js.org/docs/configuration
        brokers: [process.env.KAFKA_SERVER ?? ''],
      },
    });
    this.bind(KafkaClientBindings.ProducerConfiguration).to({
      // your producer config
      // refer https://kafka.js.org/docs/producing#options
    });
    this.bind(KafkaClientBindings.ConsumerConfiguration).to({
      // refer https://kafka.js.org/docs/consuming#options
      groupId: process.env.KAFKA_CONSUMER_GROUP,
    });

    this.component(KafkaClientComponent);
    // ...
  }
  // ...
}
```

#### Producer and Consumer

### Stream

Producers and Consumers work on a `Stream` which defines the topic and events used by the application. You can implement the `IStreamDefinition` to create your own stream class.

##### Example

```ts
export class TestStream implements IStreamDefinition {
  topic = Topics.First;
  messages: {
    // [<event type key from enum>] : <event type or interface>
    [Events.start]: StartEvent;
    [Events.stop]: StopEvent;
  };
}
```

### Consumer

A Consumer is a [`loopback extension`](https://loopback.io/doc/en/lb4/Extension-point-and-extensions.html) that is used by the [`KafkaConsumerService`](./src/services/kafka-consumer.service.ts) to initialize consumers. It must implement the `IConsumer` interface and should be using the `asConsumer` binding template. If you want the consumers to start at the start of your application, you should pass the `initObservers` config to the Component configuration.

##### Example

```
// application.ts
this.configure(KafkaConnectorComponentBindings.COMPONENT).to({
  ...
  initObservers: true
  ...
});
```

```
// start.consumer.ts
export class StartConsumer implements IConsumer<TestStream, Events.start> {
  constructor(
    @inject('test.handler.start')
    public handler: StreamHandler<TestStream, Events.start>,
  ) {}
  topic: Topics.First = Topics.First;
  event: Events.start = Events.start;
  // you can write the handler as a method
  handler(payload: StartEvent) {
    console.log(payload);
  }
}
```

If you want to write a shared handler for different events, you can use the `eventHandlerKey` to bind a handler in the application -

```
// application.ts
this.bind(eventHandlerKey(Events.Start)).to((payload: StartEvent) => {
  console.log(payload);
})
this.bind(eventHandlerKey<TestStream, Events.Stop>(Events.Stop)).toProvider(CustomEventHandlerProvider);
```

and then you can use the handler using the `@eventHandler` decorator -

```
// start.consumer.ts
@injectable(asConsumer)
export class StartConsumer implements IConsumer<TestStream, Events.start> {
  constructor(
    @eventHandler<TestStream>(Events.Start)
    public handler: StreamHandler<TestStream, Events.start>,
  ) {}
  topic: Topics.First = Topics.First;
  event: Events.start = Events.start;
}
```

### Producer

A Producer is a loopback service for producing message for a particular topic, you can inject a producer using the `@producer(TOPIC_NAME)` decorator.
Note: The topic name passed to decorator must be first configured in the Component configuration's topic property -

#### Example

```
// application.ts
...
this.configure(KafkaConnectorComponentBindings.COMPONENT).to({
  ...
  topics: [Topics.First],
  ...
});
...
// test.service.ts
...
class TestService {
  constructor(
    @producer(Topics.First)
    private producer: Producer<TestStream>
  ) {}
}
```
