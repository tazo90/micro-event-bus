import amqp from 'amqplib';

export default class RabbitMQConnection {
  public connection;
  public eventBusUrl: string;

  constructor(eventBusUrl: string) {
    this.eventBusUrl = eventBusUrl;
    this.connection = this.connect();
  }

  async connect() {
    return await amqp.connect(this.eventBusUrl);
  }
}