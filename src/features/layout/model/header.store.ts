import { computed, inject } from '@angular/core';
import { AuthStore } from '../../../shared';
import { UserProfileService } from '../../../entities/user-profile/api';
import { UserProfileEntity } from '../../../entities/user-profile/model';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

export interface HeaderState {
  profile: UserProfileEntity | null;
  isLoadingProfile: boolean;
  profileError: string | null;
}

const initialState: HeaderState = {
  profile: null,
  isLoadingProfile: false,
  profileError: null
};

export const HeaderStore = signalStore(
  { providedIn: 'root' },
  withState<HeaderState>(initialState),

  withComputed((state) => {
    const authStore = inject(AuthStore);

    return {
      /*
      * User data
       */
      user: computed(() => authStore.user()),
      isAuthenticated: computed(() => authStore.isAuthenticated()),
      username: computed(() => authStore.username()),

      /*
       * Profile data
       */
      userInfo: computed(() => {
        const user = authStore.user();
        const profile = state.profile();

        if (!user) return null;

        /*
        * Get initials from the username
         */
        const getInitials = (name: string) => {
          return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
        };

        // Obtener nombre completo
        const fullName = `${user.username || ''}`.trim();

        // Determinar rol basado en el enum de roles
        const getRoleName = (roles: any[]) => {
          if (!roles || roles.length === 0) return 'Usuario';

          const roleNames: { [key: string]: string } = {
            'ROLE_MUNICIPAL_ADMINISTRATOR': 'Administrador Municipal',
            'ROLE_DRIVER': 'Conductor',
            'ROLE_CITIZEN': 'Ciudadano',
            'ROLE_SUPERVISOR': 'Supervisor'
          };

          const primaryRole = roles.find(role => roleNames[role.name]);
          return primaryRole ? roleNames[primaryRole.name] : 'Usuario';
        };

        return {
          name: fullName,
          initials: getInitials(fullName),
          role: getRoleName(user.roles || []),
          avatar: profile?.photoUrl || undefined,
          email: profile?.email || user.username || '',
          phoneNumber: profile?.phoneNumber || ''
        };
      }),

      isLoading: computed(() => state.isLoadingProfile() || authStore.isLoading()),
      hasError: computed(() => !!state.profileError() || !!authStore.error())
    };
  }),

  withMethods((store) => {
    const authStore = inject(AuthStore);
    const profileService = inject(UserProfileService);

    return {
      async loadUserProfile(): Promise<void> {
        const user = authStore.user();
        if (!user?.id) {
          patchState(store, {
            profileError: 'Usuario no autenticado'
          });
          return;
        }

        patchState(store, {
          isLoadingProfile: true,
          profileError: null
        });

        try {
          // Buscar perfil por userId
          const userProfile = await firstValueFrom(profileService.getByUserId(user.id));


          if (userProfile) {
            patchState(store, {
              profile: userProfile,
              isLoadingProfile: false
            });
          } else {
            // Si no hay perfil, crear uno básico con información del usuario
            patchState(store, {
              profile: null,
              isLoadingProfile: false
            });
          }
        } catch (error: any) {
          patchState(store, {
            isLoadingProfile: false,
            profileError: error.message || 'Error al cargar el perfil'
          });
        }
      },

      /**
       * Actualizar información del perfil
       */
      async updateProfile(updates: Partial<UserProfileEntity>): Promise<void> {
        const currentProfile = store.profile();
        if (!currentProfile?.id) return;

        patchState(store, {
          isLoadingProfile: true,
          profileError: null
        });

        try {
          const updatedProfile = await firstValueFrom(
            profileService.update(currentProfile.id, { ...currentProfile, ...updates })
          );

          patchState(store, {
            profile: updatedProfile,
            isLoadingProfile: false
          });
        } catch (error: any) {
          patchState(store, {
            isLoadingProfile: false,
            profileError: error.message || 'Error al actualizar el perfil'
          });
        }
      },

      /**
       * Limpiar estado del header (logout)
       */
      clearHeaderState(): void {
        patchState(store, {
          profile: null,
          isLoadingProfile: false,
          profileError: null
        });
      },

      /**
       * Refrescar datos del header
       */
      async refreshHeaderData(): Promise<void> {
        await this.loadUserProfile();
      }
    };
  })
);
