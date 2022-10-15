import {inject} from '@loopback/core';
import {eventHandlerKey} from '../keys';
import {IStreamDefinition} from '../types';

export function eventHandler<Stream extends IStreamDefinition>(
  event: keyof Stream['messages'],
) {
  return inject(eventHandlerKey<Stream, typeof event>(event));
}
