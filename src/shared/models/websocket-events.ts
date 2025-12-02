export abstract class WebSocketEvent {
  abstract readonly type: string;
}

export class WebSocketConnectedEvent extends WebSocketEvent {
  readonly type = 'WebSocketConnected';
}

export class WebSocketDisconnectedEvent extends WebSocketEvent {
  readonly type = 'WebSocketDisconnected';
}

export class WebSocketErrorEvent extends WebSocketEvent {
  readonly type = 'WebSocketError';

  constructor(public readonly error: string) {
    super();
  }
}

export interface RouteCurrentLocationUpdatedPayload {
  routeId: string;
  latitude: string;
  longitude: string;
  timestamp: string;
  status: string;
  remainingWaypoints: number;
  estimatedCompletionTime: string | null;
}

export class RouteLocationUpdatedEvent extends WebSocketEvent {
  readonly type = 'RouteLocationUpdated';

  constructor(public readonly payload: RouteCurrentLocationUpdatedPayload) {
    super();
  }
}

export type AppWebSocketEvent =
  | WebSocketConnectedEvent
  | WebSocketDisconnectedEvent
  | WebSocketErrorEvent
  | RouteLocationUpdatedEvent;
