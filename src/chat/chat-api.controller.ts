import { EventService } from "@backend/event/event.service";
import { Controller, Sse } from "@nestjs/common";
import { interval, map, merge, Observable, race, Subject, takeUntil, timer } from "rxjs";

@Controller('api/chat')
export class ChatApiController
{
  private disconnect = new Subject<void>();

  constructor (protected readonly eventService: EventService) {}

  /**
   * Here we use the .pipe(takeUntil()) to guarantee that the connection
   * will be closed after the client disconnect
   */
  @Sse('new-chat/sse')
  newChatStreamMessages(): Observable<unknown> {
    return this.eventService
      .subscribe('new-chat')
      .pipe(takeUntil(this.disconnect));
  }

  /**
   * SSE uses the HTTP Connection: keep-alive header to keep the connection open.
   * However, HTTP/2 doesn't support this header anymore.
   * So in this function, I implemented a logic to keep this connection open for at least 30 minutes
   * After that, the connection will automatic close and SSE will reconect to this route
   * We also implemented the .pipe(takeUntil()) to close the connection if the client disconnected
   */
  @Sse('not-read/sse')
  notReadStreamMessages(): Observable<unknown> {
    const eventStream = this.eventService.subscribe('chat-not-read');

    // one keep-alive message every 30 seconds
    const keepAlive = interval(30000).pipe(
      map(() => ({ data: { message: 'keep-alive' } })),
    );

    // closing connection after 30 minutes, SSE will reconnect automatically
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