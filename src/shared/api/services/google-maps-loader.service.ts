import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private bootstrapLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  async load(): Promise<void> {
    if (this.bootstrapLoaded) return Promise.resolve();
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this.loadBootstrap();
    return this.loadingPromise;
  }

  private loadBootstrap(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.bootstrapLoaded || (window.google?.maps?.importLibrary)) {
        this.bootstrapLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      const { apiKey, version } = environment.googleMaps;

      // Inserta el snippet oficial del loader (inline). Este snippet define
      // synchronously google.maps.importLibrary y dispara la carga del script externo.
      script.innerHTML = `
        (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
          key: "${apiKey}",
          v: "${version}"
        });
      `;

      // onerror de un script inline no se dispara para errores de ejecución,
      // por lo que añadimos una espera activa hasta que importLibrary exista.
      document.head.appendChild(script);

      const timeoutMs = 8000;
      const start = Date.now();
      const checkReady = () => {
        if (window.google?.maps?.importLibrary) {
          this.bootstrapLoaded = true;
          resolve();
          return;
        }
        if (Date.now() - start > timeoutMs) {
          this.loadingPromise = null;
          reject(new Error('Google Maps loader timeout: importLibrary no disponible'));
          return;
        }
        setTimeout(checkReady, 50);
      };

      checkReady();
    });
  }

  async importLibrary(library: 'maps' | 'marker' | 'places' | 'geocoding'): Promise<any> {
    await this.load();

    if (!window.google?.maps?.importLibrary) {
      throw new Error('Google Maps API no disponible');
    }

    return await window.google.maps.importLibrary(library);
  }

  isLoaded(): boolean {
    return this.bootstrapLoaded && typeof window.google !== 'undefined';
  }
}
