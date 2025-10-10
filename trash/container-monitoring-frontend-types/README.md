# Container Monitoring Frontend Types

Este directorio contiene todos los tipos TypeScript necesarios para integrar el módulo de monitoreo de contenedores en el frontend de Angular.

## 📁 Estructura de Archivos

### DTOs de Request (Peticiones al Backend)
- `create-container-request.type.ts` - Para crear nuevos contenedores
- `create-sensor-reading-request.type.ts` - Para registrar lecturas de sensores
- `update-container-request.type.ts` - Para actualizar contenedores existentes
- `update-sensor-reading-request.type.ts` - Para actualizar lecturas de sensores

### DTOs de Response (Respuestas del Backend)
- `container-response.type.ts` - Información completa de contenedores
- `sensor-reading-response.type.ts` - Información de lecturas de sensores

### Entidades de Dominio
- `container.entity.ts` - Entidad Container para frontend
- `sensor-reading.entity.ts` - Entidad SensorReading para frontend

### Enums
- `container-status.enum.ts` - Estados: ACTIVE, MAINTENANCE, DECOMMISSIONED
- `container-type.enum.ts` - Tipos: ORGANIC, RECYCLABLE, GENERAL
- `validation-status.enum.ts` - Estados de validación: VALID, ANOMALY, SENSOR_ERROR

## 🚀 Uso Básico

### 1. Importar los tipos necesarios

```typescript
import { CreateContainerRequest } from './container-monitoring-frontend-types/create-container-request.type';
import { ContainerResponse } from './container-monitoring-frontend-types/container-response.type';
import { ContainerEntity } from './container-monitoring-frontend-types/container.entity';
import { ContainerStatusEnum, ContainerTypeEnum } from './container-monitoring-frontend-types/container-status.enum';
```

### 2. Ejemplo de uso en un servicio

```typescript
@Injectable({
  providedIn: 'root'
})
export class ContainerService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'containers';
  }

  create(containerData: CreateContainerRequest): Observable<ContainerResponse> {
    return this.http.post<ContainerResponse>(
      this.resourcePath(),
      containerData,
      this.httpOptions
    );
  }

  getAll(): Observable<ContainerResponse[]> {
    return this.http.get<ContainerResponse[]>(
      this.resourcePath(),
      this.httpOptions
    );
  }

  getContainersRequiringCollection(): Observable<ContainerResponse[]> {
    return this.http.get<ContainerResponse[]>(
      `${this.resourcePath()}/requiring-collection`,
      this.httpOptions
    );
  }

  markAsCollected(containerId: string): Observable<ContainerResponse> {
    return this.http.post<ContainerResponse>(
      `${this.resourcePath()}/${containerId}/collect`,
      {},
      this.httpOptions
    );
  }
}
```

### 3. Ejemplo de gestión de lecturas de sensores

```typescript
@Injectable({
  providedIn: 'root'
})
export class SensorReadingService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'sensor-readings';
  }

  recordReading(readingData: CreateSensorReadingRequest): Observable<SensorReadingResponse> {
    return this.http.post<SensorReadingResponse>(
      this.resourcePath(),
      readingData,
      this.httpOptions
    );
  }

  getContainerReadings(containerId: string): Observable<SensorReadingResponse[]> {
    return this.http.get<SensorReadingResponse[]>(
      `${this.resourcePath()}/container/${containerId}`,
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
| `Double` | `number \| null` | Números decimales |
| `LocalDateTime` | `string \| null` | ISO 8601 en DTOs |
| `UUID` | `string \| null` | IDs como strings |
| `Enum` | `string \| null` | String en DTOs |

### En Entities (Modelos de dominio)
| Java (Backend) | TypeScript (Entity) | Notas |
|---------------|---------------------|-------|
| `String` | `string` | NO nullable |
| `Integer` | `number` | NO nullable |
| `Double` | `number` | NO nullable |
| `LocalDateTime` | `Date` | Convertir a Date object |
| `UUID` | `string` | NO nullable |
| `Enum` | `Enum` (TS) | Enum TypeScript |

## 📋 Endpoints Disponibles

Basado en los DTOs extraídos, el backend expone los siguientes endpoints:

### Contenedores
- `GET /api/v1/containers` - Listar contenedores
- `GET /api/v1/containers/{id}` - Obtener contenedor por ID
- `POST /api/v1/containers` - Crear contenedor
- `PUT /api/v1/containers/{id}` - Actualizar contenedor
- `DELETE /api/v1/containers/{id}` - Eliminar contenedor
- `GET /api/v1/containers/requiring-collection` - Contenedores que requieren recolección
- `POST /api/v1/containers/{id}/collect` - Marcar como recolectado

### Lecturas de Sensores
- `GET /api/v1/sensor-readings` - Listar lecturas de sensores
- `GET /api/v1/sensor-readings/{id}` - Obtener lectura por ID
- `POST /api/v1/sensor-readings` - Registrar nueva lectura
- `PUT /api/v1/sensor-readings/{id}` - Actualizar lectura
- `GET /api/v1/sensor-readings/container/{containerId}` - Lecturas por contenedor

## 🎯 Características de las Entidades

### Container (Contenedor)
- **Tipos especializados**: ORGANIC, RECYCLABLE, GENERAL
- **Estados operacionales**: ACTIVE, MAINTENANCE, DECOMMISSIONED
- **Capacidad**: volumen en litros y peso máximo en kg
- **Ubicación**: coordenadas GPS precisas
- **Frecuencia de recolección**: días entre recolecciones
- **Monitoreo**: sensor asignado y última lectura
- **Estado de llenado**: nivel actual y detección de desborde

### SensorReading (Lectura de Sensor)
- **Métricas**: nivel de llenado, temperatura, batería
- **Validación automática**: detección de anomalías y errores de sensor
- **Tiempo**: registrado y recibido con precisión de timestamp
- **Estados**: VALID, ANOMALY, SENSOR_ERROR

## 🔒 Estados y Validaciones

### Estados de Contenedor
```typescript
// Contenedor activo y operativo
container.status = ContainerStatusEnum.ACTIVE;

// Requiere mantenimiento
container.status = ContainerStatusEnum.MAINTENANCE;

// Fuera de servicio
container.status = ContainerStatusEnum.DECOMMISSIONED;
```

### Validación de Lecturas
```typescript
// Validar automáticamente la lectura
if (reading.fillLevelPercentage < 0 || reading.fillLevelPercentage > 100) {
  reading.validationStatus = ValidationStatusEnum.SENSOR_ERROR;
} else if (reading.batteryLevelPercentage < 20) {
  reading.validationStatus = ValidationStatusEnum.ANOMALY;
} else {
  reading.validationStatus = ValidationStatusEnum.VALID;
}
```

### Detección de Recolección Necesaria
```typescript
// Verificar si requiere recolección
requiresCollection(): boolean {
  return this.currentFillLevel > 80 || // Más del 80% lleno
         this.lastCollectionDate // O ya pasó la frecuencia
           .plusDays(this.collectionFrequencyDays)
           .isBefore(LocalDateTime.now());
}
```

## 🛠️ Instalación

1. Copia la carpeta `container-monitoring-frontend-types` a tu proyecto Angular
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

- **Validación de sensores automática** - El backend valida automáticamente las lecturas
- **Detección de anomalías** - Identificación automática de problemas
- **Estados de contenedor** - Control completo del ciclo de vida
- **Frecuencia de recolección** - Programación automática basada en capacidad
- **Monitoreo en tiempo real** - Lecturas de sensores con timestamps precisos

## 🔧 Ejemplos de Mappers

### Container Response → Entity
```typescript
export class ContainerEntityFromResponseMapper {
  static fromDtoToEntity(dto: ContainerResponse): ContainerEntity {
    return {
      id: dto.id ?? '',
      latitude: dto.latitude ?? '',
      longitude: dto.longitude ?? '',
      address: dto.address ?? '',
      districtCode: dto.districtCode ?? '',
      volumeLiters: dto.volumeLiters ?? 0,
      maxWeightKg: dto.maxWeightKg ?? 0,
      containerType: ContainerTypeMapper.fromStringToEnum(dto.containerType ?? ''),
      status: ContainerStatusMapper.fromStringToEnum(dto.status ?? ''),
      currentFillLevel: dto.currentFillLevel ?? 0,
      sensorId: dto.sensorId,
      lastReadingTimestamp: dto.lastReadingTimestamp ? new Date(dto.lastReadingTimestamp) : null,
      districtId: dto.districtId ?? '',
      lastCollectionDate: dto.lastCollectionDate ? new Date(dto.lastCollectionDate) : null,
      collectionFrequencyDays: dto.collectionFrequencyDays ?? 7
    };
  }
}
```

### SensorReading Response → Entity
```typescript
export class SensorReadingEntityFromResponseMapper {
  static fromDtoToEntity(dto: SensorReadingResponse): SensorReadingEntity {
    return {
      id: dto.id ?? '',
      containerId: dto.containerId ?? '',
      fillLevelPercentage: dto.fillLevelPercentage ?? 0,
      temperatureCelsius: dto.temperatureCelsius ?? 0,
      batteryLevelPercentage: dto.batteryLevelPercentage ?? 0,
      recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
      isValidated: true, // Las lecturas del backend ya están validadas
      validationStatus: ValidationStatusMapper.fromStringToEnum(dto.validationStatus ?? ''),
      receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : new Date()
    };
  }
}
```

## 📚 Referencias

- [Documentación del Backend](https://github.com/tu-proyecto/waste-track-platform)
- [Guía de Angular HTTP Client](https://angular.dev/guide/http)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)