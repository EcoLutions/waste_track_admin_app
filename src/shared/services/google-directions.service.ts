import { Injectable } from '@angular/core';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface NavigationInstruction {
  instruction: string;
  distance: string;
  duration: string;
  location: LatLng;
  maneuver?: string;
}

export interface RouteDirections {
  polylinePoints: LatLng[];
  encodedPolyline: string;
  bounds: google.maps.LatLngBounds;
  instructions: NavigationInstruction[];
  totalDistance: number;
  totalDuration: number;
  formattedDistance: string;
  formattedDuration: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleDirectionsService {
  private directionsService: google.maps.DirectionsService | null = null;

  constructor() {
  }

  private async ensureDirectionsService(): Promise<void> {
    if (this.directionsService) {
      return;
    }

    await this.waitForGoogleMaps();

    this.directionsService = new google.maps.DirectionsService();
  }

  private async waitForGoogleMaps(): Promise<void> {
    const maxAttempts = 20;
    const delayMs = 500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (typeof google !== 'undefined' && google.maps && google.maps.DirectionsService) {
        console.log(`✅ Google Maps SDK cargado (intento ${attempt}/${maxAttempts})`);
        return;
      }

      console.log(`⏳ Esperando Google Maps SDK... (intento ${attempt}/${maxAttempts})`);
      await this.delay(delayMs);
    }

    throw new Error('⏰ Timeout: Google Maps SDK no se cargó después de 10 segundos. Verifica tu index.html y API key.');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  async getDirections(origin: LatLng, destination: LatLng, waypoints: LatLng[] = []): Promise<RouteDirections | null> {
    try {
      await this.ensureDirectionsService();

      const googleWaypoints: google.maps.DirectionsWaypoint[] = waypoints.map(wp => ({
        location: new google.maps.LatLng(wp.lat, wp.lng),
        stopover: true
      }));

      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: googleWaypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        region: 'PE'
      };

      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        this.directionsService!.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            console.error(`❌ SDK retornó error: ${status}`);
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      const route = result.routes[0];
      if (!route) {
        console.error('❌ No se encontró ninguna ruta en el resultado');
        return null;
      }

      const polylinePoints = route.overview_path.map(point => ({
        lat: point.lat(),
        lng: point.lng()
      }));


      const bounds = route.bounds;

      const instructions: NavigationInstruction[] = [];
      let totalDistance = 0;
      let totalDuration = 0;

      for (const leg of route.legs) {
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;

        for (const step of leg.steps) {
          instructions.push({
            instruction: this.stripHtml(step.instructions),
            distance: step.distance?.text || '',
            duration: step.duration?.text || '',
            location: {
              lat: step.start_location.lat(),
              lng: step.start_location.lng()
            },
            maneuver: step.maneuver
          });
        }
      }

      return {
        polylinePoints,
        encodedPolyline: route.overview_polyline,
        bounds,
        instructions,
        totalDistance,
        totalDuration,
        formattedDistance: this.formatDistance(totalDistance),
        formattedDuration: this.formatDuration(totalDuration)
      };

    } catch (error) {
      console.error('❌ Error al obtener direcciones:', error);
      return null;
    }
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  private formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  simplifyPolyline(points: LatLng[], factor: number = 2): LatLng[] {
    if (points.length <= 100) return points;

    const simplified: LatLng[] = [];
    for (let i = 0; i < points.length; i += factor) {
      simplified.push(points[i]);
    }

    // Siempre incluir el último punto
    if (points.length % factor !== 0) {
      simplified.push(points[points.length - 1]);
    }

    console.log(`📉 Polyline simplificado: ${points.length} → ${simplified.length} puntos`);
    return simplified;
  }
}
