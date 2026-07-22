import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Public } from '../auth/decorators/public.decorator';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Public()
  @Sse('espacios')
  streamEspacios(): Observable<MessageEvent> {
    return this.sseService.getEventStream().pipe(
      map((event) => ({
        data: JSON.stringify(event),
        type: event.type,
      })),
    );
  }

  @Public()
  @Sse('tickets')
  streamTickets(): Observable<MessageEvent> {
    return this.streamEspacios();
  }
}
