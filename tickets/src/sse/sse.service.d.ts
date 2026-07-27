import { Observable } from 'rxjs';
export interface SseEvent {
    type: string;
    data: any;
}
export declare class SseService {
    private readonly logger;
    private readonly eventSubject;
    getEventStream(): Observable<SseEvent>;
    emitEvent(type: string, data: any): void;
}
