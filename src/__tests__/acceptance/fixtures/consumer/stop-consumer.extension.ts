import {consumer} from '../../../../decorators';
import {eventHandler} from '../../../../decorators/handler.decorator';
import {IConsumer, StreamHandler} from '../../../../types';
import {Events} from '../events.enum';
import {TestStream} from '../stream';
import {Topics} from '../topics.enum';

@consumer<TestStream, Events.stop>()
export class StopConsumer implements IConsumer<TestStream, Events.stop> {
  constructor(
    @eventHandler<TestStream>(Events.stop)
    public handler: StreamHandler<TestStream, Events.stop>,
  ) {}
  topic: Topics.First = Topics.First;
  event: Events.stop = Events.stop;
}
