import {BindingKey, BindingTemplate, extensionFor} from '@loopback/core';
import {Kafka, ProducerConfig} from 'kafkajs';
import {KafkaClientComponent} from './component';
import {KafkaConsumerService} from './services/kafka-consumer.service';
import {
  ConsumerConfig,
  GenericProducer,
  GenericProducerFactoryType,
  IStreamDefinition,
  Producer,
  ProducerFactoryType,
  StreamHandler,
} from './types';

export const KafkaNamespace = 'sourceloop.kafka';
export namespace KafkaClientBindings {
  export const Component = BindingKey.create<KafkaClientComponent>(
    `${KafkaNamespace}.KafkaClientComponent`,
  );
  export const ConsumerService = BindingKey.create<
    KafkaConsumerService<IStreamDefinition>
  >(`${KafkaNamespace}.KafkaConsumerService`);
  export const KafkaClient = BindingKey.create<Kafka>(
    `${KafkaNamespace}.KafkaClient`,
  );
  export const ConsumerConfiguration = BindingKey.create<ConsumerConfig>(
    `${KafkaNamespace}.ConsumerConfig`,
  );
  export const ProducerConfiguration = BindingKey.create<ProducerConfig>(
    `${KafkaNamespace}.ProducerConfig`,
  );
  export const ProducerFactory = BindingKey.create<
    ProducerFactoryType<IStreamDefinition>
  >(`${KafkaNamespace}.ProducerFactory`);
  export const GenericProducerFactor = BindingKey.create<
    GenericProducerFactoryType<IStreamDefinition>
  >(`${KafkaNamespace}.GenericProducerFactory`);
  export const LifeCycleGroup = `${KafkaNamespace}.KAFKA_OBSERVER_GROUP`;
}

export const producerKey = (topic: string) =>
  BindingKey.create<Producer<IStreamDefinition>>(
    `${KafkaNamespace}.producer.${topic}`,
  );

export const genericProducerKey = (topic: string) =>
  BindingKey.create<GenericProducer<IStreamDefinition>>(
    `${KafkaNamespace}.generic.producer.${topic}`,
  );

export const eventHandlerKey = <
  Stream extends IStreamDefinition,
  K extends keyof Stream['messages'],
>(
  event: K,
) =>
  BindingKey.create<StreamHandler<Stream, K>>(
    `${KafkaNamespace}.eventhandler.${event as string}`,
  );

export const ConsumerExtensionPoint = BindingKey.create<
  KafkaConsumerService<never>
>(`${KafkaNamespace}.ConsumerExtensionPoint`);
export const asConsumer: BindingTemplate = binding => {
  extensionFor(ConsumerExtensionPoint.key)(binding);
  binding.tag({namespace: ConsumerExtensionPoint.key});
};
