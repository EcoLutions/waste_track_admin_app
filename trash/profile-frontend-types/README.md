# Profile Frontend Types

Este directorio contiene todos los tipos TypeScript necesarios para integrar el módulo de gestión de perfiles de usuario en el frontend de Angular.

## 📁 Estructura de Archivos

### DTOs de Request (Peticiones al Backend)
- `create-user-profile-request.type.ts` - Para crear nuevos perfiles de usuario
- `update-user-profile-request.type.ts` - Para actualizar perfiles existentes

### DTOs de Response (Respuestas del Backend)
- `user-profile-response.type.ts` - Información completa del perfil de usuario
- `photo-response.type.ts` - Información de fotos de perfil

### Entidades de Dominio
- `user-profile.entity.ts` - Entidad UserProfile para frontend

### Enums
- `user-type.enum.ts` - Tipos de usuario: CITIZEN, DRIVER, ADMINISTRATOR, SUPER_ADMINISTRATOR
- `language.enum.ts` - Idiomas soportados: ES, EN, PT, FR

## 🚀 Uso Básico

### 1. Importar los tipos necesarios

```typescript
import { CreateUserProfileRequest } from './profile-frontend-types/create-user-profile-request.type';
import { UserProfileResponse } from './profile-frontend-types/user-profile-response.type';
import { UserProfileEntity } from './profile-frontend-types/user-profile.entity';
import { UserTypeEnum, LanguageEnum } from './profile-frontend-types/user-type.enum';
```

### 2. Ejemplo de uso en un servicio

```typescript
@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'user-profiles';
  }

  create(profileData: CreateUserProfileRequest): Observable<UserProfileResponse> {
    return this.http.post<UserProfileResponse>(
      this.resourcePath(),
      profileData,
      this.httpOptions
    );
  }

  getByUserId(userId: string): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(
      `${this.resourcePath()}/user/${userId}`,
      this.httpOptions
    );
  }

  update(profileId: string, profileData: UpdateUserProfileRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(
      `${this.resourcePath()}/${profileId}`,
      profileData,
      this.httpOptions
    );
  }

  uploadPhoto(profileId: string, file: File): Observable<PhotoResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<PhotoResponse>(
      `${this.resourcePath()}/${profileId}/photo`,
      formData
      // No httpOptions - Angular sets Content-Type automatically for FormData
    );
  }
}
```

### 3. Ejemplo de gestión de notificaciones

```typescript
export class NotificationSettingsComponent {
  profile: UserProfileEntity = {
    // ... otros campos
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    pushNotificationsEnabled: true,
    deviceTokens: []
  };

  toggleEmailNotifications(): void {
    const updateRequest: UpdateUserProfileRequest = {
      emailNotificationsEnabled: !this.profile.emailNotificationsEnabled,
      // ... otros campos sin cambiar
    };

    this.profileService.update(this.profile.id, updateRequest).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
      }
    });
  }

  addDeviceToken(token: string): void {
    this.profileService.addDeviceToken(this.profile.id, token).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
      }
    });
  }
}
```

## 🔄 Conversión de Tipos

### Backend vs Frontend

| Java (Backend) | TypeScript (Frontend) | Notas |
|---------------|----------------------|-------|
| `String` | `string \| null` | Siempre nullable en DTOs |
| `Boolean` | `boolean \| null` | Booleanos |
| `UUID` | `string \| null` | IDs como strings |
| `Enum` | `string \| null` | String en DTOs |
| `List<String>` | `string[]` | Arrays de tokens |

### En Entities (Modelos de dominio)
| Java (Backend) | TypeScript (Entity) | Notas |
|---------------|---------------------|-------|
| `String` | `string` | NO nullable |
| `Boolean` | `boolean` | NO nullable |
| `UUID` | `string` | NO nullable |
| `Enum` | `Enum` (TS) | Enum TypeScript |
| `List<String>` | `string[]` | Arrays |

## 📋 Endpoints Disponibles

Basado en los DTOs extraídos, el backend expone los siguientes endpoints:

### Perfiles de Usuario
- `GET /api/v1/user-profiles` - Listar perfiles de usuario
- `GET /api/v1/user-profiles/{id}` - Obtener perfil por ID
- `GET /api/v1/user-profiles/user/{userId}` - Obtener perfil por userId
- `POST /api/v1/user-profiles` - Crear perfil de usuario
- `PUT /api/v1/user-profiles/{id}` - Actualizar perfil
- `DELETE /api/v1/user-profiles/{id}` - Eliminar perfil

### Fotos de Perfil
- `POST /api/v1/user-profiles/{id}/photo` - Subir foto de perfil
- `DELETE /api/v1/user-profiles/{id}/photo` - Eliminar foto de perfil

### Tokens de Dispositivo
- `POST /api/v1/user-profiles/{id}/device-tokens` - Agregar token de dispositivo
- `DELETE /api/v1/user-profiles/{id}/device-tokens/{token}` - Remover token

## 🎯 Características de las Entidades

### UserProfile (Perfil de Usuario)
- **Tipos de usuario**: CITIZEN, DRIVER, ADMINISTRATOR, SUPER_ADMINISTRATOR
- **Configuración de notificaciones**: Email, SMS, Push notifications
- **Tokens de dispositivo**: Para notificaciones push
- **Preferencias**: Idioma y zona horaria
- **Foto de perfil**: Soporte para imágenes de perfil

## 🔒 Configuración de Notificaciones

### Canales de Notificación
```typescript
// Configurar notificaciones
const notificationSettings: UpdateUserProfileRequest = {
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: false,
  pushNotificationsEnabled: true
};
```

### Gestión de Tokens de Dispositivo
```typescript
// Agregar token para notificaciones push
addDeviceToken(token: string): void {
  this.profileService.addDeviceToken(this.profile.id, token).subscribe();
}

// Remover token
removeDeviceToken(token: string): void {
  this.profileService.removeDeviceToken(this.profile.id, token).subscribe();
}
```

## 🛠️ Instalación

1. Copia la carpeta `profile-frontend-types` a tu proyecto Angular
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

- **Configuración de notificaciones granular** - Control independiente por canal
- **Soporte multi-idioma** - ES, EN, PT, FR
- **Gestión de zona horaria** - Para horarios correctos
- **Tokens de dispositivo** - Para notificaciones push en móviles
- **Fotos de perfil** - Con URLs temporales para subida

## 🔧 Ejemplos de Mappers

### UserProfile Response → Entity
```typescript
export class UserProfileEntityFromResponseMapper {
  static fromDtoToEntity(dto: UserProfileResponse): UserProfileEntity {
    return {
      id: dto.id ?? '',
      userId: dto.userId ?? '',
      photoPath: dto.photoPath,
      userType: UserTypeMapper.fromStringToEnum(dto.userType ?? ''),
      districtId: dto.districtId ?? '',
      email: dto.email ?? '',
      phoneNumber: dto.phoneNumber ?? '',
      emailNotificationsEnabled: dto.emailNotificationsEnabled ?? true,
      smsNotificationsEnabled: dto.smsNotificationsEnabled ?? false,
      pushNotificationsEnabled: dto.pushNotificationsEnabled ?? true,
      deviceTokens: [], // Se cargarían desde endpoint separado
      language: LanguageMapper.fromStringToEnum(dto.language ?? ''),
      timezone: dto.timezone ?? 'America/Lima',
      isActive: dto.isActive ?? true
    };
  }
}
```

### UserProfile Entity → Update Request
```typescript
export class UpdateUserProfileRequestFromEntityMapper {
  static fromEntityToDto(entity: UserProfileEntity): UpdateUserProfileRequest {
    return {
      photoPath: entity.photoPath,
      userType: entity.userType.toString(),
      districtId: entity.districtId,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
      emailNotificationsEnabled: entity.emailNotificationsEnabled,
      smsNotificationsEnabled: entity.smsNotificationsEnabled,
      pushNotificationsEnabled: entity.pushNotificationsEnabled,
      language: entity.language.toString(),
      timezone: entity.timezone,
      isActive: entity.isActive
    };
  }
}
```

## 📚 Referencias

- [Documentación del Backend](https://github.com/tu-proyecto/waste-track-platform)
- [Guía de Angular HTTP Client](https://angular.dev/guide/http)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)