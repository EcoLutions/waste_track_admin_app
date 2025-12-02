import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {AppWebSocketEvent} from '../models/websocket-events';


@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubject = new Subject<AppWebSocketEvent>();


  get events$(): Observable<AppWebSocketEvent> {
    return this.eventSubject.asObservable();
  }

  emit(event: AppWebSocketEvent): void {
    console.log('[EventBus] Emitting:', event.type, event);
    this.eventSubject.next(event);
  }

  on<T extends AppWebSocketEvent>(
    eventType: new (...args: any[]) => T
  ): Observable<T> {
    return this.eventSubject.asObservable().pipe(
      filter((event): event is T => event instanceof eventType)
    );
  }

  dispose(): void {
    this.eventSubject.complete();
  }
}
