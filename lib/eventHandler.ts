import { IEvent } from './event';

export interface IEventHandler {
  handle(event: IEvent)
}
