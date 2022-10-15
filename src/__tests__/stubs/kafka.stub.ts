import {AnyObject} from '@loopback/repository';

type FakeConsumer = {
  topics: string[];
  handler?: (message: AnyObject) => void;
};
export class KafkaClientStub {
  subscribers: {
    [id: string]: FakeConsumer;
  } = {};

  producer() {
    return {
      async connect() {},
      async disconnect() {},
      send: (params: {
        topic: string;
        messages: {
          key: string;
          value: string;
        }[];
      }) => {
        Object.entries(this.subscribers).forEach(([id, fakeConsumer]) => {
          if (fakeConsumer.topics.includes(params.topic)) {
            params.messages.forEach(message => {
              if (fakeConsumer.handler) {
                fakeConsumer.handler({
                  topic: params.topic,
                  message: message,
                });
              }
            });
          }
        });
      },
    };
  }
  consumer() {
    const id = randomId();
    return {
      id,
      connect: async () => {
        this.subscribers[id] = {
          topics: [],
        };
      },
      disconnect: async () => {
        delete this.subscribers[id];
      },
      subscribe: async (params: {topic: string}) => {
        this.subscribers[id].topics.push(params.topic);
      },
      run: async (params: {eachMessage: (message: AnyObject) => void}) => {
        this.subscribers[id].handler = params.eachMessage;
      },
      on: (event: string, handler: () => void) => {},
    };
  }
}

function randomId() {
  return Math.ceil(Math.random() * 100000); //NOSONAR
}
