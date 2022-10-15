export enum KafkaErrorKeys {
  ConsumerConfigurationMissing = 'Consumer Configuration Missing',
  ConsumerWithoutTopic = 'Consumer without topic',
  ConsumerWithoutEventType = 'Consumer without event type',
  EventWithoutValue = 'EventWithoutValue',
  UnhandledEvent = 'Unhandled Event',
  PublishFailed = 'Publish Failed',
}
