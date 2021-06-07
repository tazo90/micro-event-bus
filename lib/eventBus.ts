import { Inject, Service } from 'typedi';
import { IEvent } from './event';
import { IEventHandler } from './eventHandler';

export interface IEventBus {
  publish(event: IEvent): Promise<void>,
  subscribe(event: IEvent, handler: IEventHandler): Promise<void>,
  unsubscribe(event: IEvent): void,
  register(event: any): Promise<any>
}

@Service('eventBus')
export default class EventBus implements IEventBus {
  private brokerName: string;

  constructor(
    @Inject('eventBusManager') private _manager,
    @Inject('logger') private _logger,
    @Inject('rabbitmq') private _rabbitmq,
    brokerName: string
  ) {
    this.brokerName = brokerName;
  }

  async publish(event: IEvent): Promise<void> {
    const connection = await this._rabbitmq.connection;
    const channel = await connection.createConfirmChannel();
    const data = event.toDTO();
    const queue = `${this.brokerName}.${event.name}`;

    channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(data), 'utf-8'),
      { persistent: true },
      (err, ok) => {
        if (err) {
          this._logger.error(`Could not publish event ${event.name} ${event.id} (${err})`);
        }
        this._logger.info(`[*] Published event: ${event.name} ${event.id}`);
      })
  }

  async subscribe(event: IEvent, handler: IEventHandler): Promise<void> {
    this._manager.addSubscription(event, handler);

    const connection = await this._rabbitmq.connection;
    const channel = await connection.createChannel();
    await channel.prefetch(1);
    const queue = `${this.brokerName}.${event.name}`;

    await channel.consume(queue, async (message: any) => {
      // parse message
      const messagetBody = message.content.toString();
      const event = JSON.parse(messagetBody);

      // ack message as received
      await channel.ack(message);

      // run handler for event
      const eventHandler = this._manager.getHandlerForEvent(event.name);
      new eventHandler().handle(event);
    });

    this._logger.info(`[*] Subscribed event: ${event.name}`);
  }

  unsubscribe(event: IEvent): void {
    this._manager.removeSubscription(event);

    this._logger.info(`Unsubscribing from event ${event.name}.`)
  }

  async register(event: IEvent): Promise<void> {
    const connection = await this._rabbitmq.connection;
    const channel = await connection.createChannel();

    const exchange = this.brokerName;
    const routingKey = `${exchange}.${event.name}`;

    await channel.assertExchange(exchange, "direct", { durable: true });
    await channel.assertQueue(routingKey, { durable: true });
    await channel.bindQueue(routingKey, exchange, '')

    this._logger.info(`[*] Registered event: ${event.name}`);
  }
}
