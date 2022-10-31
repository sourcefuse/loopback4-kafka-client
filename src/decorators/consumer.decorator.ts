import {Constructor, injectable} from '@loopback/core';
import {asConsumer} from '../keys';
import {IConsumer, IStreamDefinition} from '../types';

export function consumer<
  T extends IStreamDefinition,
  E extends keyof T['messages'],
>() {
  return injectable(asConsumer) as (
    target: Constructor<IConsumer<T, E>>,
  ) => void;
}
