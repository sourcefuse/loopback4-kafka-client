import {Reflector} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {asConsumer} from '../../keys';
import {StartConsumer} from '../acceptance/fixtures/consumer/start-consumer.extension';

describe('unit: Consumer Decorator', () => {
  it('should mark a service as a consumer extension', () => {
    const key = Reflector.getOwnMetadata('binding.metadata', StartConsumer);
    expect(key.templates[1]).to.equal(asConsumer);
  });
});
