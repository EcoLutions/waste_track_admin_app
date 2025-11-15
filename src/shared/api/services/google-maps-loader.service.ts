import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private apiLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  async load(): Promise<void> {
    if (this.apiLoaded) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.loadGoogleMapsScript();
    return this.loadingPromise;
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        this.apiLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      const { apiKey, version, libraries } = environment.googleMaps;

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=${version}&libraries=${libraries.join(',')}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.apiLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        this.loadingPromise = null;
        reject(new Error('Error al cargar Google Maps API: ' + error));
      };

      document.head.appendChild(script);
    });
  }

  isLoaded(): boolean {
    return this.apiLoaded && typeof window.google !== 'undefined';
  }

  getGoogle(): any {
    if (!this.isLoaded()) {
      throw new Error('Google Maps API no está cargado. Llama a load() primero.');
    }
    return window.google;
  }
}
