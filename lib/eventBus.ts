import { IEvent, IEventType } from './event';
import { IEventHandlerType } from './eventHandler';
import EventBusManager from './eventBusManager';
import RabbitMQConnection from './rabbitMQConnection';

export interface IEventBus {
  publish(event: IEvent): Promise<void>,
  subscribe(event: IEventType, handler: IEventHandlerType): Promise<void>,
  unsubscribe(event: IEventType): void,
  register(event: IEventType): Promise<any>
}

export default class EventBus implements IEventBus {
  public readonly brokerName: string;
  private _rabbitmq: RabbitMQConnection;
  private _manager: EventBusManager;
  private _logger: any;

  constructor(
    rabbitmq: RabbitMQConnection,
    brokerName: string,
    logger: any
  ) {
    this.brokerName = brokerName;
    this._manager = new EventBusManager();
    this._rabbitmq = rabbitmq;
    this._logger = logger;
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

  async subscribe(event: IEventType, handler: IEventHandlerType): Promise<void> {
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
      const eventHandler: any = this._manager.getHandlerForEvent(event.name);
      new eventHandler().handle(event);
    });

    this._logger.info(`[*] Subscribed handler: ${handler.name} listening ${event.name}`);
  }

  unsubscribe(event: IEventType): void {
    this._manager.removeSubscription(event);

    this._logger.info(`Unsubscribing from event ${event.name}.`)
  }

  async register(event: IEventType): Promise<void> {
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
