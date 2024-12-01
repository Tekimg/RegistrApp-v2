import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';

import { SantoralService } from 'src/app/services/santoral.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public name: string = ''; 
  public currentUser: User | null = null; 
  users: any[] = []; 

  // Santoral
  santos: any[] = []; // Variable para almacenar los datos de la API

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private authService: AuthService,
    private santoralService: SantoralService
  ) {const navigation = this.router.getCurrentNavigation();}

  ngOnInit() {
   
    // Cargar los usuarios desde Firebase
    this.loadUsers();

    // Cargar los santos del día
    this.obtenerSantos();

  }

  // Método para obtener los santos del día
  obtenerSantos() {
    this.santoralService.getSantosDelDia().subscribe(
      (response) => {
        console.log('Santos del día:', response);

        // Extrae los datos por meses y días
        const allSantos = response.data;

        // Fecha actual
        const now = new Date();
        const mesActual = now.toLocaleString('es-ES', { month: 'long' }).toLowerCase(); // Ej: 'noviembre'
        const diaActual = now.getDate(); // Día del mes (1-31)

        // Accede al mes y día correspondiente
        const santosHoy = allSantos[mesActual]?.[diaActual - 1]; // Restamos 1 porque los arrays son 0-indexados

        // Si es un string, lo convertimos en un array para que *ngFor funcione
        if (typeof santosHoy === 'string') {
          this.santos = [santosHoy];
        } else if (Array.isArray(santosHoy)) {
          this.santos = santosHoy;
        } else {
          this.santos = []; // Si no hay santos, asignamos un array vacío
        }

        console.log('Santos procesados (hoy):', this.santos);
        console.log('Santos para mostrar:', this.santos);
      },
      (error) => {
        console.error('Error al obtener los santos del día:', error);
      }
    );
  }

  // Función para cargar los usuarios desde Firebase
  loadUsers() {
    this.firebaseService.getCollectionChanges<User>('Users').subscribe(data => {
      if (data) {
        this.users = data; // Almacenar los usuarios en el array 'users'
        console.log('Usuarios cargados desde Firebase:', this.users);

        // Recuperar el correo del localStorage
        const storedEmail = localStorage.getItem('credenciales');
        
        if (storedEmail) {
          const credenciales = JSON.parse(storedEmail);
          const email = credenciales.email;

          // Filtrar por el correo del usuario de la sesión
          this.filterUserByEmail(email);
        }
      }
    });
  }

  // Función para filtrar el usuario que corresponde al correo de la sesión
  filterUserByEmail(email: string) {
    // Filtramos el array de usuarios para encontrar el que coincida con el correo de la sesión
    const user = this.users.find(userData => userData.email === email);
    
    if (user) {
      // Extraemos la información relevante
      this.name = user.name;
      this.currentUser = {
        id: user.id,
        pass: user.pass,
        rut: user.rut,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        cel: user.cel
      };
      this.authService.setCurrentUser(this.currentUser)
      // Mostrar la información del usuario encontrado
      console.log('Datos del usuario:', this.currentUser);
    }
  }
  logout(){
    localStorage.removeItem('credenciales');
    console.log('cred',localStorage.getItem('credenciales'))
    localStorage.removeItem('user');
    console.log('user',localStorage.getItem('user'))
    localStorage.removeItem('token');
    console.log('toke',localStorage.getItem('token'))
    this.router.navigate(['/login']);
  }
}
