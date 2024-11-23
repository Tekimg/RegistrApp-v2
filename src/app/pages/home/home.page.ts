import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public name: string = ''; 
  public currentUser: User | null = null; 
  users: any[] = []; 

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private authService: AuthService
  ) {const navigation = this.router.getCurrentNavigation();}

  ngOnInit() {
   
    // Cargar los usuarios desde Firebase
    this.loadUsers();
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
