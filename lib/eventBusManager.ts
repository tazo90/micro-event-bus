import { Service } from 'typedi';
import { IEvent } from './event';
import { IEventHandler } from './eventHandler';

export interface IEventBusManager {
  isEmpty(): boolean,
  addSubscription(event: IEvent, handler: IEventHandler): void,
  removeSubscription(event: IEvent): void,
  hasSubscriptionForEvent(eventName: string): boolean,
  clear(): void
  getHandlers(),
  getHandlerForEvent(eventName: string): IEventHandler
  getEventByName(eventName: string): IEvent
  getEventKey(event: IEvent): string,
}

@Service('eventBusManager')
export default class EventBusManager implements IEventBusManager {
  private _handlers: Record<string, IEventHandler>;
  private _events: IEvent[];

  constructor() {
    this._handlers = {}
    this._events = []
  }

  public isEmpty(): boolean {
    return Object.keys(this._handlers).length === 0;
  }

  public addSubscription(event: IEvent, handler: IEventHandler): void {

    if (!this._events.includes(event)) {
      this._events.push(event)
    }

    if (!this.hasSubscriptionForEvent(event.name)) {
      this._handlers[event.name] = handler;
    }
  }

  public removeSubscription(event: IEvent): void {
    delete this._handlers[event.name]
    this._events = this._events.filter((e) => e.name !== event.name);
  }

  public hasSubscriptionForEvent(eventName: string): boolean {
    return Object.keys(this._handlers).indexOf(eventName) >= 0
  }

  public clear(): void {
    this._handlers = {}
  }

  public getHandlerForEvent(eventName: string): IEventHandler {
    return this._handlers[eventName]
  }

  public getEventByName(eventName: string): IEvent {
    const event = this._events.find(e => e.name === eventName);

    if (!event) {
      throw new Error(`Event ${eventName} not found!`);
    }

    return event;
  }

  public getEventKey(event: IEvent): string {
    return event.name;
  }

  public getHandlers() {
    return this._handlers;
  }
}
