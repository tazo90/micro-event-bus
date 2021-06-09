import { IEvent } from './event';

export interface IEventHandlerType {
  name: string;
}

export interface IEventHandler {
  handle(event: IEvent)
}
