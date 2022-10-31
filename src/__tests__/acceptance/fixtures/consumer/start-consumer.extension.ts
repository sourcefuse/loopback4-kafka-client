import {consumer} from '../../../../decorators';
import {eventHandler} from '../../../../decorators/handler.decorator';
import {StreamHandler} from '../../../../types';
import {Events} from '../events.enum';
import {TestStream} from '../stream';
import {Topics} from '../topics.enum';

@consumer<TestStream, Events.start>()
export class StartConsumer {
  constructor(
    @eventHandler<TestStream>(Events.start)
    public handler: StreamHandler<TestStream, Events.start>,
  ) {}
  topic: Topics.First = Topics.First;
  event: Events.start = Events.start;
}
