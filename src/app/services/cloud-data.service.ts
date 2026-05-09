import { Injectable } from '@angular/core';

import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class CloudDataService {
  constructor(
    private firestore: Firestore,

    private auth: Auth,
  ) {}

  // =====================
  // SAVE DATA
  // =====================

  async saveUserData(
    key: string,

    data: any,
  ) {
    const user = this.auth.currentUser;

    if (!user) {
      return;
    }

    const ref = doc(
      this.firestore,

      `users/${user.uid}/finance/${key}`,
    );

    await setDoc(ref, { data });
  }

  // =====================
  // LOAD DATA
  // =====================

  async loadUserData(key: string) {
    const user = this.auth.currentUser;

    if (!user) {
      return null;
    }

    const ref = doc(
      this.firestore,

      `users/${user.uid}/finance/${key}`,
    );

    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      return snapshot.data()['data'];
    }

    return null;
  }
}
