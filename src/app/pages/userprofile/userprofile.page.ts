import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService, } from 'src/app/services/firebase.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.page.html',
  styleUrls: ['./userprofile.page.scss'],
})
export class UserprofilePage implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;  
  isEditing: boolean = false;

  // Alerta de eliminación de usuario
  alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
    },
    {
      text: 'Eliminar',
      role: 'confirm',
      handler: () => {
        this.eliminarUser();
      },
    },
  ];

  constructor(
    private firebaseService: FirebaseService,
    private toast:ToastController,
    private router:Router,
    private authService:AuthService,
    private alertController: AlertController) {}

  
  // Mostrar alerta de confirmación para eliminar usuario
  async showDeleteAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          },
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => {
            // Llama a eliminarUser solo al confirmar
            this.eliminarUser();
          },
        },
      ],
    });

    await alert.present();
  }

  ngOnInit() {
    this.loadUsers();
  }

  // Cargar usuarios 
  loadUsers() {
    this.firebaseService.getCollectionChanges<User>('Users').subscribe(data => {
      if (data) {
        this.users = data; 
        console.log('Usuarios cargados desde Firebase:', this.users);

        // Recuperar el email d
        const storedEmail = localStorage.getItem('credenciales');
        
        if (storedEmail) {
          const credenciales = JSON.parse(storedEmail);
          const email = credenciales.email;

          this.filterUserByEmail(email);
        }
      }
    });
  }

  // Función para filtrar
  filterUserByEmail(email: string) {
    const user = this.users.find(u => u.email === email);
    
    if (user) {
      this.currentUser = user;
      console.log('Usuario filtrado:', this.currentUser);
      console.log('id',this.currentUser.id);
      
    }
  }

  //editar informacion de usuario
  enableEdit() {
    this.isEditing = true;
  }
  async confirmEdit() {
    try {
      // Validación de currentUser
      if (this.currentUser) {
        // Actualizar los datos
        await this.firebaseService.updateDocument(this.currentUser, 'Users', this.currentUser.id);
        this.msgToast('Perfil actualizado correctamente', 'success');
        console.log('nuevos datos:', this.currentUser)
        
        this.isEditing = false;
      } else {
        // Mostrar un mensaje de error si no hay usuario
        this.msgToast('No hay un usuario autenticado para actualizar', 'danger');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      this.msgToast('Error al actualizar el perfil', 'danger');
    }
  }
  
  //eliminar usuario
  async deleteUserAcc(collection: string, userId: string) {
    //eliminar el usuario de Firebase Auth
    try {
      //eliminar el documento de Firestore
      await this.firebaseService.deleteDocAuth(collection, userId);
       
      console.log('DOcumento eliminado');
    } catch (error) {
      console.error('Error al eliminar documento de usuario:', error);
    }
  }
  
  async eliminarUser(){
    // mensaje de confirmacion

    //funcion eliminar
    const userId = this.currentUser.id;  // O cualquier otro campo único que identifique al usuario
    const collection = 'Users';  // Nombre de la colección en Firestore
    
    await this.deleteUserAcc(collection,userId);
    this.msgToast('Usuario eliminado exitosamente, redirigiendo a login', 'succes')
    this.router.navigate(['/login']);
  }


  async msgToast(message: string, color: string){
    const toast = await this.toast.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: color
    });
    
  }
}
