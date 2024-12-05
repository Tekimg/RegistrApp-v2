import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SantoralService } from 'src/app/services/santoral.service';
import { HttpClient } from '@angular/common/http';

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
  santos: any[] = []; 

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
  async obtenerSantos() {
    await this.santoralService.getSantosDelDia().subscribe(
      (response) => {
        console.log('Santos del día:', response);

        const allSantos = response.data;

        const now = new Date();
        const mesActual = now.toLocaleString('es-ES', { month: 'long' }).toLowerCase(); 
        const diaActual = now.getDate(); 

        const santosHoy = allSantos[mesActual]?.[diaActual - 1]; 

        if (typeof santosHoy === 'string') {
          this.santos = [santosHoy];
        } else if (Array.isArray(santosHoy)) {
          this.santos = santosHoy;
        } else {
          this.santos = []; 
        }

        console.log('Santos procesados (hoy):', this.santos);
        console.log('Santos para mostrar:', this.santos);
      },
      (error) => {
        console.error('Error al obtener los santos del día:', error);
      }
    );
  }

  //cargar los usuarios desde Firebase
  loadUsers() {
    this.firebaseService.getCollectionChanges<User>('Users').subscribe(data => {
      if (data) {
        this.users = data; 
        console.log('Usuarios cargados desde Firebase:', this.users);

        const storedEmail = localStorage.getItem('credenciales');
        
        if (storedEmail) {
          const credenciales = JSON.parse(storedEmail);
          const email = credenciales.email;

          this.filterUserByEmail(email);
        }
      }
    });
  }

  filterUserByEmail(email: string) {
    const user = this.users.find(userData => userData.email === email);
    
    if (user) {
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
      localStorage.setItem('userId',user.id)
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
    localStorage.removeItem('userId');
    console.log('id',localStorage.getItem('userId'))
    this.router.navigate(['/login']);
  }
}
