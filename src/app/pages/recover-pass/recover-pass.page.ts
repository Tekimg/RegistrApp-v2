import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Asegúrate de tener este import
import { FirebaseService } from 'src/app/services/firebase.service';


@Component({
  selector: 'app-recover-pass',
  templateUrl: './recover-pass.page.html',
  styleUrls: ['./recover-pass.page.scss'],
})
export class RecoverPassPage implements OnInit {
  username: string = ''; // Variable para el correo
  newPass: string = ''; // Variable para la nueva contraseña
  userFound: boolean = false; // Variable para verificar si el usuario existe

  constructor(
    private toastController: ToastController,
    private router: Router,
    private afAuth: AngularFireAuth,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {}

  async msgToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }

  // Función para buscar usuario y enviar correo de recuperación
  async findUser() {
    if (!this.username) {
      await this.msgToast('Por favor ingrese un correo', 'danger');
      return;
    }
  
    // Verificar si el correo existe en la colección 'Users'
    const userExists = await this.firebaseService.findUserByEmail(this.username);
  
    if (!userExists) {
      await this.msgToast('El correo no está registrado', 'danger');
      this.username = ''; // Limpiar el campo
    } else {
      // Si el correo existe, enviar correo para restablecer la contraseña
      await this.firebaseService.sendPasswordReset(this.username);
      this.router.navigate(['/login']);
    }
  }
  
}
