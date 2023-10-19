import {inject, injectable} from '@loopback/core';
import {asConsumer} from '../../../../keys';
import {TestStream} from '../stream';
import {ISharedConsumer, StreamHandler} from '../../../../types';
import {Topics} from '../topics.enum';
import {Events} from '../events.enum';

@injectable(asConsumer)
export class CommonConsumer implements ISharedConsumer<TestStream> {
  constructor(
    @inject('eventHandler.common')
    public handler: StreamHandler<TestStream, Events>,
  ) {}
  topic: Topics.First = Topics.First;
  events = [Events.pause, Events.reset];
}
