import {Reflector} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {producer} from '../../decorators/producer.decorator';
import {producerKey} from '../../keys';
import {Producer} from '../../types';
import {TestStream} from '../acceptance/fixtures/stream';
import {Topics} from '../acceptance/fixtures/topics.enum';

describe('unit: Producer Decorator', () => {
  it('should create an injection for specified topic', () => {
    const inject = producer(Topics.First);
    class TestClass {
      constructor(
        @inject
        public testProperty: Producer<TestStream>,
      ) {}
    }
    const key = Reflector.getMetadata('inject:parameters', TestClass)[''][0]
      .bindingSelector.key;
    expect(key).to.equal(producerKey(Topics.First).key);
  });
});
