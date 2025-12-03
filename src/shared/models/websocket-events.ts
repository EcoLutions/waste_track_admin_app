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

export interface ContainerUpdatedFillLevelPayload {
  containerId: string;
  fillLevelPercentage: number;
}

export class ContainerUpdatedEvent extends WebSocketEvent {
  readonly type = 'ContainerUpdated';

  constructor(public readonly payload: ContainerUpdatedFillLevelPayload) {
    super();
  }
}

export type AppWebSocketEvent =
  | WebSocketConnectedEvent
  | WebSocketDisconnectedEvent
  | WebSocketErrorEvent
  | RouteLocationUpdatedEvent
  | ContainerUpdatedEvent;
