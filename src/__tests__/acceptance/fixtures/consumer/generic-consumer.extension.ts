import {inject, injectable} from '@loopback/core';
import {asConsumer} from '../../../../keys';
import {TestStream} from '../stream';
import {IGenericConsumer, StreamHandler} from '../../../../types';
import {Topics} from '../topics.enum';
import {Events} from '../events.enum';

@injectable(asConsumer)
export class GenericConsumer implements IGenericConsumer<TestStream> {
  constructor(
    @inject('eventHandler.generic')
    public handler: StreamHandler<TestStream, Events>,
  ) {}
  topic: Topics.First = Topics.First;
}
