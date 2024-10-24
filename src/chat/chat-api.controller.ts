import { EventService } from "@backend/event/event.service";
import { Controller, Sse } from "@nestjs/common";
import { interval, map, merge, Observable, race, Subject, takeUntil, timer } from "rxjs";

@Controller('api/chat')
export class ChatApiController
{
  private disconnect = new Subject<void>();

  constructor (protected readonly eventService: EventService) {}

  @Sse('new-chat/sse')
  newChatStreamMessages(): Observable<unknown> {
    return this.eventService
      .subscribe('new-chat')
      .pipe(takeUntil(this.disconnect));
  }

  @Sse('not-read/sse')
  notReadStreamMessages(): Observable<unknown> {
    const eventStream = this.eventService.subscribe('chat-not-read');

    const keepAlive = interval(30000).pipe(
      map(() => ({ data: { message: 'keep-alive' } })),
    );

    const timeout = timer(1800000).pipe(
      map(() => ({ data: { message: 'timeout' } })),
    );

    return race(
      merge(eventStream, keepAlive).pipe(
        takeUntil(timeout),
        takeUntil(this.disconnect),
      ),
      timeout,
    );
  }
}