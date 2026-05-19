import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

import { getAuth, provideAuth } from '@angular/fire/auth';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({
      eventCoalescing: true,
    }),

    provideRouter(routes),

    // FIREBASE

    provideFirebaseApp(() => initializeApp(environment.firebase)),

    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideHttpClient(),
  ],
};
