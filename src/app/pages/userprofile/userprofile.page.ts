import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.page.html',
  styleUrls: ['./userprofile.page.scss'],
})
export class UserprofilePage implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;  
  isEditing: boolean = false;

  // Expresiones regulares para validación
  emailP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  rutP: string = '^[0-9]{7,8}-[0-9Kk]{1}$';

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
    private toast: ToastController,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController) {}

  ngOnInit() {
    this.loadUsers();
  }

  // Validación del RUT
  isRutValid(): boolean {
    const rut = this.currentUser?.rut ? String(this.currentUser.rut) : '';
    const rutRegex = new RegExp(this.rutP);
    return rutRegex.test(rut);
  }

  // Validación del correo electrónico
  isEmailValid(): boolean {
    const email = this.currentUser?.email ? String(this.currentUser.email) : '';
    return this.emailP.test(email);
  }

  // Bloquear letras en el número telefónico
  blockLettersAndAllowDelete(event: KeyboardEvent) {
    const key = event.key;

    // Permitir la tecla 'Backspace' o 'Delete'
    if (key === 'Backspace' || key === 'Delete') {
      return;  
    }

    // Bloquear cualquier tecla que no sea un número
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
    }
  }

  loadUsers() {
    this.firebaseService.getCollectionChanges<User>('Users').subscribe(data => {
      if (data) {
        this.users = data; 
        const storedEmail = localStorage.getItem('credenciales');
        
        if (storedEmail) {
          const credenciales = JSON.parse(storedEmail);
          const email = credenciales.email;

          this.filterUserByEmail(email);
        }
      }
    });
  }

  // Filtrar el usuario por correo electrónico
  filterUserByEmail(email: string) {
    const user = this.users.find(u => u.email === email);
    
    if (user) {
      this.currentUser = user;
    }
  }

  enableEdit() {
    this.isEditing = true;
  }

  async confirmEdit() {
    if (!this.isRutValid()) {
      this.msgToast('El RUT ingresado no es válido', 'danger');
      return;
    }

    if (!this.isEmailValid()) {
      this.msgToast('Correo electrónico no válido', 'danger');
      return;
    }

    if (!this.currentUser?.cel || String(this.currentUser?.cel).length < 9) {
      this.msgToast('Número telefónico no válido', 'danger');
      return;
    }
    
    try {
      // Actualizar los datos
      await this.firebaseService.updateDocument(this.currentUser, 'Users', this.currentUser.id);
      this.msgToast('Perfil actualizado correctamente', 'success');
      this.isEditing = false;
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      this.msgToast('Error al actualizar el perfil', 'danger');
    }
  }

  async eliminarUser() {
    const userId = this.currentUser?.id;  
    const collection = 'Users';  
    
    try {
      await this.firebaseService.deleteDocAuth(collection, userId);
      this.msgToast('Usuario eliminado exitosamente', 'success');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      this.msgToast('Error al eliminar usuario', 'danger');
    }
  }

  // Mostrar un Toast con el mensaje
  async msgToast(message: string, color: string) {
    const toast = await this.toast.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  // Mostrar la alerta para eliminar el perfil
  async showDeleteAlert() {
    const alert = await this.alertController.create({
      header: 'Eliminar cuenta',
      message: '¿Estás seguro de que deseas eliminar tu cuenta?',
      buttons: this.alertButtons
    });
    await alert.present();
  }
}
