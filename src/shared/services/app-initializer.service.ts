import { Injectable, inject } from '@angular/core';
import { AuthStore } from '../stores';
import { HeaderStore } from '../../features/layout/model/header.store';

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {
  private readonly authStore = inject(AuthStore);
  private readonly headerStore = inject(HeaderStore);

  initializeApp(): Promise<void> {
    return new Promise(async (resolve) => {
      /*
       * Initialize auth state
       * This will check if the user is authenticated and refresh user data if needed
       */
      this.authStore.initializeAuth();
      console.log('Auth state initialized');

      /*
       * Refresh user data if needed
       * This will check if the user is authenticated and refresh user data if needed
       */
      if (this.authStore.isAuthenticated()) {
        await this.authStore.refreshUser();
        console.log('User data refreshed');

        /*
         * Initialize header store with user profile data
         * This will load the user profile for the header component
         */
        await this.headerStore.loadUserProfile();
        console.log('Header store initialized');
      }

      console.log('App initialization complete');
      /*
       * Resolve the promise when initialization is complete
       * This will allow the app to start running
       * You can add additional initialization steps here if needed
       */
      resolve();
    });
  }
}
