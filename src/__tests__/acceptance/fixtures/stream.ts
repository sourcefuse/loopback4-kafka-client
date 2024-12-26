import {IStreamDefinition} from '../../../types';
import {Events} from './events.enum';
import {Topics} from './topics.enum';
import {StartEvent, StopEvent} from './types';

export interface TestStream extends IStreamDefinition {
  topic: Topics.First;
  messages: {
    [Events.start]: StartEvent;
    [Events.stop]: StopEvent;
    [Events.reset]: {};
    [Events.pause]: {};
    [Events.close]: {};
  };
}

export interface GenericStream extends IStreamDefinition {
  topic: Topics.Generic;
  messages: {
    [Events.close]: {};
  };
}
