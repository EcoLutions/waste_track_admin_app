# Community Relations Frontend Types

Este directorio contiene todos los tipos TypeScript necesarios para integrar el módulo de relaciones comunitarias en el frontend de Angular.

## 📁 Estructura de Archivos

### DTOs de Request (Peticiones al Backend)
- `create-citizen-request.type.ts` - Para crear nuevos ciudadanos
- `create-report-request.type.ts` - Para crear nuevos reportes de problemas
- `update-citizen-request.type.ts` - Para actualizar información de ciudadanos
- `update-report-request.type.ts` - Para actualizar reportes existentes

### DTOs de Response (Respuestas del Backend)
- `citizen-response.type.ts` - Información completa de ciudadanos
- `report-response.type.ts` - Información completa de reportes
- `evidence-response.type.ts` - Información de evidencia (fotos/videos)

### Entidades de Dominio
- `citizen.entity.ts` - Entidad Citizen para frontend (con sistema de puntos)
- `report.entity.ts` - Entidad Report para frontend (con flujo de estados)
- `evidence.entity.ts` - Entidad Evidence para frontend

### Enums
- `membership-level.enum.ts` - Niveles de membresía: BRONZE, SILVER, GOLD
- `report-status.enum.ts` - Estados de reporte: SUBMITTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, REJECTED
- `report-type.enum.ts` - Tipos de reporte: CONTAINER_FULL, CONTAINER_DAMAGED, GARBAGE_OUTSIDE, MISSED_COLLECTION, OTHER
- `evidence-type.enum.ts` - Tipos de evidencia: PHOTO, VIDEO

## 🚀 Uso Básico

### 1. Importar los tipos necesarios

```typescript
import { CreateReportRequest } from './community-relations-frontend-types/create-report-request.type';
import { ReportResponse } from './community-relations-frontend-types/report-response.type';
import { ReportEntity } from './community-relations-frontend-types/report.entity';
import { ReportStatusEnum, ReportTypeEnum } from './community-relations-frontend-types/report-status.enum';
```

### 2. Ejemplo de uso en un servicio

```typescript
@Injectable({
  providedIn: 'root'
})
export class ReportService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'reports';
  }

  create(reportData: CreateReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(
      this.resourcePath(),
      reportData,
      this.httpOptions
    );
  }

  getAll(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(
      this.resourcePath(),
      this.httpOptions
    );
  }

  acknowledge(reportId: string): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(
      `${this.resourcePath()}/${reportId}/acknowledge`,
      {},
      this.httpOptions
    );
  }

  resolve(reportId: string, note: string): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(
      `${this.resourcePath()}/${reportId}/resolve`,
      { note },
      this.httpOptions
    );
  }
}
```

### 3. Ejemplo de gestión de evidencia

```typescript
@Injectable({
  providedIn: 'root'
})
export class EvidenceService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'evidences';
  }

  uploadEvidence(file: File, description: string): Observable<EvidenceResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    return this.http.post<EvidenceResponse>(
      this.resourcePath(),
      formData
      // No httpOptions - Angular sets Content-Type automatically for FormData
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
| `Long` | `number \| null` | Números (fileSize) |
| `LocalDateTime` | `string \| null` | ISO 8601 en DTOs |
| `UUID` | `string \| null` | IDs como strings |
| `Enum` | `string \| null` | String en DTOs |
| `List<String>` | `string[] \| null` | Arrays |

### En Entities (Modelos de dominio)
| Java (Backend) | TypeScript (Entity) | Notas |
|---------------|---------------------|-------|
| `String` | `string` | NO nullable |
| `Integer` | `number` | NO nullable |
| `Long` | `number` | NO nullable |
| `LocalDateTime` | `Date` | Convertir a Date object |
| `UUID` | `string` | NO nullable |
| `Enum` | `Enum` (TS) | Enum TypeScript |

## 📋 Endpoints Disponibles

Basado en los DTOs extraídos, el backend expone los siguientes endpoints:

### Ciudadanos
- `GET /api/v1/citizens` - Listar ciudadanos
- `GET /api/v1/citizens/{id}` - Obtener ciudadano por ID
- `POST /api/v1/citizens` - Crear ciudadano
- `PUT /api/v1/citizens/{id}` - Actualizar ciudadano
- `DELETE /api/v1/citizens/{id}` - Eliminar ciudadano

### Reportes
- `GET /api/v1/reports` - Listar reportes
- `GET /api/v1/reports/{id}` - Obtener reporte por ID
- `POST /api/v1/reports` - Crear reporte
- `PUT /api/v1/reports/{id}` - Actualizar reporte
- `POST /api/v1/reports/{id}/acknowledge` - Reconocer reporte
- `POST /api/v1/reports/{id}/resolve` - Resolver reporte

### Evidencia
- `GET /api/v1/evidences` - Listar evidencia
- `GET /api/v1/evidences/{id}` - Obtener evidencia por ID
- `POST /api/v1/evidences` - Subir evidencia (multipart/form-data)
- `DELETE /api/v1/evidences/{id}` - Eliminar evidencia

## 🎯 Características de las Entidades

### Citizen (Ciudadano)
- **Sistema de puntos**: Acumula puntos por reportes y actividad
- **Niveles de membresía**: BRONZE → SILVER → GOLD (automático por puntos)
- **Información personal**: Datos básicos + contacto
- **Actividad**: Seguimiento de última actividad

### Report (Reporte)
- **Flujo de estados**: SUBMITTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED/REJECTED
- **Tipos de problema**: Contenedor lleno, dañado, basura fuera, recolección perdida, otros
- **Ubicación**: Coordenadas GPS + dirección
- **Evidencia**: Soporte para múltiples fotos y videos
- **Tiempos de resolución**: SLA automático por tipo de reporte

### Evidence (Evidencia)
- **Tipos**: PHOTO, VIDEO
- **Metadatos**: Tamaño, tipo MIME, nombre original
- **Miniaturas**: Generación automática para imágenes
- **Validaciones**: Tamaño máximo, tipos permitidos

## 🔒 Estados y Transiciones

### Estados de Reporte
```typescript
// Crear reporte (estado inicial)
const report = new ReportEntity();
// report.status = ReportStatusEnum.SUBMITTED

// Reconocer reporte
report.status = ReportStatusEnum.ACKNOWLEDGED;

// Procesar reporte
report.status = ReportStatusEnum.IN_PROGRESS;

// Resolver reporte
report.status = ReportStatusEnum.RESOLVED;

// Rechazar reporte
report.status = ReportStatusEnum.REJECTED;
```

### Sistema de Membresía
```typescript
// Ciudadano gana puntos por actividad
citizen.earnPoints(10, 'Reporte resuelto');

// Sistema actualiza nivel automáticamente
// 0-99 puntos = BRONZE
// 100-499 puntos = SILVER
// 500+ puntos = GOLD
```

## 🛠️ Instalación

1. Copia la carpeta `community-relations-frontend-types` a tu proyecto Angular
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

- **Estados estrictos** - Cada reporte tiene un flujo de estados bien definido
- **Sistema de puntos automático** - Se calcula basado en actividad del ciudadano
- **Niveles de membresía dinámicos** - Se actualizan automáticamente por puntos
- **Evidencia con metadatos** - Información completa de archivos subidos
- **Tiempos de resolución** - SLA automático según tipo de reporte

## 🔧 Ejemplos de Mappers

### Report Response → Entity
```typescript
export class ReportEntityFromResponseMapper {
  static fromDtoToEntity(dto: ReportResponse): ReportEntity {
    return {
      id: dto.id ?? '',
      citizenId: dto.citizenId ?? '',
      latitude: dto.latitude ?? '',
      longitude: dto.longitude ?? '',
      address: dto.address ?? '',
      districtCode: dto.districtCode ?? '',
      containerId: dto.containerId,
      reportType: ReportTypeMapper.fromStringToEnum(dto.reportType ?? ''),
      description: dto.description ?? '',
      status: ReportStatusMapper.fromStringToEnum(dto.status ?? ''),
      resolutionNote: dto.resolutionNote,
      resolvedAt: dto.resolvedAt ? new Date(dto.resolvedAt) : null,
      resolvedBy: dto.resolvedBy,
      submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : new Date(),
      acknowledgedAt: dto.acknowledgedAt ? new Date(dto.acknowledgedAt) : null,
      evidences: [] // Se cargarían desde endpoint separado
    };
  }
}
```

### Citizen Response → Entity
```typescript
export class CitizenEntityFromResponseMapper {
  static fromDtoToEntity(dto: CitizenResponse): CitizenEntity {
    return {
      id: dto.id ?? '',
      userId: dto.userId ?? '',
      districtId: dto.districtId ?? '',
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      email: dto.email ?? '',
      phoneNumber: dto.phoneNumber ?? '',
      membershipLevel: MembershipLevelMapper.fromStringToEnum(dto.membershipLevel ?? ''),
      totalPoints: dto.totalPoints ?? 0,
      totalReportsSubmitted: dto.totalReportsSubmitted ?? 0,
      lastActivityDate: dto.lastActivityDate ? new Date(dto.lastActivityDate) : new Date()
    };
  }
}
```

## 📚 Referencias

- [Documentación del Backend](https://github.com/tu-proyecto/waste-track-platform)
- [Guía de Angular HTTP Client](https://angular.dev/guide/http)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)