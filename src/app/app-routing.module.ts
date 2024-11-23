import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';



const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate:[authGuard]
  },
  { 
    path: 'escaneo-qr',
    loadChildren: () => import('./pages/escaneo-qr/escaneo-qr.module').then( m => m.EscaneoQrPageModule),
    canActivate:[authGuard]
  }, 
 
  {
    path: 'recover-pass',
    loadChildren: () => import('./pages/recover-pass/recover-pass.module').then( m => m.RecoverPassPageModule)
  },
 
  {
    path: 'users',
    loadChildren: () => import('./pages/users/users.module').then( m => m.UsersPageModule),
    canActivate:[authGuard]
  },

  {
    path: 'userprofile',
    loadChildren: () => import('./pages/userprofile/userprofile.module').then(m => m.UserProfilePageModule),
    canActivate:[authGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
 
  {
    path:'**', 
    redirectTo:'notfoundpage'
  },





  //redirigir paginas no encontradas - final del codigo
  {
    path: 'notfoundpage',
    loadChildren: () => import('./pages/notfoundpage/notfoundpage.module').then( m => m.NotfoundpagePageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
