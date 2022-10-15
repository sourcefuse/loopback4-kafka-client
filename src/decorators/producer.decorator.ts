import {inject} from '@loopback/core';
import {producerKey} from '../keys';

export function producer(topic: string) {
  return inject(producerKey(topic));
}
