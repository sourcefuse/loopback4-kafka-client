import {inject} from '@loopback/core';
import {genericProducerKey} from '../keys';

export function genericProducer(topic: string) {
  return inject(genericProducerKey(topic));
}
