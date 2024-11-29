import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { duocSedes } from 'src/assets/sedes';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private googleMaps: any;

  constructor() {
    const loader = new Loader({
      apiKey: 'AIzaSyA0v03W617Sq9vYpf6sI85l6ElaZzpEmr8',
      libraries: ['geometry'], // Incluye la librería de geometría
    });

    loader.load().then((google) => {
      this.googleMaps = google.maps;
    });
  }

  async isInsideSede(lat: number, lng: number): Promise<string | null> {
    if (!this.googleMaps) {
      console.error('Google Maps API no cargada.');
      return null;
    }
  
    const userLocation = new this.googleMaps.LatLng(lat, lng);
    console.log(`Verificando punto del usuario: ${lat}, ${lng}`);
  
    for (const sede of duocSedes) {
      console.log(`Verificando sede: ${sede.name}`);
      console.log('Coordenadas del polígono:', sede.polygon);
  
      const polygon = new this.googleMaps.Polygon({ paths: sede.polygon });
      const isInside = this.googleMaps.geometry.poly.containsLocation(userLocation, polygon);
  
      console.log(`Resultado para la sede ${sede.name}: ${isInside}`);
  
      if (isInside) {
        console.log(`Ubicación dentro de la sede: ${sede.name}`);
        return sede.name;
      }
    }
  
    console.log('Punto fuera de todas las sedes.');
    return null;
  }
}
