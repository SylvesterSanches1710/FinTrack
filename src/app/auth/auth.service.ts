import { Injectable } from '@angular/core';

import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
} from '@angular/fire/auth';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // CURRENT USER

  user$: Observable<User | null>;

  currentUser: User | null = null;

  authReady = false;

  constructor(private auth: Auth) {
    this.user$ = authState(this.auth);

    // WAIT FOR FIREBASE SESSION

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;

      this.authReady = true;
    });
  }

  // SIGN UP

  signup(email: string, password: string) {
    return createUserWithEmailAndPassword(
      this.auth,

      email,

      password,
    );
  }

  // LOGIN

  login(email: string, password: string) {
    return signInWithEmailAndPassword(
      this.auth,

      email,

      password,
    );
  }

  // LOGOUT

  logout() {
    return signOut(this.auth);
  }
}
