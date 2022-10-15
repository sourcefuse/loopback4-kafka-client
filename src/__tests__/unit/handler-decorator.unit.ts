import {Reflector} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {eventHandler} from '../../decorators/handler.decorator';
import {eventHandlerKey} from '../../keys';
import {StreamHandler} from '../../types';
import {Events} from '../acceptance/fixtures/events.enum';
import {TestStream} from '../acceptance/fixtures/stream';

describe('unit: Handler Decorator', () => {
  it('should create an injection for specified event handler', () => {
    const inject = eventHandler<TestStream>(Events.start);
    class TestClass {
      constructor(
        @inject
        public testProperty: StreamHandler<TestStream, Events.start>,
      ) {}
    }
    const key = Reflector.getMetadata('inject:parameters', TestClass)[''][0]
      .bindingSelector.key;
    expect(key).to.equal(
      eventHandlerKey<TestStream, Events.start>(Events.start).key,
    );
  });
});
