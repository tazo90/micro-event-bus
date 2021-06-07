import { Inject, Service } from 'typedi';
import amqp from 'amqplib';

@Service('rabbitmq')
export default class RabbitMQConnection {
  public connection;
  public eventBusUrl: string;

  constructor(
    @Inject('logger') private _logger,
    eventBusUrl: string
  ) {
    this.connection = this.connect();
    this.eventBusUrl = eventBusUrl;
  }

  async connect() {
    const connection = await amqp.connect(this.eventBusUrl);
    this._logger.info('RabbitMQ client acquired a persistent connection to server');
    return connection;
  }

}