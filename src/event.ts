import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

export interface IEvent {
  id: string,
  creationDate: string,
  name: string,
  toDTO()
}

export default class Event implements IEvent {
  public readonly id: string;
  public readonly name: string;
  public readonly creationDate: string;

  constructor() {
    this.id = nanoid();
    this.name = this.constructor.name;
    this.creationDate = dayjs().format();
  }

  toDTO(): Record<string, string> {
    return Object.fromEntries(Object.entries(this));
  }
}
