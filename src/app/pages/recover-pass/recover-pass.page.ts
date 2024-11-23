import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-recover-pass',
  templateUrl: './recover-pass.page.html',
  styleUrls: ['./recover-pass.page.scss'],
})
export class RecoverPassPage implements OnInit {
  username: string = '';
  newPass: string = '';
  userFound: boolean = false; 

  constructor(
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {}

/*
  findUser() {
    const found = this.loginService.findUserByUsername(this.username);
    if (found) {
      this.userFound = true;
      this.msgToast('Usuario encontrado','sucess');
    } else {
      this.userFound = false;
      this.msgToast('Usuario no encontrado','danger');
    }
  }

  updatePass() {
    if (this.newPass.trim() !== '') {
      this.loginService.updateUserPass(this.username, this.newPass);
      this.msgToast('Cambio realizado','success');
      this.userFound = false;
      this.username = '';
      this.newPass = '';
      this.router.navigate(['/login']); 
    } else {
      this.msgToast('Ingrese una contraseña','danger');;
  }}
*/
  async msgToast(message: string, color: string){
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}
