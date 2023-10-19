import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {KafkaClientComponent} from '../../../../component';
import {KafkaClientBindings} from '../../../../keys';
import {KafkaClientStub} from '../../../stubs';
import {StartConsumer} from './start-consumer.extension';
import {StopConsumer} from './stop-consumer.extension';
import {CommonConsumer} from './shared-consumer.extension';
import {GenericConsumer} from './generic-consumer.extension';

export class ConsumerApp extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.configure(KafkaClientBindings.Component).to({
      initObservers: true,
    });
    this.bind<KafkaClientStub>(KafkaClientBindings.KafkaClient).to(
      options.client,
    );
    this.bind<Object>(KafkaClientBindings.ConsumerConfiguration).to({});

    this.component(KafkaClientComponent);
    this.service(StartConsumer);
    this.service(StopConsumer);
    this.service(CommonConsumer);
    this.service(GenericConsumer);

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
