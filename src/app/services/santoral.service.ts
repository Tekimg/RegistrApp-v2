import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SantoralService {
  private apiUrl = 'https://api.boostr.cl/santorales'; // URL directa

  constructor(private http: HttpClient) {}

  getSantosDelDia(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error al obtener los santos:', error);
        return throwError(() => new Error('Error al obtener los santos'));
      })
    );
  }
}