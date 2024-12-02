import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
/* agregar el loading */
export class RegisterPage implements OnInit {
  newUser: User;
  confirmPass: string;
  emailP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  rutP: string = '^[0-9]{7,8}-[0-9Kk]{1}$';

  constructor(
    private firebaseService: FirebaseService,
    private toast: ToastController,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initUser()
  }





  isRutValid(): boolean {
    const rut = this.newUser.rut ? String(this.newUser.rut) : '';
    const rutRegex = new RegExp(this.rutP);
    const isValid = rutRegex.test(rut);
    return isValid;
  }

  initUser() {
    this.newUser = {
      id: this.firebaseService.createIdDoc(),
      rut: null,
      name: null,
      lastname: null,
      email: null,
      cel: null,
      pass: null
    }; this.confirmPass = null;
  }
  blockLettersAndAllowDelete(event: KeyboardEvent) {
    const key = event.key;

    // Permitir la tecla 'Backspace'y'Delete'
    if (key === 'Backspace' || key === 'Delete') {
      return;  
    }

    // Bloquear cualquier tecla que no sea un número
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();  
    }
  }


  async register() {

    // Verificación de campos 
    if (!this.newUser.rut || !this.newUser.name || !this.newUser.lastname || !this.newUser.email || !this.newUser.cel || !this.newUser.pass || !this.confirmPass) {
      this.msgToast('Todos los campos son obligatorios', 'tertiary');
    }
    else if (this.newUser.pass !== this.confirmPass) {
      this.msgToast('Las contraseñas no coinciden', 'danger');
    }
    else if (!this.emailP.test(this.newUser.email)) {
      this.msgToast('Correo electrónico no válido', 'danger');
    }
    else if (this.newUser.pass.length < 6) {
      this.msgToast('La contraseña debe tener al menos 6 caracteres', 'danger');
    }
    else if (!this.isRutValid()) {  
      this.msgToast('El RUT ingresado no es válido', 'danger');
    }

    else {
      console.log('datos', this.newUser)
      const userWithSameRut = await this.firebaseService.getDocumentByField('Users', 'rut', this.newUser.rut);

      if (userWithSameRut) {
        this.msgToast('El RUT ya está en uso', 'danger');
      } else {
        // Si el RUT no está en uso, proceder a registrar al usuario
        const res = await this.auth.register(this.newUser).catch(error => {
          if (error.code === 'auth/email-already-in-use') {
            this.msgToast('El correo electrónico ya está en uso', 'danger');
          } else {
            console.error('Error al guardar el documento:', error);
            this.msgToast('Error al crear el usuario', 'danger');
          }
        });

        if (res) {

          const path = 'Users'
          const id = this.newUser.id
          this.newUser.pass = null
          await this.firebaseService.createDocumentID(this.newUser, path, id)
          this.msgToast('Usuario creado correctamente', 'success')
          this.initUser()
          this.router.navigate(['/login'])
        }

      }


    }
  }
 async msgToast(message: string, color: string){
      const toast = await this.toast.create({
        message: message,
        duration: 2500,
        position: 'bottom',
        color: color
      });
      await toast.present();
    }
}
