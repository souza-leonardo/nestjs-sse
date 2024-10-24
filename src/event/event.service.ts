import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent } from 'rxjs';

@Injectable()
export class EventService implements OnModuleDestroy {
  constructor(protected readonly emitter: EventEmitter2) {}

  subscribe(eventName: string) {
    return fromEvent(this.emitter, eventName);
  }

  async emit(eventName: string, data: any) {
    this.emitter.emit(eventName, { data });
  }

  onModuleDestroy() {
    this.emitter.removeAllListeners();
  }
}