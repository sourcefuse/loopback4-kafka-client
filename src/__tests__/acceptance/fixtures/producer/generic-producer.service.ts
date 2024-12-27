import {genericProducer} from '../../../../decorators/generic-producer.decorator';
import {GenericProducer} from '../../../../types';
import {GenericStream} from '../stream';
import {Topics} from '../topics.enum';

export class GenericProducerService {
  constructor(
    @genericProducer(Topics.Generic)
    private producer: GenericProducer<GenericStream>,
  ) {}

  async produceMessage(message: string): Promise<void> {
    await this.producer.send([
      {
        data: message,
      },
    ]);
  }
}
