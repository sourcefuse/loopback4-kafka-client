import {injectable} from '@loopback/core';
import {eventHandler} from '../../../../decorators/handler.decorator';
import {asConsumer} from '../../../../keys';
import {IConsumer, StreamHandler} from '../../../../types';
import {Events} from '../events.enum';
import {TestStream} from '../stream';
import {Topics} from '../topics.enum';

@injectable(asConsumer)
export class StopConsumer implements IConsumer<TestStream, Events.stop> {
  constructor(
    @eventHandler<TestStream>(Events.stop)
    public handler: StreamHandler<TestStream, Events.stop>,
  ) {}
  topic: Topics.First = Topics.First;
  event: Events.stop = Events.stop;
}
