# Communication Hub Frontend Types

Este directorio contiene todos los tipos TypeScript necesarios para integrar el módulo de comunicación y notificaciones en el frontend de Angular.

## 📁 Estructura de Archivos

### DTOs de Request (Peticiones al Backend)
- `create-delivery-attempt-request.type.ts` - Para crear intentos de entrega
- `create-message-template-request.type.ts` - Para crear plantillas de mensajes
- `create-notification-request.type.ts` - Para crear solicitudes de notificación
- `update-delivery-attempt-request.type.ts` - Para actualizar intentos de entrega
- `update-message-template-request.type.ts` - Para actualizar plantillas
- `update-notification-request.type.ts` - Para actualizar solicitudes

### DTOs de Response (Respuestas del Backend)
- `delivery-attempt-response.type.ts` - Información de intentos de entrega
- `message-template-response.type.ts` - Información de plantillas de mensajes
- `notification-request-response.type.ts` - Información de solicitudes de notificación

### Entidades de Dominio
- `delivery-attempt.entity.ts` - Entidad DeliveryAttempt para frontend
- `message-template.entity.ts` - Entidad MessageTemplate para frontend
- `notification-request.entity.ts` - Entidad NotificationRequest para frontend

### Enums
- `notification-channel.enum.ts` - Canales: EMAIL, SMS, PUSH
- `notification-priority.enum.ts` - Prioridades: LOW, NORMAL, HIGH, URGENT
- `request-status.enum.ts` - Estados: PENDING, SENT, FAILED, EXPIRED
- `attempt-status.enum.ts` - Estados: PENDING, DELIVERED, FAILED, BOUNCED
- `message-type.enum.ts` - Tipos de mensaje del sistema
- `template-category.enum.ts` - Categorías de plantillas
- `source-context.enum.ts` - Contextos de origen de notificaciones

## 🚀 Uso Básico

### 1. Importar los tipos necesarios

```typescript
import { CreateNotificationRequest } from './communication-hub-frontend-types/create-notification-request.type';
import { NotificationRequestResponse } from './communication-hub-frontend-types/notification-request-response.type';
import { NotificationRequestEntity } from './communication-hub-frontend-types/notification-request.entity';
import { NotificationChannelEnum, NotificationPriorityEnum } from './communication-hub-frontend-types/notification-channel.enum';
```

### 2. Ejemplo de uso en un servicio

```typescript
@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'notification-requests';
  }

  create(notificationData: CreateNotificationRequest): Observable<NotificationRequestResponse> {
    return this.http.post<NotificationRequestResponse>(
      this.resourcePath(),
      notificationData,
      this.httpOptions
    );
  }

  sendNotification(requestId: string): Observable<NotificationRequestResponse> {
    return this.http.post<NotificationRequestResponse>(
      `${this.resourcePath()}/${requestId}/send`,
      {},
      this.httpOptions
    );
  }

  getPendingNotifications(): Observable<NotificationRequestResponse[]> {
    return this.http.get<NotificationRequestResponse[]>(
      `${this.resourcePath()}/pending`,
      this.httpOptions
    );
  }
}
```

### 3. Ejemplo de gestión de plantillas

```typescript
@Injectable({
  providedIn: 'root'
})
export class MessageTemplateService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'message-templates';
  }

  createTemplate(templateData: CreateMessageTemplateRequest): Observable<MessageTemplateResponse> {
    return this.http.post<MessageTemplateResponse>(
      this.resourcePath(),
      templateData,
      this.httpOptions
    );
  }

  renderTemplate(templateId: string, channel: NotificationChannelEnum, data: Record<string, string>): Observable<string> {
    return this.http.post<string>(
      `${this.resourcePath()}/${templateId}/render`,
      { channel, data },
      this.httpOptions
    );
  }
}
```

## 🔄 Conversión de Tipos

### Backend vs Frontend

| Java (Backend) | TypeScript (Frontend) | Notas |
|---------------|----------------------|-------|
| `String` | `string \| null` | Siempre nullable en DTOs |
| `Integer` | `number \| null` | Números |
| `Boolean` | `boolean \| null` | Booleanos |
| `LocalDateTime` | `string \| null` | ISO 8601 en DTOs |
| `UUID` | `string \| null` | IDs como strings |
| `Enum` | `string \| null` | String en DTOs |
| `List<String>` | `string[] \| null` | Arrays |
| `Map<String, String>` | `Record<string, string> \| null` | Objetos |

### En Entities (Modelos de dominio)
| Java (Backend) | TypeScript (Entity) | Notas |
|---------------|---------------------|-------|
| `String` | `string` | NO nullable |
| `Integer` | `number` | NO nullable |
| `Boolean` | `boolean` | NO nullable |
| `LocalDateTime` | `Date` | Convertir a Date object |
| `UUID` | `string` | NO nullable |
| `Enum` | `Enum` (TS) | Enum TypeScript |
| `List<String>` | `string[]` | Arrays |

## 📋 Endpoints Disponibles

Basado en los DTOs extraídos, el backend expone los siguientes endpoints:

### Solicitudes de Notificación
- `GET /api/v1/notification-requests` - Listar solicitudes
- `GET /api/v1/notification-requests/{id}` - Obtener solicitud por ID
- `POST /api/v1/notification-requests` - Crear solicitud
- `PUT /api/v1/notification-requests/{id}` - Actualizar solicitud
- `POST /api/v1/notification-requests/{id}/send` - Enviar notificación
- `GET /api/v1/notification-requests/pending` - Solicitudes pendientes

### Plantillas de Mensajes
- `GET /api/v1/message-templates` - Listar plantillas
- `GET /api/v1/message-templates/{id}` - Obtener plantilla por ID
- `POST /api/v1/message-templates` - Crear plantilla
- `PUT /api/v1/message-templates/{id}` - Actualizar plantilla
- `POST /api/v1/message-templates/{id}/render` - Renderizar plantilla

### Intentos de Entrega
- `GET /api/v1/delivery-attempts` - Listar intentos
- `GET /api/v1/delivery-attempts/{id}` - Obtener intento por ID
- `POST /api/v1/delivery-attempts` - Crear intento
- `PUT /api/v1/delivery-attempts/{id}` - Actualizar intento

## 🎯 Características de las Entidades

### NotificationRequest (Solicitud de Notificación)
- **Contextos de origen**: Diferentes módulos del sistema
- **Destinatarios**: Ciudadanos, conductores, administradores
- **Canales múltiples**: Email, SMS, Push notifications
- **Prioridades**: LOW, NORMAL, HIGH, URGENT
- **Programación**: Envío inmediato o programado
- **Expiración**: Tiempo límite para envío

### MessageTemplate (Plantilla de Mensaje)
- **Soporte multi-canal**: EMAIL, SMS, PUSH
- **Variables dinámicas**: Sustitución automática de placeholders
- **Categorización**: Diferentes tipos de comunicación
- **Contenido específico**: Subject, body, título según canal

### DeliveryAttempt (Intento de Entrega)
- **Proveedores externos**: Integración con servicios de mensajería
- **Reintentos automáticos**: Sistema de reintento configurable
- **Costos**: Seguimiento de costos por mensaje
- **Estados de entrega**: PENDING, DELIVERED, FAILED, BOUNCED

## 🔒 Estados y Flujos

### Estados de Solicitud
```typescript
// Crear solicitud (estado inicial)
const request = new NotificationRequestEntity();
// request.status = RequestStatusEnum.PENDING

// Enviar notificación
request.status = RequestStatusEnum.SENT;

// Si falla el envío
request.status = RequestStatusEnum.FAILED;

// Si expira sin enviar
request.status = RequestStatusEnum.EXPIRED;
```

### Estados de Intento de Entrega
```typescript
// Crear intento (estado inicial)
const attempt = new DeliveryAttemptEntity();
// attempt.status = AttemptStatusEnum.PENDING

// Entrega exitosa
attempt.status = AttemptStatusEnum.DELIVERED;

// Falla en entrega
attempt.status = AttemptStatusEnum.FAILED;

// Correo rebotado
attempt.status = AttemptStatusEnum.BOUNCED;
```

## 🛠️ Instalación

1. Copia la carpeta `communication-hub-frontend-types` a tu proyecto Angular
2. Importa los tipos según necesites
3. Asegúrate de tener configurado HttpClient en tu app

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // otros providers...
  ]
};
```

## 📝 Notas Importantes

- **Sistema de plantillas flexible** - Un template soporta múltiples canales
- **Variables dinámicas** - Sustitución automática con {{variable}}
- **Reintentos inteligentes** - Sistema automático de reenvío
- **Costos por mensaje** - Seguimiento financiero de comunicaciones
- **Prioridades y scheduling** - Control de urgencia y timing

## 🔧 Ejemplos de Mappers

### NotificationRequest Response → Entity
```typescript
export class NotificationRequestEntityFromResponseMapper {
  static fromDtoToEntity(dto: NotificationRequestResponse): NotificationRequestEntity {
    return {
      id: dto.id ?? '',
      sourceContext: SourceContextMapper.fromStringToEnum(dto.sourceContext ?? ''),
      recipientId: dto.recipientId ?? '',
      recipientType: RecipientTypeMapper.fromStringToEnum(dto.recipientType ?? ''),
      recipientEmail: dto.recipientEmail ?? '',
      recipientPhone: dto.recipientPhone ?? '',
      messageType: MessageTypeMapper.fromStringToEnum(dto.messageType ?? ''),
      templateId: dto.templateId ?? '',
      templateData: dto.templateData ?? {},
      channels: dto.channels?.map(c => NotificationChannelMapper.fromStringToEnum(c)) ?? [],
      priority: NotificationPriorityMapper.fromStringToEnum(dto.priority ?? ''),
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : new Date(),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : new Date(),
      status: RequestStatusMapper.fromStringToEnum(dto.status ?? ''),
      sentAt: dto.sentAt ? new Date(dto.sentAt) : null,
      failureReason: dto.failureReason
    };
  }
}
```

### MessageTemplate Response → Entity
```typescript
export class MessageTemplateEntityFromResponseMapper {
  static fromDtoToEntity(dto: MessageTemplateResponse): MessageTemplateEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
      category: TemplateCategoryMapper.fromStringToEnum(dto.category ?? ''),
      supportedChannels: dto.supportedChannels?.map(c => NotificationChannelMapper.fromStringToEnum(c)) ?? [],
      emailSubject: dto.emailSubject,
      emailBody: dto.emailBody,
      smsBody: dto.smsBody,
      pushTitle: dto.pushTitle,
      pushBody: dto.pushBody,
      variables: dto.variables ?? [],
      isActive: dto.isActive ?? true
    };
  }
}
```

## 📚 Referencias

- [Documentación del Backend](https://github.com/tu-proyecto/waste-track-platform)
- [Guía de Angular HTTP Client](https://angular.dev/guide/http)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)