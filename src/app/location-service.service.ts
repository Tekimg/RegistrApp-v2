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
    }).catch(error => {
      console.error('Error al cargar la API de Google Maps:', error);
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
      if (!sede.polygon || sede.polygon.length < 3) {
        console.error(`Polígono de la sede ${sede.name} no es válido.`);
        continue; // Si el polígono no es válido, sigue con la siguiente sede
      }

      console.log('Coordenadas del polígono:', sede.polygon);

      try {
        const polygon = new this.googleMaps.Polygon({ paths: sede.polygon });
        const isInside = this.googleMaps.geometry.poly.containsLocation(userLocation, polygon);

        console.log(`Resultado para la sede ${sede.name}: ${isInside}`);

        if (isInside) {
          console.log(`Ubicación dentro de la sede: ${sede.name}`);
          return sede.name;
        }
      } catch (error) {
        console.error(`Error al verificar el polígono para la sede ${sede.name}:`, error);
      }
    }

    console.log('Punto fuera de todas las sedes.');
    return null;
  }
}
