import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {KafkaClientComponent} from '../../../../component';
import {KafkaClientBindings} from '../../../../keys';
import {KafkaClientStub} from '../../../stubs';
import {Topics} from '../topics.enum';

export class ProducerApp extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.configure(KafkaClientBindings.Component).to({
      topics: Object.values(Topics) as string[],
    });
    this.bind<KafkaClientStub>(KafkaClientBindings.KafkaClient).to(
      options.client,
    );
    this.component(KafkaClientComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
