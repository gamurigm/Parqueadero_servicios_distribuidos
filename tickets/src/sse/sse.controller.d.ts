import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService } from './sse.service';
export declare class SseController {
    private readonly sseService;
    constructor(sseService: SseService);
    streamEspacios(): Observable<MessageEvent>;
    streamTickets(): Observable<MessageEvent>;
}
