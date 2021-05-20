import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

export interface IEvent {
  id: string,
  creationDate: string,
  name: string,
  toDTO()
}

export default class Event implements IEvent {
  public id: string;
  public name: string;
  private _creationDate;

  constructor() {
    this.id = nanoid();
    this.name = this.constructor.name;
    this._creationDate = dayjs();
  }

  get creationDate(): string {
    return this._creationDate.format()
  }

  toDTO(): Record<string, string> {
    return Object.fromEntries(Object.entries(this))
  }
}