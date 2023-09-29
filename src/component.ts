import {
  Application,
  BindingScope,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
  injectable,
} from '@loopback/core';
import {LoggerExtensionComponent} from '@sourceloop/core';
import {Kafka} from 'kafkajs';
import {KafkaClientBindings, producerKey} from './keys';
import {KafkaObserver} from './observers';
import {KafkaProducerFactoryProvider} from './providers';
import {KafkaConsumerService} from './services/kafka-consumer.service';
import {KafkaClientOptions} from './types';

@injectable({
  tags: {[ContextTags.KEY]: KafkaClientBindings.Component},
})
export class KafkaClientComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: Application,
    @config({optional: true})
    configuration?: KafkaClientOptions,
  ) {
    app.component(LoggerExtensionComponent);

    if (configuration?.connection) {
      app
        .bind(KafkaClientBindings.KafkaClient)
        .to(new Kafka(configuration.connection))
        .inScope(BindingScope.SINGLETON);
    }
    app
      .bind(KafkaClientBindings.ProducerFactory)
      .toProvider(KafkaProducerFactoryProvider)
      .inScope(BindingScope.SINGLETON);

    app.service(KafkaConsumerService);

    if (configuration?.topics) {
      const producerFactory = app.getSync(KafkaClientBindings.ProducerFactory);
      configuration.topics.forEach(topic => {
        app
          .bind(producerKey(topic))
          .to(producerFactory(topic))
          .inScope(BindingScope.SINGLETON);
      });
    }
    if (configuration?.initObservers) {
      app.lifeCycleObserver(KafkaObserver);
    }
  }
}
