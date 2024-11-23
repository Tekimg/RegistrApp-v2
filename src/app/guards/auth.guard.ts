import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const isLoggedIn = !!localStorage.getItem('token');
    console.log("Está logeado?", isLoggedIn);

    if (!isLoggedIn) {
      this.router.navigate(['/login']); // Redirige al login si no está logueado
      return false;
    }
    return true;
  }
}
