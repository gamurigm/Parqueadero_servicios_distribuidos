import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { SseService } from './sse.service';
import { map, Observable } from 'rxjs';
import { Public } from '../auth/decorators/public.decorator';

@Controller('sse')
export class SseController {
  constructor(private readonly sseservice: SseService) {}

  @Public()
  @Sse('espacios')
  streamEspacios(): Observable<MessageEvent> {
    return this.sseservice.getEventStream().pipe(
      map((event) => ({
        data: JSON.stringify(event),
        type: event.type,
      })),
    );
  }
}