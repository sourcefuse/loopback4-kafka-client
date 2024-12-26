import {inject, injectable} from '@loopback/core';
import {asConsumer} from '../../../../keys';
import {GenericStream} from '../stream';
import {GenericStreamHandler, IGenericConsumer} from '../../../../types';
import {Topics} from '../topics.enum';

@injectable(asConsumer)
export class GenericConsumer implements IGenericConsumer<GenericStream> {
  constructor(
    @inject('eventHandler.generic')
    public handler: GenericStreamHandler<GenericStream>,
  ) {}
  topic: Topics.Generic = Topics.Generic;
}
