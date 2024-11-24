import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements AfterViewInit, OnInit {
  asistencias: any[] = [];  
  public name: string = ''; 
  public currentUser: User | null = null; 
  users: any[] = [];  

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Aquí solo cargamos los datos si no existen
    const storedUser = this.authService.getCurrentUser();
    if (storedUser) {
      this.loadUserAndAsistencias();
    } else {
      console.error('No hay usuario autenticado');
    }
  }

  ngAfterViewInit() {
    // Si no hay usuario autenticado, solo cargamos la información una vez
    if (this.currentUser) {
      this.loadAsistencias(this.currentUser.id);
    }
  }

  // Cargar el usuario autenticado y sus asistencias
  async loadUserAndAsistencias() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('No hay un usuario autenticado.');
      return;
    }

    this.name = currentUser.name;

    await this.loadAsistencias(currentUser.id);
  }

  async loadAsistencias(userId: string) {
    try {
      // Obtener asistencias desde Firebase para el usuario autenticado
      const asistencias = await this.firebaseService.obtenerAsistenciasPorUsuario(userId);
      this.asistencias = asistencias;
      console.log('Asistencias del usuario:', this.asistencias);
    } catch (error) {
      console.error('Error al cargar las asistencias:', error);
    }
  }

  
}
