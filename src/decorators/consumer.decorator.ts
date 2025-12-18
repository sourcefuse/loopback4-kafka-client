import {Constructor, injectable} from '@loopback/core';
import {asConsumer} from '../keys';
import {IConsumer, IStreamDefinition} from '../types';

/**
 * The `consumer` function in TypeScript is a generic function that returns an injectable consumer for
 * a specific stream definition and message type.
 * @returns The `consumer` function is returning a function that takes a target constructor of type
 * `IConsumer<T, E>` and does some operation on it. The specific operation being performed is not clear
 * from the provided code snippet.
 */
export function consumer<
  T extends IStreamDefinition,
  E extends keyof T['messages'],
>() {
  return injectable(asConsumer) as (
    target: Constructor<IConsumer<T, E>>,
  ) => void;
}
