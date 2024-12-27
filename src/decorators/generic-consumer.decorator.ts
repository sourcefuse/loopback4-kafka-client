import {Constructor, injectable} from '@loopback/core';
import {asConsumer} from '../keys';
import {IGenericConsumer, IStreamDefinition} from '../types';

export function genericConsumer<T extends IStreamDefinition>() {
  return injectable(asConsumer) as (
    target: Constructor<IGenericConsumer<T>>,
  ) => void;
}
