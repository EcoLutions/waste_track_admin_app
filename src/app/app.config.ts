import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  inject,
  provideAppInitializer
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import { AppInitializerService } from '../shared';
import { authenticationInterceptor } from '../shared';

export const appInitializerProviders = () => {
  const appInitializerService = inject(AppInitializerService);
  return appInitializerService.initializeApp();
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authenticationInterceptor])
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false // Disable dark mode selector
        }
      }
    }),
    provideAppInitializer(appInitializerProviders),
  ]
};
