export interface TruckMarkerOptions {
  position: google.maps.LatLngLiteral;
  rotation?: number;
  map: google.maps.Map;
}

export interface AnimationOptions {
  duration: number;
  easing?: (t: number) => number;
}

export class TruckMarker {
  private marker: google.maps.marker.AdvancedMarkerElement | null = null;
  private currentPosition: google.maps.LatLngLiteral;
  private currentRotation: number = 0;
  private animationFrameId: number | null = null;

  constructor(private options: TruckMarkerOptions) {
    this.currentPosition = options.position;
    this.currentRotation = options.rotation || 0;
    this.createMarker();
  }

  private createMarker(): void {
    const content = this.createTruckElement();

    this.marker = new google.maps.marker.AdvancedMarkerElement({
      map: this.options.map,
      position: this.currentPosition,
      content,
      title: 'Vehículo en ruta'
    });

    console.log('🚛 Truck marker created at:', this.currentPosition);
  }

  private createTruckElement(): HTMLElement {
    const container = document.createElement('div');
    container.style.width = '48px';
    container.style.height = '48px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.transform = `rotate(${this.currentRotation}deg)`;
    container.style.transition = 'transform 0.3s ease-out';

    const img = document.createElement('img');
    img.src = 'assets/images/truck.png';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
    img.alt = 'Truck';

    container.appendChild(img);
    return container;
  }

  animateToPosition(newPosition: google.maps.LatLngLiteral, animationOptions: AnimationOptions = { duration: 2000 }): Promise<void> {
    return new Promise((resolve) => {
      if (!this.marker) {
        console.warn('Marker not initialized');
        resolve();
        return;
      }

      // Cancelar animación anterior si existe
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }

      const startPosition = { ...this.currentPosition };
      const startTime = performance.now();
      const { duration, easing = this.easeInOutCubic } = animationOptions;

      // Calcular rotación hacia el destino
      const targetRotation = this.calculateBearing(startPosition, newPosition);

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        // Interpolar posición
        const lat = startPosition.lat + (newPosition.lat - startPosition.lat) * easedProgress;
        const lng = startPosition.lng + (newPosition.lng - startPosition.lng) * easedProgress;

        this.currentPosition = { lat, lng };
        this.marker!.position = this.currentPosition;

        // Interpolar rotación
        this.currentRotation = this.interpolateAngle(
          this.currentRotation,
          targetRotation,
          easedProgress
        );
        this.updateRotation();

        if (progress < 1) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          this.animationFrameId = null;
          console.log('🚛 Animation complete. New position:', this.currentPosition);
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  private calculateBearing(start: google.maps.LatLngLiteral, end: google.maps.LatLngLiteral): number {
    const startLat = this.toRadians(start.lat);
    const startLng = this.toRadians(start.lng);
    const endLat = this.toRadians(end.lat);
    const endLng = this.toRadians(end.lng);

    const dLng = endLng - startLng;

    const y = Math.sin(dLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    const bearing = Math.atan2(y, x);
    return this.toDegrees(bearing);
  }

  private interpolateAngle(start: number, end: number, progress: number): number {
    // Normalizar ángulos a 0-360
    start = ((start % 360) + 360) % 360;
    end = ((end % 360) + 360) % 360;

    // Calcular diferencia más corta
    let diff = end - start;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    return start + diff * progress;
  }

  private updateRotation(): void {
    if (this.marker && this.marker.content) {
      const element = this.marker.content as HTMLElement;
      element.style.transform = `rotate(${this.currentRotation}deg)`;
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  getPosition(): google.maps.LatLngLiteral {
    return { ...this.currentPosition };
  }

  getRotation(): number {
    return this.currentRotation;
  }

  show(): void {
    if (this.marker) {
      this.marker.map = this.options.map;
    }
  }

  hide(): void {
    if (this.marker) {
      this.marker.map = null;
    }
  }

  remove(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.marker) {
      this.marker.map = null;
      this.marker = null;
    }
  }
}
