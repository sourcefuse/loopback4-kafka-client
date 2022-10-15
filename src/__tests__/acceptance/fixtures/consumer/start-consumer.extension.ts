import {injectable} from '@loopback/core';
import {eventHandler} from '../../../../decorators/handler.decorator';
import {asConsumer} from '../../../../keys';
import {IConsumer, StreamHandler} from '../../../../types';
import {Events} from '../events.enum';
import {TestStream} from '../stream';
import {Topics} from '../topics.enum';

@injectable(asConsumer)
export class StartConsumer implements IConsumer<TestStream, Events.start> {
  constructor(
    @eventHandler<TestStream>(Events.start)
    public handler: StreamHandler<TestStream, Events.start>,
  ) {}
  topic: Topics.First = Topics.First;
  event: Events.start = Events.start;
}
