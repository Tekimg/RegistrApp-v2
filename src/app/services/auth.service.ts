import { Injectable } from '@angular/core';
import { Auth, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, deleteUser } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  user: User;

  constructor(

    private auth: Auth,
    private router: Router

  ) { 

    
  }

  async loginAuth(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass)
  }
  logout() {
    this.auth.signOut();
    

  }
  register(newUser: User) {
    return createUserWithEmailAndPassword(this.auth, newUser.email, newUser.pass)
  }
  getId() {
    const user = this.auth.currentUser
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }
  getUser(): Observable<any> {
    return new Observable((observer) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          observer.next(user);
        } else {
          observer.next(null);
        }
      });
    });
  }
 

}
