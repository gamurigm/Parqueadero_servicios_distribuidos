import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export interface SseEvent {
  type: string;
  data: any;
}

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private readonly eventSubject = new Subject<SseEvent>();

  getEventStream(): Observable<SseEvent> {
    return this.eventSubject.asObservable();
  }

  emitEvent(type: string, data: any): void {
    this.logger.log(`Emitiendo evento SSE: ${type}`);
    this.eventSubject.next({ type, data });
  }
}
