import { Injectable } from '@angular/core';
import { Client, StompSubscription, IMessage } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventBusService } from './event-bus.service';
import {
  WebSocketConnectedEvent,
  WebSocketDisconnectedEvent,
  WebSocketErrorEvent,
  RouteLocationUpdatedEvent,
  RouteCurrentLocationUpdatedPayload
} from '../models/websocket-events';

export enum WebSocketConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private subscriptions = new Map<string, StompSubscription>();
  private reconnectTimer: any = null;

  private statusSubject = new BehaviorSubject<WebSocketConnectionStatus>(WebSocketConnectionStatus.DISCONNECTED);

  constructor(private eventBus: EventBusService) {
    console.log('[WebSocket] Service initialized');
  }

  get status$(): Observable<WebSocketConnectionStatus> {
    return this.statusSubject.asObservable();
  }

  get status(): WebSocketConnectionStatus {
    return this.statusSubject.value;
  }

  connect(brokerURL: string): void {
    if (this.status === WebSocketConnectionStatus.CONNECTED) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.updateStatus(WebSocketConnectionStatus.CONNECTING);
    console.log('[WebSocket] Connecting to:', brokerURL);

    try {
      this.client = new Client({
        brokerURL,

        onConnect: () => this.onConnect(),
        onDisconnect: () => this.onDisconnect(),
        onStompError: (frame) => this.onStompError(frame),
        onWebSocketError: (event) => this.onWebSocketError(event),

        debug: (str) => {
          if (str.includes('MESSAGE') ||
            str.includes('SUBSCRIBE') ||
            str.includes('Received data') ||
            str.includes('location')) {
            console.log('[WebSocket] 🔍 DEBUG:', str);
          }
        },

        heartbeatIncoming: 30000,
        heartbeatOutgoing: 30000,

        reconnectDelay: 5000
      });

      this.client.activate();
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.updateStatus(WebSocketConnectionStatus.ERROR);
      this.eventBus.emit(new WebSocketErrorEvent(String(error)));
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.clearAllSubscriptions();

    if (this.client) {
      this.client.deactivate().then();
      this.client = null;
    }

    this.updateStatus(WebSocketConnectionStatus.DISCONNECTED);
    console.log('[WebSocket] Disconnected');
  }

  subscribeToRouteLocation(routeId: string): void {
    if (this.status !== WebSocketConnectionStatus.CONNECTED) {
      console.warn('[WebSocket] Cannot subscribe, not connected');
      return;
    }

    const destination = `/topic/routes/${routeId}/location`;
    const subscriptionKey = `route_location_${routeId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      console.log('[WebSocket] Already subscribed to:', destination);
      return;
    }

    try {
      const subscription = this.client!.subscribe(
        destination,
        (message: IMessage) => {
          console.log('[WebSocket]  RAW MESSAGE RECEIVED on', destination);
          console.log('[WebSocket]  Message headers:', message.headers);
          console.log('[WebSocket]  Message body:', message.body);
          this.handleRouteLocationUpdate(message);
        }
      );

      this.subscriptions.set(subscriptionKey, subscription);
      console.log('[WebSocket] Successfully subscribed to:', destination);
      console.log('[WebSocket] Total active subscriptions:', this.subscriptions.size);
    } catch (error) {
      console.error('[WebSocket] Error subscribing:', error);
      this.eventBus.emit(new WebSocketErrorEvent(String(error)));
    }
  }

  unsubscribeFromRouteLocation(routeId: string): void {
    const subscriptionKey = `route_location_${routeId}`;
    const subscription = this.subscriptions.get(subscriptionKey);

    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
      console.log('[WebSocket] Unsubscribed from route:', routeId);
    }
  }

  private handleRouteLocationUpdate(message: IMessage): void {
    try {
      //console.log('[WebSocket] 📍 Route location update received');
      //console.log('[WebSocket] Message body:', message.body);

      if (!message.body) {
        console.warn('[WebSocket] Message body is empty');
        return;
      }

      const payload: RouteCurrentLocationUpdatedPayload = JSON.parse(message.body);
      //console.log('[WebSocket] Parsed payload:', payload);

      // Emitir evento al EventBus
      const event = new RouteLocationUpdatedEvent(payload);
      this.eventBus.emit(event);

      //console.log('[WebSocket] RouteLocationUpdatedEvent emitted');
    } catch (error) {
      console.error('[WebSocket] Error handling route location update:', error);
      this.eventBus.emit(new WebSocketErrorEvent(String(error)));
    }
  }

  private onConnect(): void {
    console.log('[WebSocket] Connected');
    this.updateStatus(WebSocketConnectionStatus.CONNECTED);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.eventBus.emit(new WebSocketConnectedEvent());
  }

  private onDisconnect(): void {
    console.log('[WebSocket]  Disconnected');
    this.updateStatus(WebSocketConnectionStatus.DISCONNECTED);
    this.clearAllSubscriptions();
    this.scheduleReconnect();

    this.eventBus.emit(new WebSocketDisconnectedEvent());
  }

  private onStompError(frame: any): void {
    console.error('[WebSocket] STOMP Error:', frame);
    this.updateStatus(WebSocketConnectionStatus.ERROR);

    const errorMessage = frame.headers?.message || 'Unknown STOMP error';
    this.eventBus.emit(new WebSocketErrorEvent(errorMessage));
  }

  private onWebSocketError(event: any): void {
    console.error('[WebSocket] WebSocket Error:', event);
    this.updateStatus(WebSocketConnectionStatus.ERROR);

    this.eventBus.emit(new WebSocketErrorEvent(String(event)));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.updateStatus(WebSocketConnectionStatus.RECONNECTING);
    console.log('[WebSocket] Scheduling reconnect in 5 seconds...');

    this.reconnectTimer = setTimeout(() => {
      console.log('[WebSocket] Attempting to reconnect...');
      this.reconnectTimer = null;
    }, 5000);
  }

  private updateStatus(status: WebSocketConnectionStatus): void {
    this.statusSubject.next(status);
    console.log('[WebSocket] Status changed to:', status);
  }

  private clearAllSubscriptions(): void {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
      console.log('[WebSocket] Unsubscribed from:', key);
    });
    this.subscriptions.clear();
  }

  dispose(): void {
    this.disconnect();
    this.statusSubject.complete();
  }
}
